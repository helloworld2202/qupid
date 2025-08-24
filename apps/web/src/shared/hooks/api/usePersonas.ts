import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { personaApi } from '../../api/persona.api';
import { Persona } from '@qupid/core';

export const usePersonas = () => {
  return useQuery<Persona[], Error>({
    queryKey: ['personas'],
    queryFn: personaApi.getAllPersonas,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePersona = (id: string) => {
  return useQuery<Persona, Error>({
    queryKey: ['personas', id],
    queryFn: () => personaApi.getPersonaById(id),
    enabled: !!id,
  });
};

export const useSearchPersonas = (query: string) => {
  return useQuery<Persona[], Error>({
    queryKey: ['personas', 'search', query],
    queryFn: () => personaApi.searchPersonas(query),
    enabled: query.length > 0,
  });
};