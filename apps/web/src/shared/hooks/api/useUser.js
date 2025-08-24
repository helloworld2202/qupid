import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../api/user.api';
export const useUserProfile = (userId) => {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: () => userApi.getUserProfile(userId),
        enabled: !!userId,
    });
};
export const useCreateUserProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (profile) => userApi.createUserProfile(profile),
        onSuccess: (data) => {
            queryClient.setQueryData(['user', data.id], data);
            // 사용자 ID를 로컬스토리지에 저장
            localStorage.setItem('userId', data.id || '');
        },
    });
};
export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, updates }) => userApi.updateUserProfile(userId, updates),
        onSuccess: (data) => {
            queryClient.setQueryData(['user', data.id], data);
        },
    });
};
export const useCompleteTutorial = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId) => userApi.completeTutorial(userId),
        onSuccess: (_, userId) => {
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
        },
    });
};
export const useFavorites = (userId) => {
    return useQuery({
        queryKey: ['user', userId, 'favorites'],
        queryFn: () => userApi.getFavorites(userId),
        enabled: !!userId,
    });
};
export const useToggleFavorite = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, personaId }) => userApi.toggleFavorite(userId, personaId),
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['user', userId, 'favorites'] });
        },
    });
};
