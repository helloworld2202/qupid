import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
export const useChatSession = () => {
    return useMutation({
        mutationFn: async ({ personaId, systemInstruction }) => {
            return await apiClient.createChatSession(personaId, systemInstruction);
        },
    });
};
export const useSendMessage = () => {
    return useMutation({
        mutationFn: async ({ sessionId, message }) => {
            return await apiClient.sendMessage(sessionId, message);
        },
    });
};
export const useAnalyzeConversation = () => {
    return useMutation({
        mutationFn: async (messages) => {
            return await apiClient.analyzeConversation(messages);
        },
    });
};
export const useRealtimeFeedback = () => {
    return useMutation({
        mutationFn: async ({ lastUserMessage, lastAiMessage }) => {
            return await apiClient.getRealtimeFeedback(lastUserMessage, lastAiMessage);
        },
    });
};
export const useCoachSuggestion = () => {
    return useMutation({
        mutationFn: async ({ messages, persona }) => {
            return await apiClient.getCoachSuggestion(messages, persona);
        },
    });
};
// 🚀 동적 페르소나 생성 훅
export const useGenerateDynamicPersonas = () => {
    return useMutation({
        mutationFn: async ({ userProfile, count = 3 }) => {
            return await apiClient.generateDynamicPersonas(userProfile, count);
        },
    });
};
