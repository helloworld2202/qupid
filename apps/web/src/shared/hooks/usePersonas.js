import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
export function usePersonas() {
    return useQuery({
        queryKey: ['personas'],
        queryFn: async () => {
            const response = await apiClient.get('/personas');
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분
    });
}
export function usePersona(id) {
    return useQuery({
        queryKey: ['personas', id],
        queryFn: async () => {
            const response = await apiClient.get(`/personas/${id}`);
            return response.data.data;
        },
        enabled: !!id,
    });
}
