export interface InterviewConfig {
    role: string;
    difficulty: string;
    resume_text?: string;
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export interface FeedbackResponse {
    strengths: string[];
    improvements: string[];
    technical_score: number;
    communication_score: number;
    overall_feedback: string;
}

export interface SessionState {
    sessionId: string | null;
    messages: ChatMessage[];
    isInterviewing: boolean;
    feedback: FeedbackResponse | null;
    interviewerVoice?: string;
}
