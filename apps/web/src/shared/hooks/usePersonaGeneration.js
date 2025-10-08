import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
/**
 * 사용자 관심사 기반 페르소나 생성
 */
export const useGeneratePersona = () => {
    return useMutation({
        mutationFn: async (data) => {
            const response = await apiClient.post('/personas/generate', data);
            return response.data;
        },
        onError: (error) => {
            console.error('페르소나 생성 오류:', error);
        }
    });
};
/**
 * 매일 새로운 페르소나들 생성
 */
export const useGenerateDailyPersonas = () => {
    return useMutation({
        mutationFn: async (data) => {
            const response = await apiClient.post('/personas/generate-daily', data);
            return response.data;
        },
        onError: (error) => {
            console.error('일일 페르소나 생성 오류:', error);
        }
    });
};
/**
 * 추천 페르소나 목록 조회
 */
export const useRecommendedPersonas = (userGender, limit = 10) => {
    return useQuery({
        queryKey: ['personas', 'recommended', userGender, limit],
        queryFn: async () => {
            const response = await apiClient.get(`/personas/recommended?userGender=${userGender}&limit=${limit}`);
            return response.data;
        },
        enabled: !!userGender,
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분 (cacheTime → gcTime)
    });
};
/**
 * 특정 페르소나 상세 정보 조회
 */
export const usePersonaById = (id) => {
    return useQuery({
        queryKey: ['personas', id],
        queryFn: async () => {
            const response = await apiClient.get(`/personas/${id}`);
            return response.data;
        },
        enabled: !!id,
    });
};
