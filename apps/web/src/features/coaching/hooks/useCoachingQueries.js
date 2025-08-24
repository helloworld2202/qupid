import { useMutation } from '@tanstack/react-query';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
/**
 * 코칭 세션 생성
 */
export const useCreateCoachingSession = () => {
    return useMutation({
        mutationFn: async ({ coachId, userId }) => {
            const response = await fetch(`${API_URL}/coaches/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coachId, userId })
            });
            if (!response.ok) {
                throw new Error('Failed to create coaching session');
            }
            const data = await response.json();
            return data.data.sessionId;
        }
    });
};
/**
 * 코칭 메시지 전송
 */
export const useSendCoachingMessage = () => {
    return useMutation({
        mutationFn: async ({ sessionId, message }) => {
            const response = await fetch(`${API_URL}/coaches/sessions/${sessionId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            if (!response.ok) {
                throw new Error('Failed to send coaching message');
            }
            const data = await response.json();
            return data.data;
        }
    });
};
/**
 * 코칭 메시지 스트리밍
 */
export const useStreamCoachingMessage = () => {
    return useMutation({
        mutationFn: async ({ sessionId, message, onChunk }) => {
            const response = await fetch(`${API_URL}/coaches/sessions/${sessionId}/stream?message=${encodeURIComponent(message)}`, {
                method: 'GET',
                headers: {
                    'Accept': 'text/event-stream',
                }
            });
            if (!response.ok) {
                throw new Error('Failed to stream coaching message');
            }
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullText = '';
            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') {
                                break;
                            }
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.text) {
                                    fullText += parsed.text;
                                    onChunk(parsed.text);
                                }
                            }
                            catch (e) {
                                // Ignore parse errors
                            }
                        }
                    }
                }
            }
            return fullText;
        }
    });
};
/**
 * 코칭 세션 분석
 */
export const useAnalyzeCoachingSession = () => {
    return useMutation({
        mutationFn: async ({ sessionId, messages }) => {
            const response = await fetch(`${API_URL}/coaches/sessions/${sessionId}/end`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages })
            });
            if (!response.ok) {
                throw new Error('Failed to analyze coaching session');
            }
            const data = await response.json();
            return data.data;
        }
    });
};
