import { useState } from 'react';
import InterviewSetup from './components/InterviewSetup';
import ChatInterface from './components/ChatInterface';
import FeedbackView from './components/FeedbackView';
import { api } from './lib/api';
import type { InterviewConfig, SessionState } from './types';

type AppState = 'setup' | 'interview' | 'feedback';

function App() {
  const [state, setState] = useState<AppState>('setup');
  const [session, setSession] = useState<SessionState>({
    sessionId: null,
    messages: [],
    isInterviewing: false,
    feedback: null,
    interviewerVoice: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleStartInterview = async (config: InterviewConfig) => {
    try {
      setIsLoading(true);
      const data = await api.startInterview(config);

      setSession({
        sessionId: data.session_id,
        messages: [{ role: 'assistant', content: data.greeting }],
        isInterviewing: true,
        feedback: null,
        interviewerVoice: data.interviewer_voice,
      });
      setState('interview');
    } catch (error) {
      console.error('Failed to start interview:', error);
      alert('Failed to start interview. Make sure the backend is running on http://localhost:8000');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!session.sessionId) return;

    // Add user message immediately
    const userMessage = { role: 'user' as const, content: message };
    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    try {
      setIsLoading(true);
      const data = await api.sendMessage(session.sessionId, message);

      // Add assistant response
      const assistantMessage = { role: 'assistant' as const, content: data.response };
      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
      }));
    } catch (error: any) {
      console.error('Failed to send message:', error);
      if (error.response && error.response.status === 404) {
        alert('Session expired. The server may have restarted. Please start a new interview.');
        handleRestart();
      } else {
        alert('Failed to send message. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndInterview = async () => {
    if (!session.sessionId) return;

    setSession((prev) => ({
      ...prev,
      isInterviewing: false,
      messages: [
        ...prev.messages,
        {
          role: 'assistant',
          content: 'Give me a moment to review your performance and compile detailed feedback...',
        },
      ],
    }));

    try {
      setIsLoading(true);
      const feedback = await api.getFeedback(session.sessionId);

      setSession((prev) => ({
        ...prev,
        feedback,
      }));
      setState('feedback');
    } catch (error) {
      console.error('Failed to get feedback:', error);
      alert('Failed to get feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setSession({
      sessionId: null,
      messages: [],
      isInterviewing: false,
      feedback: null,
      interviewerVoice: undefined,
    });
    setState('setup');
    setIsLoading(false);
  };

  return (
    <>
      {state === 'setup' && <InterviewSetup onStart={handleStartInterview} isLoading={isLoading} />}
      {state === 'interview' && (
        <ChatInterface
          messages={session.messages}
          onSendMessage={handleSendMessage}
          onEndInterview={handleEndInterview}
          isLoading={isLoading}
          interviewerVoice={session.interviewerVoice}
        />
      )}
      {state === 'feedback' && session.feedback && (
        <FeedbackView feedback={session.feedback} onNewInterview={handleRestart} />
      )}
    </>
  );
}

export default App;