import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
export function useUserProfile(userId) {
    return useQuery({
        queryKey: ['userProfile', userId],
        queryFn: async () => {
            if (!userId)
                return null;
            const response = await apiClient.get(`/users/${userId}`);
            return response.data.data;
        },
        enabled: !!userId,
    });
}
export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, updates }) => {
            const response = await apiClient.put(`/users/${userId}`, updates);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['userProfile', variables.userId] });
        }
    });
}
export function useFavorites(userId) {
    return useQuery({
        queryKey: ['favorites', userId],
        queryFn: async () => {
            if (!userId)
                return [];
            const response = await apiClient.get(`/users/${userId}/favorites`);
            return response.data.data;
        },
        enabled: !!userId,
    });
}
export function useToggleFavorite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, personaId }) => {
            const response = await apiClient.post(`/users/${userId}/favorites/${personaId}`);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['favorites', variables.userId] });
        }
    });
}
