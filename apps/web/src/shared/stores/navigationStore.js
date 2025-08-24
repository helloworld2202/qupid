import { create } from 'zustand';
export const useNavigationStore = create((set) => ({
    currentScreen: 'HOME',
    previousScreen: null,
    navigationHistory: ['HOME'],
    navigateTo: (screen) => set((state) => ({
        currentScreen: screen,
        previousScreen: state.currentScreen,
        navigationHistory: [...state.navigationHistory, screen],
    })),
    goBack: () => set((state) => {
        const history = [...state.navigationHistory];
        if (history.length <= 1)
            return state;
        history.pop(); // Remove current screen
        const previousScreen = history[history.length - 1];
        return {
            currentScreen: previousScreen,
            previousScreen: history[history.length - 2] || null,
            navigationHistory: history,
        };
    }),
    resetNavigation: () => set({
        currentScreen: 'HOME',
        previousScreen: null,
        navigationHistory: ['HOME'],
    }),
}));
