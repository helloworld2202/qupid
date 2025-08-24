import { apiClient } from '../lib/api-client';
import { UserProfile } from '@qupid/core';

export const userApi = {
  getUserProfile: async (userId: string): Promise<UserProfile> => {
    const { data } = await apiClient.get(`/users/${userId}`);
    return data.data;
  },

  createUserProfile: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    const { data } = await apiClient.post('/users', profile);
    return data.data;
  },

  updateUserProfile: async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
    const { data } = await apiClient.put(`/users/${userId}`, updates);
    return data.data;
  },

  completeTutorial: async (userId: string): Promise<void> => {
    await apiClient.post(`/users/${userId}/tutorial/complete`);
  },

  getFavorites: async (userId: string): Promise<string[]> => {
    const { data } = await apiClient.get(`/users/${userId}/favorites`);
    return data.data;
  },

  toggleFavorite: async (userId: string, personaId: string): Promise<void> => {
    await apiClient.post(`/users/${userId}/favorites/${personaId}`);
  },
};