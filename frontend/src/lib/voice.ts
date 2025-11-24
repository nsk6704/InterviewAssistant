// Voice utilities for Interview Practice Partner
import { showToast } from './toast';

// Use Whisper API for speech-to-text (more accurate than browser STT)
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch('http://localhost:8000/transcribe', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Transcription failed');
    }

    const data = await response.json();
    return data.transcript;
};

// Record audio using MediaRecorder with silence detection
export const startRecording = async (
    onTranscript: (transcript: string) => void,
    onError?: (error: string) => void
): Promise<MediaRecorder | null> => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];

        // Setup silence detection
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyzer = audioContext.createAnalyser();
        analyzer.fftSize = 512;
        source.connect(analyzer);

        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let silenceStart: number | null = null;
        const SILENCE_THRESHOLD = 10; // Volume threshold for silence
        const SILENCE_DURATION = 5000; // 5 seconds of silence

        // Check audio levels periodically
        const checkSilence = () => {
            analyzer.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;

            if (average < SILENCE_THRESHOLD) {
                // Silence detected
                if (silenceStart === null) {
                    silenceStart = Date.now();
                } else if (Date.now() - silenceStart >= SILENCE_DURATION) {
                    // 5 seconds of silence - auto-stop
                    console.log('[Voice] Auto-stopping due to 5s silence');
                    mediaRecorder.stop();
                    return;
                }
            } else {
                // Sound detected - reset silence timer
                silenceStart = null;
            }

            // Continue checking if still recording
            if (mediaRecorder.state === 'recording') {
                requestAnimationFrame(checkSilence);
            }
        };

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

            // Cleanup audio context
            audioContext.close();

            try {
                const transcript = await transcribeAudio(audioBlob);
                onTranscript(transcript);
            } catch (error) {
                const errorMsg = (error as Error).message;
                showToast(`Transcription failed: ${errorMsg}`, 'error');
                onError?.(errorMsg);
            }
            // Stop all tracks
            stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        checkSilence(); // Start silence detection

        return mediaRecorder;
    } catch (error) {
        const errorMsg = (error as Error).message;
        showToast(`Microphone access denied`, 'error');
        onError?.(errorMsg);
        return null;
    }
};

// Text-to-Speech using PlayAI via Groq (much better quality than browser TTS)
let currentAudio: HTMLAudioElement | null = null;

export const speak = async (text: string, voice: string = "Ruby-PlayAI", onEnd?: () => void) => {
    // Stop any ongoing speech
    stopSpeaking();

    try {
        const response = await fetch('http://localhost:8000/tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, voice }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'TTS service unavailable' }));
            const errorMsg = errorData.detail || 'TTS failed';

            // Check if it's a rate limit error
            if (errorMsg.includes('rate limit') || errorMsg.includes('Rate limit')) {
                showToast('⚠️ Voice temporarily unavailable due to rate limits. Text will still appear.', 'info');
            } else if (errorMsg.includes('terms')) {
                showToast('⚠️ Voice service requires acceptance of terms. Text will still appear.', 'info');
            } else {
                showToast(`Voice unavailable: ${errorMsg}`, 'error');
            }

            onEnd?.(); // Call callback even on error
            return;
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        currentAudio = new Audio(audioUrl);
        await currentAudio.play();

        // Cleanup URL and call onEnd callback after playing
        currentAudio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            onEnd?.(); // Call the callback when speech ends
        };
    } catch (error) {
        console.error('TTS error:', error);
        showToast('Voice temporarily unavailable', 'info');
        onEnd?.(); // Call callback even on error to not block the flow
    }
};

export const stopSpeaking = () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
};
