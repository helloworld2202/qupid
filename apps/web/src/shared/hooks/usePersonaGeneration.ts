import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';

// API 응답 타입 정의
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PersonaProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  avatar: string;
  personality: string;
  occupation: string;
  education: string;
  location: string;
  height: string;
  bodyType: string;
  interests: string[];
  values: string[];
  communicationStyle: string;
  datingStyle: string;
  appearanceStyle: string;
  speechPattern: string;
  lifestyle: string;
  specialNotes: string[];
  bigFiveScores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  conversationStyle: string;
  isTutorial?: boolean;
}

export interface GeneratePersonaRequest {
  userGender: 'male' | 'female';
  userInterests: string[];
  isTutorial?: boolean;
}

export interface GenerateDailyPersonasRequest {
  userGender: 'male' | 'female';
  count?: number;
}

/**
 * 사용자 관심사 기반 페르소나 생성
 */
export const useGeneratePersona = () => {
  return useMutation<PersonaProfile, Error, GeneratePersonaRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<PersonaProfile>>('/personas/generate', data);
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
  return useMutation<PersonaProfile[], Error, GenerateDailyPersonasRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.post<ApiResponse<PersonaProfile[]>>('/personas/generate-daily', data);
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
export const useRecommendedPersonas = (userGender: 'male' | 'female', limit: number = 10) => {
  return useQuery<PersonaProfile[]>({
    queryKey: ['personas', 'recommended', userGender, limit],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PersonaProfile[]>>(`/personas/recommended?userGender=${userGender}&limit=${limit}`);
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
export const usePersonaById = (id: string) => {
  return useQuery<PersonaProfile>({
    queryKey: ['personas', id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PersonaProfile>>(`/personas/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
