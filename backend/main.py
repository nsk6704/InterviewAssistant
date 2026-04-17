from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel
from typing import Dict
import uuid
from models import InterviewConfig, ChatRequest, FeedbackResponse
from agent import InterviewAgent
import os
from dotenv import load_dotenv
from groq import Groq
import tempfile
from pathlib import Path
import re

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session storage (for demo purposes)
sessions: Dict[str, InterviewAgent] = {}

ALLOWED_TTS_VOICES = {"autumn", "diana", "hannah", "austin", "daniel", "troy"}
DEFAULT_TTS_VOICE = "autumn"
DEFAULT_TTS_DIRECTION = "friendly"
MAX_ORPHEUS_INPUT_CHARS = 200
ALLOWED_TTS_DIRECTIONS = {
    "cheerful",
    "friendly",
    "casual",
    "warm",
    "professionally",
    "authoritatively",
    "formally",
    "confidently",
    "whisper",
    "excited",
    "dramatic",
    "deadpan",
    "sarcastic",
}


def normalize_tts_voice(voice: str) -> str:
    """Return a valid model voice, falling back when the input is invalid."""
    normalized = (voice or "").strip().lower()
    return normalized if normalized in ALLOWED_TTS_VOICES else DEFAULT_TTS_VOICE


def normalize_tts_direction(direction: str) -> str:
    """Return a safe vocal direction for Orpheus English."""
    normalized = (direction or "").strip().lower()
    return normalized if normalized in ALLOWED_TTS_DIRECTIONS else DEFAULT_TTS_DIRECTION


def sanitize_tts_text(text: str) -> str:
    """Clean markdown and formatting artifacts before speech synthesis."""
    cleaned = text or ""
    cleaned = re.sub(r"\*\*(.*?)\*\*", r"\1", cleaned, flags=re.DOTALL)
    cleaned = re.sub(r"__(.*?)__", r"\1", cleaned, flags=re.DOTALL)
    cleaned = cleaned.replace("`", "")
    cleaned = cleaned.replace("—", "-").replace("–", "-")
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip()


def build_orpheus_input(text: str, direction: str) -> str:
    """Build a valid Orpheus input with optional direction under 200 chars."""
    cleaned_text = sanitize_tts_text(text)
    safe_direction = normalize_tts_direction(direction)
    prefix = f"[{safe_direction}] "
    available_chars = MAX_ORPHEUS_INPUT_CHARS - len(prefix)

    if available_chars <= 0:
        return cleaned_text[:MAX_ORPHEUS_INPUT_CHARS]

    if len(cleaned_text) > available_chars:
        truncated = cleaned_text[:available_chars].rsplit(" ", 1)[0].strip()
        cleaned_text = truncated if truncated else cleaned_text[:available_chars]

    return f"{prefix}{cleaned_text}" if cleaned_text else prefix.strip()

@app.post("/start_interview")
async def start_interview(config: InterviewConfig):
    session_id = str(uuid.uuid4())
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not found")
    
    agent = InterviewAgent(api_key=api_key, config=config)
    sessions[session_id] = {"agent": agent}
    
    # Get initial greeting
    greeting = agent.generate_response("Hello, I'm ready for the interview.")
    
    return {
        "session_id": session_id,
        "greeting": greeting,
        "interviewer_name": agent.interviewer["name"],
        "interviewer_voice": agent.interviewer["voice"],
        "interviewer_direction": agent.interviewer.get("tts_direction", DEFAULT_TTS_DIRECTION)
    }

@app.post("/chat")
async def chat(request: ChatRequest):
    session_id = request.session_id
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        agent = sessions[session_id]["agent"]
        response = agent.generate_response(request.message)
        return {"response": response}
    except Exception as e:
        # Log error for devs
        print(f"[ERROR] Chat error for session {session_id}: {str(e)}")
        # Return graceful error to frontend (will be shown in toast)
        return JSONResponse(
            status_code=500,
            content={"detail": "Unable to generate response. Please try again."}
        )

class FeedbackRequest(BaseModel):
    session_id: str

@app.post("/feedback_result")
async def feedback_result(request: FeedbackRequest):
    session_id = request.session_id
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    agent = sessions[session_id]["agent"]
    feedback = agent.generate_feedback()
    
    # Cleanup session
    del sessions[session_id]
    
    return feedback

@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """Transcribe audio using Whisper via Groq"""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not found")
    
    try:
        # Read audio file
        audio_data = await audio.read()
        
        # Create Groq client
        client = Groq(api_key=api_key)
        
        # Transcribe with Whisper
        transcription = client.audio.transcriptions.create(
            file=(audio.filename, audio_data),
            model="whisper-large-v3",
            response_format="json"
        )
        
        return {"transcript": transcription.text}
    except Exception as e:
        print(f"[ERROR] Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.post("/tts")
async def text_to_speech(request: dict):
    """Convert text to speech via Groq TTS."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not found")
    
    text = request.get("text", "")
    requested_voice = request.get("voice", DEFAULT_TTS_VOICE)
    voice = normalize_tts_voice(requested_voice)
    requested_direction = request.get("direction", DEFAULT_TTS_DIRECTION)
    direction = normalize_tts_direction(requested_direction)
    
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    try:
        # Create Groq client
        client = Groq(api_key=api_key)
        
        print(f"[TTS] Generating speech for text: {text[:50]}...")
        
        if voice != (requested_voice or "").strip().lower():
            print(f"[TTS] Invalid voice '{requested_voice}' requested; falling back to '{voice}'")

        if direction != (requested_direction or "").strip().lower():
            print(f"[TTS] Invalid direction '{requested_direction}' requested; falling back to '{direction}'")

        orpheus_input = build_orpheus_input(text, direction)

        if len(orpheus_input) >= MAX_ORPHEUS_INPUT_CHARS:
            print("[TTS] Input reached Orpheus 200-char limit and was trimmed")

        # Generate speech with Groq TTS
        response = client.audio.speech.create(
            model="canopylabs/orpheus-v1-english",
            voice=voice,
            response_format="wav",
            input=orpheus_input
        )
        
        print(f"[TTS] Got response, streaming to file...")
        
        # Save to temp file and read
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
            tmp_path = Path(tmp_file.name)
        
        # Write outside the context manager to ensure file is closed
        response.write_to_file(tmp_path)
        audio_bytes = tmp_path.read_bytes()
        
        # Try to delete, but ignore errors (temp files will be cleaned up by OS)
        try:
            tmp_path.unlink()
        except:
            pass  # Ignore cleanup errors on Windows
        
        print(f"[TTS] Successfully generated {len(audio_bytes)} bytes of audio")
        
        return Response(content=audio_bytes, media_type="audio/wav")
    except Exception as e:
        print(f"[TTS] Error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")
