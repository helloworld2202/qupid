import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
export function useBadges() {
    return useQuery({
        queryKey: ['badges'],
        queryFn: async () => {
            const response = await apiClient.get('/badges');
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분
    });
}
export function useUserBadges(userId) {
    return useQuery({
        queryKey: ['userBadges', userId],
        queryFn: async () => {
            const response = await apiClient.get(`/users/${userId}/badges`);
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
        mutationFn: async ({ userId, badgeId }) => {
            const response = await apiClient.post(`/users/${userId}/badges`, { badgeId });
            return response.data;
        },
        onSuccess: (_, variables) => {
            // Invalidate user badges cache to refetch
            queryClient.invalidateQueries({ queryKey: ['userBadges', variables.userId] });
        }
    });
}
