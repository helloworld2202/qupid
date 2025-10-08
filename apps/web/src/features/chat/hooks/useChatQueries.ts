import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { Message, ConversationAnalysis } from '@qupid/core';

export const useChatSession = () => {
  return useMutation({
    mutationFn: async ({ 
      personaId, 
      systemInstruction 
    }: { 
      personaId: string; 
      systemInstruction: string;
    }) => {
      return await apiClient.createChatSession(personaId, systemInstruction);
    },
  });
};

export const useSendMessage = () => {
  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      message 
    }: { 
      sessionId: string; 
      message: string;
    }) => {
      return await apiClient.sendMessage(sessionId, message);
    },
  });
};

export const useAnalyzeConversation = () => {
  return useMutation<ConversationAnalysis | null, Error, Message[]>({
    mutationFn: async (messages: Message[]) => {
      return await apiClient.analyzeConversation(messages);
    },
  });
};

export const useRealtimeFeedback = () => {
  return useMutation({
    mutationFn: async ({ 
      lastUserMessage, 
      lastAiMessage 
    }: { 
      lastUserMessage: string; 
      lastAiMessage?: string;
    }) => {
      return await apiClient.getRealtimeFeedback(lastUserMessage, lastAiMessage);
    },
  });
};

export const useCoachSuggestion = () => {
  return useMutation({
    mutationFn: async ({ messages, persona }: { messages: Message[]; persona?: any }) => {
      return await apiClient.getCoachSuggestion(messages, persona);
    },
  });
};

// 🚀 동적 페르소나 생성 훅
export const useGenerateDynamicPersonas = () => {
  return useMutation({
    mutationFn: async ({ 
      userProfile, 
      count = 3 
    }: { 
      userProfile: {
        name?: string;
        age?: number;
        gender?: string;
        job?: string;
        interests?: string[];
        experience?: string;
        mbti?: string;
        personality?: string[];
      }; 
      count?: number;
    }) => {
      return await apiClient.generateDynamicPersonas(userProfile, count);
    },
  });
};