import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/types';
import { startRecording, speak, stopSpeaking } from '@/lib/voice';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ChatIcon from '@mui/icons-material/Chat';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import SendIcon from '@mui/icons-material/Send';
import { showToast } from '@/lib/toast';

interface Props {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    onEndInterview: () => void;
    isLoading: boolean;
    interviewerVoice?: string;
}

export default function ChatInterface({
    messages,
    onSendMessage,
    onEndInterview,
    isLoading,
    interviewerVoice,
}: Props) {
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const lastSpokenIndexRef = useRef<number>(-1);

    // Scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        onSendMessage(input.trim());
        setInput('');
    };

    const toggleListening = async () => {
        if (isListening) {
            mediaRecorderRef.current?.stop();
            setIsListening(false);
            return;
        }

        try {
            const recorder = await startRecording(
                (transcript) => {
                    setInput(transcript);
                    setIsListening(false);
                },
                (error) => {
                    console.error('Recording error:', error);
                    setIsListening(false);
                }
            );
            if (recorder) {
                mediaRecorderRef.current = recorder;
                setIsListening(true);
            }
        } catch (err) {
            const msg = (err as Error).message;
            showToast(`Microphone unavailable: ${msg}`, 'error');
        }
    };

    const toggleSpeaking = () => {
        if (isSpeaking) {
            stopSpeaking();
        }
        setIsSpeaking(!isSpeaking);
    };

    // Speak assistant messages when they appear
    useEffect(() => {
        if (!isSpeaking) return;
        const lastIdx = messages.length - 1;
        const lastMsg = messages[lastIdx];
        if (
            lastMsg &&
            lastMsg.role === 'assistant' &&
            interviewerVoice &&
            lastSpokenIndexRef.current !== lastIdx
        ) {
            lastSpokenIndexRef.current = lastIdx;
            speak(lastMsg.content, interviewerVoice, () => {
                // Voice finished - Auto start recording
                // Check if we are already recording to avoid toggling off
                if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
                    toggleListening();
                }
            });
        }
    }, [messages, isSpeaking, interviewerVoice]); // toggleListening is stable enough or we accept re-runs

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
            {/* Professional Header - Fixed at top */}
            <Card className="flex-shrink-0 rounded-none border-x-0 border-t-0 border-b-2 border-blue-100 shadow-sm bg-white/80 backdrop-blur-sm z-10">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg">
                            <ChatIcon sx={{ fontSize: 20, color: 'white' }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Interview in Progress</h2>
                            <p className="text-sm text-muted-foreground">Answer confidently and professionally</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={toggleSpeaking}
                            variant={isSpeaking ? "default" : "outline"}
                            size="sm"
                            className={isSpeaking ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600" : ""}
                        >
                            {isSpeaking ? <VolumeUpIcon sx={{ fontSize: 16, marginRight: 0.5 }} /> : <VolumeOffIcon sx={{ fontSize: 16, marginRight: 0.5 }} />}
                            {isSpeaking ? 'Voice On' : 'Voice Off'}
                        </Button>
                        <Button
                            onClick={onEndInterview}
                            variant="destructive"
                            size="sm"
                            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
                        >
                            End Interview
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scroll-smooth">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}
                    >
                        <Card
                            className={`max-w-2xl px-6 py-4 shadow-md border-2 ${msg.role === 'user'
                                ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white border-blue-400'
                                : 'bg-card border-blue-100'
                                }`}
                        >
                            <p className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-card-foreground'}`}>
                                {msg.content}
                            </p>
                        </Card>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                        <Card className="px-6 py-4 shadow-md border-2 border-blue-100">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </Card>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Professional Input Area - Fixed at bottom */}
            <Card className="flex-shrink-0 rounded-none border-x-0 border-b-0 border-t-2 border-blue-100 shadow-lg bg-white/80 backdrop-blur-sm z-10">
                <div className="px-6 py-4">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <Button
                            type="button"
                            onClick={toggleListening}
                            disabled={isLoading}
                            size="icon"
                            variant={isListening ? "destructive" : "default"}
                            className={`flex-shrink-0 h-12 w-12 rounded-full ${isListening
                                ? 'bg-gradient-to-br from-red-600 to-red-500 animate-pulse'
                                : 'bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                                }`}
                        >
                            {isListening ? <MicOffIcon sx={{ fontSize: 20 }} /> : <MicIcon sx={{ fontSize: 20 }} />}
                        </Button>
                        <Input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? 'Recording...' : 'Type your answer or use voice...'}
                            disabled={isLoading}
                            className="flex-1 h-12"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && !isLoading && input.trim()) {
                                    e.preventDefault();
                                    handleSubmit(e as any);
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-8"
                        >
                            <SendIcon sx={{ fontSize: 16, marginRight: 0.5 }} />
                            Send
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
