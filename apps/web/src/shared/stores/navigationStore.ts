import { create } from 'zustand';
import { Screen } from '@qupid/core';

interface NavigationState {
  currentScreen: Screen;
  previousScreen: Screen | null;
  navigationHistory: Screen[];
  
  // Actions
  navigateTo: (screen: Screen) => void;
  goBack: () => void;
  resetNavigation: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentScreen: Screen.HOME,
  previousScreen: null,
  navigationHistory: [Screen.HOME],

  navigateTo: (screen) =>
    set((state) => ({
      currentScreen: screen,
      previousScreen: state.currentScreen,
      navigationHistory: [...state.navigationHistory, screen],
    })),

  goBack: () =>
    set((state) => {
      const history = [...state.navigationHistory];
      if (history.length <= 1) return state;
      
      history.pop(); // Remove current screen
      const previousScreen = history[history.length - 1];
      
      return {
        currentScreen: previousScreen,
        previousScreen: history[history.length - 2] || null,
        navigationHistory: history,
      };
    }),

  resetNavigation: () =>
    set({
      currentScreen: Screen.HOME,
      previousScreen: null,
      navigationHistory: [Screen.HOME],
    }),
}));