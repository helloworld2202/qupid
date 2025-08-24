import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../api/user.api';
import { UserProfile } from '@qupid/core';

export const useUserProfile = (userId: string) => {
  return useQuery<UserProfile, Error>({
    queryKey: ['user', userId],
    queryFn: () => userApi.getUserProfile(userId),
    enabled: !!userId,
  });
};

export const useCreateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profile: Partial<UserProfile>) => userApi.createUserProfile(profile),
    onSuccess: (data) => {
      queryClient.setQueryData(['user', data.id], data);
      // 사용자 ID를 로컬스토리지에 저장
      localStorage.setItem('userId', data.id);
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<UserProfile> }) =>
      userApi.updateUserProfile(userId, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['user', data.id], data);
    },
  });
};

export const useCompleteTutorial = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => userApi.completeTutorial(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
};

export const useFavorites = (userId: string) => {
  return useQuery<string[], Error>({
    queryKey: ['user', userId, 'favorites'],
    queryFn: () => userApi.getFavorites(userId),
    enabled: !!userId,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, personaId }: { userId: string; personaId: string }) =>
      userApi.toggleFavorite(userId, personaId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId, 'favorites'] });
    },
  });
};