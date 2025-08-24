const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
class UserApi {
    async request(endpoint, options = {}) {
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
    async getUserProfile(userId) {
        return this.request(`/users/${userId}`);
    }
    async createUserProfile(profile) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(profile),
        });
    }
    async updateUserProfile(userId, updates) {
        return this.request(`/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
    }
    async completeTutorial(userId) {
        await this.request(`/users/${userId}/tutorial/complete`, {
            method: 'POST',
        });
    }
    async getFavorites(userId) {
        return this.request(`/users/${userId}/favorites`);
    }
    async toggleFavorite(userId, personaId) {
        return this.request(`/users/${userId}/favorites/${personaId}`, {
            method: 'POST',
        });
    }
    async getUserBadges(userId) {
        return this.request(`/users/${userId}/badges`);
    }
}
export const userApi = new UserApi();
