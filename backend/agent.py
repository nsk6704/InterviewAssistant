from groq import Groq
from typing import List, Dict
import json
from models import InterviewConfig, FeedbackResponse
from interviewer_profiles import get_random_interviewer

class InterviewAgent:
    def __init__(self, api_key: str, config: InterviewConfig):
        self.client = Groq(api_key=api_key)
        self.config = config
        self.history: List[Dict[str, str]] = []
        self.user_response_count = 0  # Track actual user responses
        
        # Select random interviewer with name and gender
        self.interviewer = get_random_interviewer()
        
        self.system_prompt = self._create_system_prompt()
        
        # Initialize history with system prompt
        self.history.append({"role": "system", "content": self.system_prompt})

    def _create_system_prompt(self) -> str:
        prompt = f"""You are {self.interviewer['name']}, an expert technical interviewer conducting a mock interview for the role of {self.config.role}.
Difficulty Level: {self.config.difficulty}.

Your goal is to assess the candidate's technical skills, problem-solving approach, communication ability, and cultural fit.
"""
        if self.config.resume_text:
            prompt += f"\nCandidate's Resume Context:\n{self.config.resume_text}\n"
            
        prompt += f"""
Core Interview Guidelines:
1. Introduce yourself as {self.interviewer['name']} and ask the candidate to introduce themselves. Do not ask a technical question yet.
2. Ask ONE focused question at a time. Never overwhelm with multiple questions.
3. Listen actively and ask intelligent follow-up questions based on their answers.
4. If uncertain about their response, probe deeper to understand their thought process.
5. Maintain a professional yet supportive tone throughout.
6. Keep responses concise (under 100 words) unless explaining complex concepts.

Adaptive Conversation Management:

★ For Confused/Uncertain Candidates:
- Notice hesitation and provide gentle clarification
- Break down complex questions into simpler parts
- Offer hints without giving away answers
- Example: "Let me rephrase that. What I'm really asking is..."

★ For Efficient/Direct Candidates:
- Appreciate concise answers and move quickly
- Ask deeper technical questions
- Challenge them with follow-ups
- Example: "Good. Now let's go deeper..."

★ For Chatty/Off-Topic Candidates:
- Politely redirect back to the question
- Acknowledge their points but refocus
- Set clear boundaries professionally
- Example: "That's interesting, but let's focus on [topic]. Can you tell me..."

★ For Edge Cases (Invalid/Unclear Inputs):
- Handle gracefully without embarrassment
- Ask clarifying questions
- If completely off-topic, gently steer back
- If beyond your scope, acknowledge limitations honestly
- Example: "I'm not sure I understand. Could you clarify what you mean by..."

Remember: Stay professional, adaptable, and focused on helping the candidate demonstrate their best abilities."""
        return prompt

    def generate_response(self, user_input: str) -> str:
        # Add user message to history
        self.history.append({"role": "user", "content": user_input})
        
        # Count substantive user responses (ignore greetings like "Hello")
        if len(user_input.strip()) > 10 and user_input.lower() not in ["hello", "hi", "hey"]:
            self.user_response_count += 1
        
        try:
            # Try Llama 4 Maverick first
            completion = self.client.chat.completions.create(
                model="meta-llama/llama-4-maverick-17b-128e-instruct",
                messages=self.history,
                temperature=0.7,
                max_tokens=500,
                top_p=1,
                stream=False,
                stop=None,
            )
        except Exception as e:
            # Fallback to llama-3.3-70b-versatile if Maverick is down
            print(f"[WARN] Llama 4 Maverick unavailable, falling back to llama-3.3-70b-versatile: {str(e)}")
            completion = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=self.history,
                temperature=0.7,
                max_tokens=500,
                top_p=1,
                stream=False,
                stop=None,
            )
        
        assistant_message = completion.choices[0].message.content
        self.history.append({"role": "assistant", "content": assistant_message})
        
        return assistant_message

    def generate_feedback(self) -> FeedbackResponse:
        # Check if there's sufficient interaction to provide feedback
        if self.user_response_count < 2:
            return FeedbackResponse(
                strengths=["Showed up for the interview"],
                improvements=[
                    "Insufficient interaction to provide meaningful feedback. Please engage more fully with the interview questions.",
                    "Try to provide detailed answers to at least 2-3 questions to receive a comprehensive evaluation."
                ],
                technical_score=0,
                communication_score=0,
                overall_feedback="Unable to provide a comprehensive assessment due to insufficient interview interaction. To receive detailed feedback, please engage with multiple interview questions and provide substantive answers. This allows for a proper evaluation of your technical knowledge and communication skills."
            )
        
        # Create a comprehensive feedback prompt
        feedback_prompt = """The interview is over. Analyze the entire conversation and provide comprehensive feedback in JSON format.

Analyze the candidate across these dimensions:
1. Technical Knowledge: Depth and accuracy of technical responses
2. Problem-Solving: Approach to breaking down problems
3. Communication: Clarity, structure, and articulation of thoughts
4. Adaptability: How they handled different question types
5. Engagement: Enthusiasm and interaction quality

CRITICAL INSTRUCTIONS FOR COMMUNICATION SCORING:
- Communication is MORE than just grammar. Evaluate:
  * CLARITY: Did they explain concepts in an understandable way?
  * STRUCTURE: Did they organize their thoughts logically (e.g., "First... then... finally...")?
  * CONCISENESS: Did they avoid rambling or being too brief?
  * ENGAGEMENT: Did they ask clarifying questions when needed?
  * ARTICULATION: Did they use appropriate technical vocabulary?
  * LISTENING: Did they directly answer the question or go off-topic?
- A candidate with perfect grammar but poor structure should score LOW
- A candidate with minor grammar issues but excellent clarity should score HIGH
- Reference specific examples from the conversation

The JSON must strictly follow this schema:
{
    "strengths": ["specific strength 1 with example from conversation", "specific strength 2 with example", "specific strength 3 with example"],
    "improvements": ["specific area 1 with actionable advice and example", "specific area 2 with actionable advice and example"],
    "technical_score": <integer 0-100>,
    "communication_score": <integer 0-100>,
    "overall_feedback": "A comprehensive 3-4 sentence summary covering: technical performance, communication quality (clarity, structure, engagement), and key recommendation for improvement. Be specific and reference actual moments from the interview."
}

Important:
- Be specific: Reference actual moments from the interview
- Be actionable: Provide clear next steps
- Be balanced: Find genuine strengths even if performance was weak
- Be honest: Don't inflate scores, but be constructive
- Communication score should reflect more than grammar - focus on clarity, structure, and engagement
- If they struggled with communication, explain WHY (e.g., "lacked structure" not just "poor communication")

Do not output anything else besides the JSON."""

        # We send the whole history plus the feedback request
        messages = self.history.copy()
        messages.append({"role": "user", "content": feedback_prompt})
        
        try:
            # Try Llama 4 Maverick first
            completion = self.client.chat.completions.create(
                model="meta-llama/llama-4-maverick-17b-128e-instruct",
                messages=messages,
                temperature=0.5,
                response_format={"type": "json_object"}
            )
        except Exception as e:
            # Fallback to llama-3.3-70b-versatile
            print(f"[WARN] Llama 4 Maverick unavailable for feedback, falling back to llama-3.3-70b-versatile: {str(e)}")
            completion = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.5,
                response_format={"type": "json_object"}
            )
        
        feedback_json = json.loads(completion.choices[0].message.content)
        
        return FeedbackResponse(**feedback_json)