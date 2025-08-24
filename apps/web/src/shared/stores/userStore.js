import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useUserStore = create()(persist((set) => ({
    user: null,
    isAuthenticated: false,
    isOnboardingComplete: false,
    setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isOnboardingComplete: !!user?.isTutorialCompleted
    }),
    updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
    })),
    completeOnboarding: () => set((state) => ({
        isOnboardingComplete: true,
        user: state.user
            ? { ...state.user, onboarding_completed: true }
            : null,
    })),
    logout: () => set({
        user: null,
        isAuthenticated: false,
        isOnboardingComplete: false,
    }),
}), {
    name: 'user-storage',
    partialize: (state) => ({
        user: state.user,
        isOnboardingComplete: state.isOnboardingComplete,
    }),
}));
