import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { Badge } from '@qupid/core';

interface BadgesResponse {
  success: boolean;
  data: Badge[];
}

export function useBadges() {
  return useQuery<Badge[]>({
    queryKey: ['badges'],
    queryFn: async () => {
      const response = await apiClient.get<BadgesResponse>('/badges');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

export function useUserBadges(userId: string) {
  return useQuery<Badge[]>({
    queryKey: ['userBadges', userId],
    queryFn: async () => {
      const response = await apiClient.get<BadgesResponse>(`/users/${userId}/badges`);
      return response.data.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useAwardBadge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, badgeId }: { userId: string; badgeId: string }) => {
      const response = await apiClient.post(`/users/${userId}/badges`, { badgeId });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate user badges cache to refetch
      queryClient.invalidateQueries({ queryKey: ['userBadges', variables.userId] });
    }
  });
}