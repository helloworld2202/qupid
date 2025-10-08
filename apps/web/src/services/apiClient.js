const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
class ApiClient {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include', // 쿠키와 인증 정보 포함
        });
        const data = await response.json();
        if (!response.ok || !data.ok) {
            throw new Error(data.error?.message || 'API request failed');
        }
        return data.data;
    }
    // Chat endpoints
    async createChatSession(personaId, systemInstruction, token) {
        const { sessionId } = await this.request('/chat/sessions', {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: JSON.stringify({ personaId, systemInstruction }),
        });
        return sessionId;
    }
    async sendMessage(sessionId, message) {
        const { response } = await this.request(`/chat/sessions/${sessionId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ message }),
        });
        return response;
    }
    async analyzeConversation(messages) {
        try {
            const analysis = await this.request('/chat/analyze', {
                method: 'POST',
                body: JSON.stringify({ messages }),
            });
            return analysis;
        }
        catch (error) {
            console.error('Error analyzing conversation:', error);
            return null;
        }
    }
    async getRealtimeFeedback(lastUserMessage, lastAiMessage) {
        try {
            const feedback = await this.request('/chat/feedback', {
                method: 'POST',
                body: JSON.stringify({ lastUserMessage, lastAiMessage }),
            });
            return feedback;
        }
        catch (error) {
            console.error('Error getting realtime feedback:', error);
            return null;
        }
    }
    async getCoachSuggestion(messages, persona) {
        try {
            const suggestion = await this.request('/chat/coach-suggestion', {
                method: 'POST',
                body: JSON.stringify({ messages, persona }),
            });
            return suggestion;
        }
        catch (error) {
            console.error('Error getting coach suggestion:', error);
            return null;
        }
    }
    // 🚀 동적 페르소나 생성
    async generateDynamicPersonas(userProfile, count = 3) {
        try {
            const response = await this.request('/personas/generate-dynamic', {
                method: 'POST',
                body: JSON.stringify({ userProfile, count }),
            });
            return response.data || [];
        }
        catch (error) {
            console.error('Error generating dynamic personas:', error);
            return [];
        }
    }
    // Styling endpoints
    async getStylingAdvice(prompt) {
        const result = await this.request('/styling/advice', {
            method: 'POST',
            body: JSON.stringify({ prompt }),
        });
        return result;
    }
    // Generic HTTP methods
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}
export const apiClient = new ApiClient();
