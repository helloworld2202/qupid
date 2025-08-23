import React, { useEffect } from 'react';
import { Providers } from './app/providers';
import { useUserStore } from './shared/stores/userStore';
import { useNavigationStore } from './shared/stores/navigationStore';
import { Screen } from '@qupid/core';

// Shared Components
import { BottomNavBar } from './shared/components/BottomNavBar';
import { HomeScreen } from './shared/components/HomeScreen';

// Feature Components
import { OnboardingFlow } from './features/onboarding/components/OnboardingFlow';
import { ChatTabScreen } from './features/chat/components/ChatTabScreen';
import { ChatScreen } from './features/chat/components/ChatScreen';
import { ConversationPrepScreen } from './features/chat/components/ConversationPrepScreen';
import { ConversationAnalysisScreen } from './features/chat/components/ConversationAnalysisScreen';
import { PersonaDetailScreen } from './features/chat/components/PersonaDetailScreen';
import { CustomPersonaForm } from './features/chat/components/CustomPersonaForm';
import { TutorialIntroScreen } from './features/onboarding/components/TutorialIntroScreen';
import { PersonaSelection } from './features/onboarding/components/PersonaSelection';
import { PersonaRecommendationIntro } from './features/onboarding/components/PersonaRecommendationIntro';
import { CoachingTabScreen } from './features/coaching/components/CoachingTabScreen';
import { StylingCoach } from './features/coaching/components/StylingCoach';
import { LearningGoalsScreen } from './features/coaching/components/LearningGoalsScreen';
import { MyTabScreen } from './features/profile/components/MyTabScreen';
import { ProfileEditScreen } from './features/profile/components/ProfileEditScreen';
import { SettingsScreen } from './features/profile/components/SettingsScreen';
import { BadgesScreen } from './features/profile/components/BadgesScreen';
import { FavoritesScreen } from './features/profile/components/FavoritesScreen';
import { NotificationSettingsScreen } from './features/profile/components/NotificationSettingsScreen';
import { DeleteAccountScreen } from './features/profile/components/DeleteAccountScreen';
import { PerformanceDetailScreen } from './features/analytics/components/PerformanceDetailScreen';
import { DataExportScreen } from './features/analytics/components/DataExportScreen';

