import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@qupid/core';

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isOnboardingComplete: false,

      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: !!user,
          isOnboardingComplete: !!user?.onboarding_completed 
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      completeOnboarding: () =>
        set((state) => ({
          isOnboardingComplete: true,
          user: state.user 
            ? { ...state.user, onboarding_completed: true }
            : null,
        })),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isOnboardingComplete: false,
        }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        isOnboardingComplete: state.isOnboardingComplete,
      }),
    }
  )
);