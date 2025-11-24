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
        "interviewer_voice": agent.interviewer["voice"]
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
    """Convert text to speech using PlayAI TTS via Groq"""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not found")
    
    text = request.get("text", "")
    voice = request.get("voice", "Ruby-PlayAI")  # Accept voice parameter
    
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    try:
        # Create Groq client
        client = Groq(api_key=api_key)
        
        print(f"[TTS] Generating speech for text: {text[:50]}...")
        
        # Generate speech with PlayAI
        response = client.audio.speech.create(
            model="playai-tts",
            voice=voice,  # Use the provided voice
            response_format="mp3",
            input=text
        )
        
        print(f"[TTS] Got response, streaming to file...")
        
        # Save to temp file and read
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp_file:
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
        
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        print(f"[TTS] Error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")
