from pydantic import BaseModel
from typing import List, Optional

class InterviewConfig(BaseModel):
    role: str
    difficulty: str
    resume_text: Optional[str] = None

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: str

class FeedbackResponse(BaseModel):
    strengths: List[str]
    improvements: List[str]
    technical_score: int
    communication_score: int
    overall_feedback: str
