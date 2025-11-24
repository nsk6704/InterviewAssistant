import axios from 'axios';
import type { InterviewConfig, FeedbackResponse } from '@/types';

const API_BASE = 'http://localhost:8000';

export const api = {
    async startInterview(config: InterviewConfig) {
        const response = await axios.post(`${API_BASE}/start_interview`, config);
        return response.data;
    },

    async sendMessage(sessionId: string, message: string) {
        const response = await axios.post(`${API_BASE}/chat`, {
            session_id: sessionId,
            message,
        });
        return response.data;
    },

    async getFeedback(sessionId: string): Promise<FeedbackResponse> {
        const response = await axios.post(`${API_BASE}/feedback_result`, {
            session_id: sessionId,
        });
        return response.data;
    },
};
