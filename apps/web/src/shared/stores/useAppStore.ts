import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  currentUserId: string | null;
  setCurrentUserId: (userId: string | null) => void;
  isTutorialCompleted: boolean;
  setTutorialCompleted: (completed: boolean) => void;
  clearUserData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUserId: null,
      setCurrentUserId: (userId) => set({ currentUserId: userId }),
      isTutorialCompleted: false,
      setTutorialCompleted: (completed) => set({ isTutorialCompleted: completed }),
      clearUserData: () => set({ 
        currentUserId: null, 
        isTutorialCompleted: false 
      }),
    }),
    {
      name: 'qupid-app-storage',
    }
  )
);