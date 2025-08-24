import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
export function useCoaches() {
    return useQuery({
        queryKey: ['coaches'],
        queryFn: async () => {
            const response = await apiClient.get('/coaches');
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분
    });
}
export function useCoach(id) {
    return useQuery({
        queryKey: ['coaches', id],
        queryFn: async () => {
            const response = await apiClient.get(`/coaches/${id}`);
            return response.data.data;
        },
        enabled: !!id,
    });
}
