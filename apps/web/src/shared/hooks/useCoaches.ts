import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { AICoach } from '@qupid/core';

interface CoachesResponse {
  success: boolean;
  data: AICoach[];
}

export function useCoaches() {
  return useQuery<AICoach[]>({
    queryKey: ['coaches'],
    queryFn: async () => {
      const response = await apiClient.get<CoachesResponse>('/coaches');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

export function useCoach(id: string) {
  return useQuery<AICoach>({
    queryKey: ['coaches', id],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: AICoach }>(`/coaches/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}