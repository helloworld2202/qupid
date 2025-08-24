import { apiClient } from '../lib/api-client';
import { Coach } from '@qupid/core';

export const coachApi = {
  getAllCoaches: async (): Promise<Coach[]> => {
    const { data } = await apiClient.get('/coaches');
    return data.data;
  },

  getCoachById: async (id: string): Promise<Coach> => {
    const { data } = await apiClient.get(`/coaches/${id}`);
    return data.data;
  },
};