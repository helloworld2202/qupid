import { useMutation } from '@tanstack/react-query';
import { Message } from '@qupid/core';
import { apiClient } from '../../../shared/api/apiClient';

interface StyleAnalysis {
  currentStyle: {
    type: string;
    characteristics: string[];
    strengths: string[];
    weaknesses: string[];
  };
  recommendations: {
    category: string;
    tips: string[];
    examples: string[];
  }[];
}

export const useStyleAnalysis = () => {
  return useMutation<StyleAnalysis, Error, Message[]>({
    mutationFn: async (messages) => {
      const response = await apiClient.post<{ ok: boolean; data: StyleAnalysis }>(
        '/api/v1/chat/style-analysis',
        { messages }
      );
      return response.data.data;
    }
  });
};