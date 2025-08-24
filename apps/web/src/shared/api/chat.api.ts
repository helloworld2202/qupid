import { apiClient } from '../lib/api-client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  userId: string;
  personaId?: string;
  coachId?: string;
  messages: ChatMessage[];
  isTutorial?: boolean;
}

export interface ChatResponse {
  response: string;
  conversationId?: string;
}

export interface AnalysisRequest {
  conversationId: string;
  messages: ChatMessage[];
}

export interface AnalysisResponse {
  overallScore: number;
  feedback: string;
  improvements: string[];
  achievements: string[];
  tips: string[];
}

export const chatApi = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const endpoint = request.personaId ? '/chat/persona' : '/chat/coach';
    const { data } = await apiClient.post(endpoint, request);
    return data.data;
  },

  analyzeConversation: async (request: AnalysisRequest): Promise<AnalysisResponse> => {
    const { data } = await apiClient.post('/chat/analyze', request);
    return data.data;
  },

  getConversationHistory: async (conversationId: string): Promise<ChatMessage[]> => {
    const { data } = await apiClient.get(`/chat/conversations/${conversationId}`);
    return data.data;
  },
};