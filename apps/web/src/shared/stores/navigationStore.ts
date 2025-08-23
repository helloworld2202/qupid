import { create } from 'zustand';
import { Screen } from '@qupid/core';

type NavigationScreen = Screen | 'HOME' | 'CHAT_TAB' | 'COACHING_TAB' | 'MY_TAB' | 'SETTINGS' | 'PERSONA_SELECTION' | 'PERSONA_RECOMMENDATION_INTRO';

interface NavigationState {
  currentScreen: NavigationScreen;
  previousScreen: NavigationScreen | null;
  navigationHistory: NavigationScreen[];
  
  // Actions
  navigateTo: (screen: NavigationScreen) => void;
  goBack: () => void;
  resetNavigation: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentScreen: 'HOME',
  previousScreen: null,
  navigationHistory: ['HOME'],

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
      currentScreen: 'HOME',
      previousScreen: null,
      navigationHistory: ['HOME'],
    }),
}));