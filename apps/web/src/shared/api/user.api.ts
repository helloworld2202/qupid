import { UserProfile } from '@qupid/core';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

class UserApi {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/users/${userId}`);
  }

  async createUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>('/users', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async completeTutorial(userId: string): Promise<void> {
    await this.request<void>(`/users/${userId}/tutorial/complete`, {
      method: 'POST',
    });
  }

  async getFavorites(userId: string): Promise<string[]> {
    return this.request<string[]>(`/users/${userId}/favorites`);
  }

  async toggleFavorite(userId: string, personaId: string): Promise<boolean> {
    return this.request<boolean>(`/users/${userId}/favorites/${personaId}`, {
      method: 'POST',
    });
  }

  async getUserBadges(userId: string): Promise<any[]> {
    return this.request<any[]>(`/users/${userId}/badges`);
  }
}

export const userApi = new UserApi();