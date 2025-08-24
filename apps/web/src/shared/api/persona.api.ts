import { apiClient } from '../lib/api-client';
import { Persona } from '@qupid/core';

export const personaApi = {
  getAllPersonas: async (): Promise<Persona[]> => {
    const { data } = await apiClient.get('/personas');
    return data.data;
  },

  getPersonaById: async (id: string): Promise<Persona> => {
    const { data } = await apiClient.get(`/personas/${id}`);
    return data.data;
  },

  searchPersonas: async (query: string): Promise<Persona[]> => {
    const { data } = await apiClient.get('/personas/search', { params: { q: query } });
    return data.data;
  },
};