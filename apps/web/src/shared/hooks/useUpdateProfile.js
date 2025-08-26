import { useMutation, useQueryClient } from '@tanstack/react-query';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, updates }) => {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to update profile');
            }
            const result = await response.json();
            return result.data;
        },
        onSuccess: (data, variables) => {
            // 캐시 업데이트
            queryClient.invalidateQueries({ queryKey: ['userProfile', variables.userId] });
            queryClient.setQueryData(['userProfile', variables.userId], data);
            // localStorage도 업데이트
            if (typeof window !== 'undefined') {
                const storedProfile = localStorage.getItem('userProfile');
                if (storedProfile) {
                    const profile = JSON.parse(storedProfile);
                    const updatedProfile = { ...profile, ...data };
                    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
                }
            }
        },
    });
}
export function useUploadProfileImage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, imageFile }) => {
            const formData = new FormData();
            formData.append('image', imageFile);
            const response = await fetch(`${API_URL}/users/${userId}/avatar`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to upload image');
            }
            const result = await response.json();
            return result.data.avatarUrl;
        },
        onSuccess: (avatarUrl, variables) => {
            // 프로필 캐시 업데이트
            queryClient.setQueryData(['userProfile', variables.userId], (old) => ({
                ...old,
                avatar: avatarUrl,
            }));
        },
    });
}
