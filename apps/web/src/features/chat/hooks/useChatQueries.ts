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
    onError: (error) => {
      console.error('Failed to send message:', error);
      // 🚀 사용자에게 더 명확한 에러 메시지 제공
      if (error instanceof Error) {
        if (error.message.includes('fetch failed')) {
          throw new Error('네트워크 연결을 확인해주세요.');
        } else if (error.message.includes('session')) {
          throw new Error('대화 세션이 만료되었습니다. 새로 시작해주세요.');
        }
      }
      throw new Error('메시지 전송에 실패했습니다. 다시 시도해주세요.');
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
    onError: (error) => {
      console.error('Failed to generate dynamic personas:', error);
      // 🚀 동적 페르소나 생성 실패 시 사용자에게 친화적인 메시지
      if (error instanceof Error) {
        if (error.message.includes('fetch failed')) {
          throw new Error('AI 페르소나 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } else if (error.message.includes('API')) {
          throw new Error('AI 서비스에 일시적인 문제가 있습니다. 기본 페르소나로 대화를 시작해주세요.');
        }
      }
      throw new Error('페르소나 생성에 실패했습니다. 다시 시도해주세요.');
    },
  });
};