const AppContent: React.FC = () => {
  const { user, isOnboardingComplete, setUser } = useUserStore();
  const { currentScreen, navigateTo } = useNavigationStore();
  const [appState, setAppState] = React.useState<'loading' | 'onboarding' | 'main'>('loading');
  const [sessionData, setSessionData] = React.useState<any>(null);

  useEffect(() => {
    // Check local storage for existing user profile
    const storedProfile = localStorage.getItem('userProfile');
    
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      setUser(profile);
      setAppState('main');
    } else {
      setAppState('onboarding');
    }
  }, [setUser]);

  const handleOnboardingComplete = (profile: any) => {
    setUser(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setAppState('main');
    navigateTo(Screen.HOME);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.HOME:
        return <HomeScreen onNavigate={navigateTo} />;
      
      case Screen.CHAT_TAB:
        return <ChatTabScreen onNavigate={navigateTo} />;
      
      case Screen.CONVERSATION_PREP:
        return (
          <ConversationPrepScreen
            partner={sessionData?.partner}
            onStart={() => navigateTo(Screen.CHAT)}
            onBack={() => navigateTo(Screen.CHAT_TAB)}
          />
        );
      
      case Screen.CHAT:
        return (
          <ChatScreen
            partner={sessionData?.partner}
            isTutorial={sessionData?.isTutorial || false}
            onComplete={(analysis, tutorialCompleted) => {
              setSessionData({ ...sessionData, analysis, tutorialCompleted });
              navigateTo(Screen.CONVERSATION_ANALYSIS);
            }}
          />
        );
      
      case Screen.CONVERSATION_ANALYSIS:
        return (
          <ConversationAnalysisScreen
            analysis={sessionData?.analysis}
            tutorialJustCompleted={sessionData?.tutorialCompleted}
            onHome={() => navigateTo(Screen.HOME)}
            onBack={() => navigateTo(Screen.CHAT_TAB)}
          />
        );
      
      case Screen.PERSONA_DETAIL:
        return (
          <PersonaDetailScreen
            persona={sessionData?.persona}
            onBack={() => navigateTo(Screen.CHAT_TAB)}
            onStartChat={(persona) => {
              setSessionData({ partner: persona, isTutorial: false });
              navigateTo(Screen.CONVERSATION_PREP);
            }}
          />
        );
      
      case Screen.CUSTOM_PERSONA_FORM:
        return (
          <CustomPersonaForm
            onSave={(persona) => {
              // Handle custom persona save
              navigateTo(Screen.CHAT_TAB);
            }}
            onCancel={() => navigateTo(Screen.CHAT_TAB)}
          />
        );
      
      case Screen.TUTORIAL_INTRO:
        return (
          <TutorialIntroScreen
            onStart={() => {
              // Start tutorial
              navigateTo(Screen.CHAT);
            }}
            onSkip={() => navigateTo(Screen.HOME)}
          />
        );
      
      case Screen.PERSONA_SELECTION:
        return (
          <PersonaSelection
            onSelect={(type) => {
              // Handle persona selection
              navigateTo(Screen.CHAT_TAB);
            }}
            onBack={() => navigateTo(Screen.HOME)}
          />
        );
      
      case Screen.PERSONA_RECOMMENDATION_INTRO:
        return (
          <PersonaRecommendationIntro
            onContinue={() => navigateTo(Screen.PERSONA_SELECTION)}
          />
        );
      
      case Screen.COACHING_TAB:
        return <CoachingTabScreen onNavigate={navigateTo} />;
      
      case Screen.STYLING_COACH:
        return <StylingCoach onBack={() => navigateTo(Screen.COACHING_TAB)} />;
      
      case Screen.LEARNING_GOALS:
        return (
          <LearningGoalsScreen
            onBack={() => navigateTo(Screen.MY_TAB)}
            onSave={(goals) => {
              // Handle goals save
              navigateTo(Screen.MY_TAB);
            }}
          />
        );
      
      case Screen.MY_TAB:
        return <MyTabScreen onNavigate={navigateTo} />;
      
      case Screen.PROFILE_EDIT:
        return (
          <ProfileEditScreen
            onBack={() => navigateTo(Screen.MY_TAB)}
            onSave={(profile) => {
              setUser(profile);
              navigateTo(Screen.MY_TAB);
            }}
          />
        );
      
      case Screen.SETTINGS:
        return (
          <SettingsScreen
            onBack={() => navigateTo(Screen.MY_TAB)}
            onNavigate={navigateTo}
          />
        );
      
      case Screen.BADGES:
        return <BadgesScreen onBack={() => navigateTo(Screen.MY_TAB)} />;
      
      case Screen.FAVORITES:
        return (
          <FavoritesScreen
            onBack={() => navigateTo(Screen.MY_TAB)}
            onSelectPersona={(persona) => {
              setSessionData({ persona });
              navigateTo(Screen.PERSONA_DETAIL);
            }}
          />
        );
      
      case Screen.NOTIFICATION_SETTINGS:
        return (
          <NotificationSettingsScreen
            onBack={() => navigateTo(Screen.SETTINGS)}
          />
        );
      
      case Screen.DELETE_ACCOUNT:
        return (
          <DeleteAccountScreen
            onBack={() => navigateTo(Screen.SETTINGS)}
            onConfirm={() => {
              localStorage.clear();
              setUser(null);
              setAppState('onboarding');
            }}
          />
        );
      
      case Screen.PERFORMANCE_DETAIL:
        return (
          <PerformanceDetailScreen
            performanceData={sessionData?.performanceData}
            onBack={() => navigateTo(Screen.MY_TAB)}
          />
        );
      
      case Screen.DATA_EXPORT:
        return <DataExportScreen onBack={() => navigateTo(Screen.SETTINGS)} />;
      
      default:
        return <HomeScreen onNavigate={navigateTo} />;
    }
  };

  if (appState === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (appState === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const showBottomNav = [
    Screen.HOME,
    Screen.CHAT_TAB,
    Screen.COACHING_TAB,
    Screen.MY_TAB
  ].includes(currentScreen);

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-white">
      <div className="flex-1 overflow-hidden">
        {renderScreen()}
      </div>
      {showBottomNav && (
        <BottomNavBar
          activeTab={currentScreen}
          onTabChange={navigateTo}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Providers>
      <AppContent />
    </Providers>
  );
};

export default App;