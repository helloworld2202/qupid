import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { UserProfile } from '@qupid/core';

interface UserResponse {
  success: boolean;
  data: UserProfile;
}

interface FavoritesResponse {
  success: boolean;
  data: string[];
}

export function useUserProfile(userId?: string) {
  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiClient.get<UserResponse>(`/users/${userId}`);
      return response.data.data;
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<UserProfile> }) => {
      const response = await apiClient.put(`/users/${userId}`, updates);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables.userId] });
    }
  });
}

export function useFavorites(userId?: string) {
  return useQuery<string[]>({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiClient.get<FavoritesResponse>(`/users/${userId}/favorites`);
      return response.data.data;
    },
    enabled: !!userId,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, personaId }: { userId: string; personaId: string }) => {
      const response = await apiClient.post(`/users/${userId}/favorites/${personaId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', variables.userId] });
    }
  });
}