import { Message, ConversationAnalysis, RealtimeFeedback } from '@qupid/core';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
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
  async createChatSession(
    personaId: string,
    systemInstruction: string,
    token?: string
  ): Promise<string> {
    const { sessionId } = await this.request<{ sessionId: string }>('/chat/sessions', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ personaId, systemInstruction }),
    });
    return sessionId;
  }

  async sendMessage(sessionId: string, message: string): Promise<string> {
    const { response } = await this.request<{ response: string }>(
      `/chat/sessions/${sessionId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ message }),
      }
    );
    return response;
  }

  async analyzeConversation(messages: Message[]): Promise<ConversationAnalysis | null> {
    try {
      const analysis = await this.request<ConversationAnalysis>('/chat/analyze', {
        method: 'POST',
        body: JSON.stringify({ messages }),
      });
      return analysis;
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      return null;
    }
  }

  async getRealtimeFeedback(
    lastUserMessage: string,
    lastAiMessage?: string
  ): Promise<RealtimeFeedback | null> {
    try {
      const feedback = await this.request<RealtimeFeedback | null>('/chat/feedback', {
        method: 'POST',
        body: JSON.stringify({ lastUserMessage, lastAiMessage }),
      });
      return feedback;
    } catch (error) {
      console.error('Error getting realtime feedback:', error);
      return null;
    }
  }

  async getCoachSuggestion(
    messages: Message[]
  ): Promise<{ reason: string; suggestion: string } | null> {
    try {
      const suggestion = await this.request<{ reason: string; suggestion: string }>(
        '/chat/coach-suggestion',
        {
          method: 'POST',
          body: JSON.stringify({ messages }),
        }
      );
      return suggestion;
    } catch (error) {
      console.error('Error getting coach suggestion:', error);
      return null;
    }
  }

  // Styling endpoints
  async getStylingAdvice(
    prompt: string
  ): Promise<{ text: string; imageUrl: string | null }> {
    const result = await this.request<{ text: string; imageUrl: string | null }>(
      '/styling/advice',
      {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      }
    );
    return result;
  }
}

export const apiClient = new ApiClient();