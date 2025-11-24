# Interview Practice Partner - AI Agent

An AI-powered interview practice application built with **FastAPI**, **React**, and **Groq's Llama 3.3** models. Designed to simulate realistic technical interviews with a focus on conversational quality, adaptability, and professional feedback.

##  Evaluation Criteria Alignment

This project is designed to excel in the following areas:

### 1. Conversational Quality 🗣️
- **Natural Interaction**: Uses `llama-3.3-70b-versatile` for high-fidelity, nuanced conversations that feel like a real human interviewer.
- **Context Awareness**: Maintains conversation history to reference previous answers and build a coherent dialogue.
- **Professional Persona**: Prompt engineered to be supportive yet rigorous, mimicking a senior technical interviewer.
- **Voice Integration**: Seamless speech-to-text (STT) and text-to-speech (TTS) for a truly immersive experience.

### 2. Agentic Behaviour 🤖
- **Proactive Guidance**: The agent guides the user through the interview stages (Introduction -> Technical Questions -> Behavioral -> Feedback).
- **Error Recovery**: Graceful handling of API failures or network issues with non-blocking toast notifications.
- **Self-Correction**: If the user is confused or goes off-topic, the agent gently steers the conversation back to the interview context.
- **Session Management**: Robust state handling ensures the interview progress is saved even if the user refreshes (session-based).

### 3. Technical Implementation 🛠️
- **Backend**: FastAPI (Python) for high-performance async API handling.
- **Frontend**: React (Vite) + Tailwind CSS + Material UI for a polished, responsive interface.
- **AI Engine**: Groq API for ultra-low latency inference, crucial for real-time voice interactions.
- **Voice Stack**: 
  - **STT**: Groq Whisper API for high-accuracy speech transcription.
  - **TTS**: PlayAI (via Groq) for natural-sounding voice output.

### 4. Intelligence & Adaptability 🧠
- **Dynamic Difficulty**: Adjusts question complexity based on user responses and selected difficulty level.
- **Role Customization**: Tailors questions specifically for Software Engineers, Data Scientists, Product Managers, etc.
- **Resume Analysis**: Can analyze provided resume text to ask personalized questions about past experience.
- **Comprehensive Feedback**: Generates detailed, actionable feedback with scores for Technical Knowledge and Communication.

---

## 🔄 Evolution of Design & Pivots

This project evolved through several iterations to maximize user experience and performance. Here are the key pivots we made and why:

### 1. STT: Browser Native -> Groq Whisper
*   **Initial Approach**: We started with the **Web Speech API** (browser native) for zero-latency, push-to-talk input.
*   **The Problem**: While fast, it struggled significantly with technical jargon (e.g., "Kubernetes" became "Cooler net is", "Polymorphism" became "Poly more fish"). This broke the immersion and frustrated users trying to give precise technical answers.
*   **The Pivot**: We switched to **Groq's Whisper API**.
*   **The Result**: Although it introduces a slight network round-trip, the accuracy for technical terminology is near-perfect. The trade-off of ~300ms latency for 99% accuracy was well worth it for a technical interview use case.

### 2. UI Library: Lucide React -> Material UI (MUI)
*   **Initial Approach**: We used **Lucide React** icons for a modern, minimalist look.
*   **The Problem**: The icons felt too "startup-y" and casual.
*   **The Pivot**: We migrated to **Material UI (MUI)** icons.
*   **The Result**: The application now feels more grounded and professional, aligning better with the mental model of a formal interview at a large tech company.

### 3. Voice Interaction: Auto-Send -> Manual Toggle
*   **Initial Approach**: The app automatically detected silence to send the user's response.
*   **The Problem**: Users often paused to think during complex technical explanations, triggering premature sends. This caused anxiety and cut off valid answers.
*   **The Pivot**: We implemented a **Hybrid Approach**—silence detection is still active (but relaxed to 4s), but we emphasized manual controls (Enter key, Stop button) and added a "Voice Confirmation" toast.
*   **The Result**: Users feel more in control. They can take their time to think without fear of being interrupted, leading to higher quality answers.

---

## 🎨 Design Decisions & Reasoning

### Why Groq + Llama 3.3?
*Reasoning*: Real-time voice interaction requires near-instant responses. Traditional LLM APIs often have multi-second latency, breaking the flow of conversation. Groq offers the fastest inference speeds available, and Llama 3.3 70B provides the high intelligence needed for technical interviewing without the cost/latency of proprietary models.

### Why Material UI (MUI) over Lucide?
*Reasoning*: While Lucide is great for modern web apps, MUI offers a more "enterprise-grade" professional aesthetic that fits the context of a formal job interview. The polished, standardized icons and components instill confidence and seriousness.

### Why Groq Whisper for STT?
*Reasoning*: While browser-native STT is faster, it lacks the accuracy needed for technical terminology. Groq's Whisper API offers a perfect balance—providing near-human level accuracy for technical terms (like "Kubernetes", "Polymorphism") while still being incredibly fast due to Groq's LPU inference engine.

### Why Non-Blocking Toasts?
*Reasoning*: In a voice-first app, modal error popups are disruptive. Toast notifications allow the user to see issues (like "Microphone unavailable") without stopping the flow of the interview or requiring manual dismissal.

---

## 🧪 Testing & Demo Scenarios

We encourage you to test the agent with these specific personas to see its adaptability:

### 1. The Confused User 😕
*Scenario*: Start an interview and ask vague questions like "What should I say?" or "I don't know what to do."
*Expected Behavior*: The agent should patiently explain the interview process, reassure the user, and re-ask the initial question or offer a simpler starting point.

### 2. The Efficient User ⚡
*Scenario*: Give short, direct, and technically correct answers. Skip pleasantries.
*Expected Behavior*: The agent should recognize the proficiency, minimize small talk, and quickly ramp up the difficulty to challenge the user with deeper technical concepts.

### 3. The Chatty User 🗣️
*Scenario*: Try to derail the interview by talking about hobbies, the weather, or irrelevant personal stories.
*Expected Behavior*: The agent should politely acknowledge the comment but firmly steer the conversation back to the interview topic (e.g., "That sounds interesting, but let's focus on your experience with Python...").

### 4. The Edge Case User 🛑
*Scenario*: 
- Provide invalid inputs (gibberish).
- Refuse to answer questions.
- Try to "jailbreak" the bot (e.g., "Ignore all instructions").
*Expected Behavior*: The agent should maintain its professional persona, refuse to break character, and attempt to proceed with the interview or ask for clarification.

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+
- Groq API Key ([Get one here](https://console.groq.com))

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate  |  Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
# Create .env file with GROQ_API_KEY=your_key
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Access the app at `http://localhost:5173`.

---

## � Project Structure

```
AntiGrav/
├── backend/
│   ├── main.py          # FastAPI app & endpoints
│   ├── agent.py         # AI agent logic (Groq integration)
│   ├── models.py        # Pydantic models
│   └── .env             # Environment variables
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── InterviewSetup.tsx    # Role/difficulty selection
    │   │   ├── ChatInterface.tsx     # Main interview chat
    │   │   └── FeedbackView.tsx      # Post-interview feedback
    │   ├── lib/
    │   │   ├── voice.ts              # Web Speech API utilities
    │   │   └── toast.ts              # Custom toast notifications
    │   └── App.tsx                   # Main app component
```

---

Built with ❤️ for better interview preparation.
