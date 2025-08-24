import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useAppStore = create()(persist((set) => ({
    currentUserId: null,
    setCurrentUserId: (userId) => set({ currentUserId: userId }),
    isTutorialCompleted: false,
    setTutorialCompleted: (completed) => set({ isTutorialCompleted: completed }),
    clearUserData: () => set({
        currentUserId: null,
        isTutorialCompleted: false
    }),
}), {
    name: 'qupid-app-storage',
}));
