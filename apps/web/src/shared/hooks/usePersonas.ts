import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { Persona } from '@qupid/core';

interface PersonasResponse {
  success: boolean;
  data: Persona[];
}

export function usePersonas() {
  return useQuery<Persona[]>({
    queryKey: ['personas'],
    queryFn: async () => {
      const response = await apiClient.get<PersonasResponse>('/personas');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

export function usePersona(id: string) {
  return useQuery<Persona>({
    queryKey: ['personas', id],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: Persona }>(`/personas/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}