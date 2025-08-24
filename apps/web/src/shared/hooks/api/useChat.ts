import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi, ChatRequest, ChatResponse, AnalysisRequest, AnalysisResponse, ChatMessage } from '../../api/chat.api';

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ChatResponse, Error, ChatRequest>({
    mutationFn: chatApi.sendMessage,
    onSuccess: (data, variables) => {
      // Invalidate conversation history if we have a conversation ID
      if (data.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['conversation', data.conversationId] });
      }
    },
  });
};

export const useAnalyzeConversation = () => {
  return useMutation<AnalysisResponse, Error, AnalysisRequest>({
    mutationFn: chatApi.analyzeConversation,
  });
};

export const useConversationHistory = (conversationId: string) => {
  return useQuery<ChatMessage[], Error>({
    queryKey: ['conversation', conversationId],
    queryFn: () => chatApi.getConversationHistory(conversationId),
    enabled: !!conversationId,
  });
};