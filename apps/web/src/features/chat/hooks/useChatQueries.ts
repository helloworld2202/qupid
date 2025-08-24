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
    mutationFn: async (messages: Message[]) => {
      return await apiClient.getCoachSuggestion(messages);
    },
  });
};