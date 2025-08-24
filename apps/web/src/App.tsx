import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Providers } from './app/providers';
import { useUserStore } from './shared/stores/userStore';
import { useNavigationStore } from './shared/stores/navigationStore';
import { useAppStore } from './shared/stores/useAppStore';
import { Screen, PREDEFINED_PERSONAS, Badge } from '@qupid/core';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
import { useBadges, useUserBadges } from './shared/hooks/useBadges';
import { FavoritesScreen } from './features/profile/components/FavoritesScreen';
import { NotificationSettingsScreen } from './features/profile/components/NotificationSettingsScreen';
import { DeleteAccountScreen } from './features/profile/components/DeleteAccountScreen';
import { DesignGuideScreen } from './features/profile/components/DesignGuideScreen';
import { PerformanceDetailScreen } from './features/analytics/components/PerformanceDetailScreen';
import { DataExportScreen } from './features/analytics/components/DataExportScreen';
import { LoginScreen } from './features/auth/components/LoginScreen';
import { SignupScreen } from './features/auth/components/SignupScreen';

// Badges Container with API integration
const BadgesContainer: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { data: badges = [], isLoading } = useBadges();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0AC5A8]"></div>
      </div>
    );
  }
  
  return <BadgesScreen badges={badges} onBack={onBack} />;
};

const AppContent: React.FC = () => {
  const { user, setUser } = useUserStore();
  const { currentScreen, navigateTo: originalNavigateTo } = useNavigationStore();
  const [appState, setAppState] = React.useState<'loading' | 'auth' | 'onboarding' | 'main'>('loading');
  const [sessionData, setSessionData] = React.useState<any>(null);
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>(['persona-1', 'persona-3']);
  const [previousScreen, setPreviousScreen] = React.useState<Screen | string>('HOME');

  // 네비게이션 래퍼 - 이전 화면 추적
  const navigateTo = React.useCallback((screen: Screen | string) => {
    setPreviousScreen(currentScreen);
    originalNavigateTo(screen);
  }, [currentScreen, originalNavigateTo]);

  useEffect(() => {
    // Check for auth token first
    const authToken = localStorage.getItem('authToken');
    const storedProfile = localStorage.getItem('userProfile');
    
    if (authToken && storedProfile) {
      // Logged in with profile
      const profile = JSON.parse(storedProfile);
      setUser(profile);
      setAppState('main');
    } else if (authToken) {
      // Logged in but no profile yet
      setAppState('onboarding');
    } else {
      // Not logged in
      setAppState('auth');
    }
  }, [setUser]);

  const handleOnboardingComplete = (profile: any) => {
    const newProfile = {
      ...profile,
      id: `user_${new Date().getTime()}`,
      created_at: new Date().toISOString(),
      isTutorialCompleted: false,
    };
    setUser(newProfile);
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
    setAppState('main');
    navigateTo(Screen.TutorialIntro); // 튜토리얼 소개 화면으로 이동
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return <HomeScreen onNavigate={navigateTo} />;
      
      case 'CHAT_TAB':
        return (
          <ChatTabScreen 
            onNavigate={navigateTo}
            onSelectPersona={(persona) => {
              setSessionData({ persona });
              navigateTo(Screen.PersonaDetail);
            }}
          />
        );
      
      case Screen.ConversationPrep:
        return (
          <ConversationPrepScreen
            partner={sessionData?.partner}
            onStart={() => navigateTo(Screen.Chat)}
            onBack={() => navigateTo('CHAT_TAB')}
          />
        );
      
      case Screen.Chat:
        return (
          <ChatScreen
            partner={sessionData?.partner}
            isTutorial={sessionData?.isTutorial || false}
            onComplete={(analysis, tutorialCompleted) => {
              if (tutorialCompleted && user) {
                // 튜토리얼 완료 시 처리
                const updatedProfile = { ...user, isTutorialCompleted: true };
                setUser(updatedProfile);
                localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
                
                // 홈으로 이동
                setSessionData(null);
                navigateTo('HOME');
              } else {
                // 일반 대화 완료 시 분석 화면으로
                setSessionData({ ...sessionData, analysis, tutorialCompleted });
                navigateTo(Screen.ConversationAnalysis);
              }
            }}
          />
        );
      
      case Screen.ConversationAnalysis:
        // partner가 AICoach인지 확인 (specialty 속성 유무로 판단)
        const isCoachChat = sessionData?.partner && 'specialty' in sessionData.partner;
        return (
          <ConversationAnalysisScreen
            analysis={sessionData?.analysis}
            tutorialJustCompleted={sessionData?.tutorialCompleted}
            onHome={() => navigateTo('HOME')}
            onBack={() => navigateTo(isCoachChat ? 'COACHING_TAB' : 'CHAT_TAB')}
          />
        );
      
      case Screen.PersonaDetail:
        return (
          <PersonaDetailScreen
            persona={sessionData?.persona}
            onBack={() => navigateTo('CHAT_TAB')}
            onStartChat={(persona) => {
              setSessionData({ partner: persona, isTutorial: false });
              navigateTo(Screen.ConversationPrep);
            }}
          />
        );
      
      case Screen.CustomPersona:
        return (
          <CustomPersonaForm
            onSave={(persona) => {
              // Handle custom persona save
              navigateTo('CHAT_TAB');
            }}
            onCancel={() => navigateTo('CHAT_TAB')}
          />
        );
      
      case Screen.TutorialIntro:
        const tutorialPersona = PREDEFINED_PERSONAS.find(p => p.id === 'persona-1');
        if (!tutorialPersona) {
          return <div>Loading...</div>;
        }
        return (
          <TutorialIntroScreen
            persona={tutorialPersona}
            onStart={() => {
              setSessionData({ 
                partner: tutorialPersona, 
                isTutorial: true 
              });
              navigateTo(Screen.ConversationPrep);
            }}
            onBack={() => navigateTo('HOME')}
          />
        );
      
      case 'PERSONA_SELECTION':
        return (
          <PersonaSelection
            onSelect={(type) => {
              // Handle persona selection
              navigateTo('CHAT_TAB');
            }}
            onBack={() => navigateTo('HOME')}
          />
        );
      
      case 'PERSONA_RECOMMENDATION_INTRO':
        return (
          <PersonaRecommendationIntro
            onContinue={() => navigateTo('PERSONA_SELECTION')}
          />
        );
      
      case 'COACHING_TAB':
        return (
          <CoachingTabScreen 
            onNavigate={navigateTo}
            onStartCoachChat={(coach) => {
              setSessionData({ partner: coach, isTutorial: false });
              navigateTo(Screen.Chat);
            }}
          />
        );
      
      case Screen.StylingCoach:
        return <StylingCoach onBack={() => navigateTo('COACHING_TAB')} />;
      
      case Screen.LearningGoals:
        return (
          <LearningGoalsScreen
            onBack={() => navigateTo('MY_TAB')}
            onSave={(goals) => {
              // Handle goals save
              navigateTo('MY_TAB');
            }}
          />
        );
      
      case 'MY_TAB':
        return <MyTabScreen onNavigate={navigateTo} />;
      
      case Screen.ProfileEdit:
        return (
          <ProfileEditScreen
            userProfile={user}
            onBack={() => navigateTo('MY_TAB')}
            onSave={(profile) => {
              setUser(profile);
              navigateTo('MY_TAB');
            }}
          />
        );
      
      case 'SETTINGS':
        return (
          <SettingsScreen
            onBack={() => navigateTo('MY_TAB')}
            onNavigate={navigateTo}
            onLogout={() => {
              // 로그아웃 처리
              localStorage.removeItem('authToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('userId');
              localStorage.removeItem('userProfile');
              setUser(null);
              setAppState('auth');
              navigateTo('LOGIN');
            }}
          />
        );
      
      case Screen.Badges:
        return <BadgesContainer onBack={() => navigateTo(previousScreen)} />;
      
      case Screen.Favorites:
        const favoritePersonas = PREDEFINED_PERSONAS.filter(p => favoriteIds.includes(p.id));
        return (
          <FavoritesScreen
            personas={favoritePersonas}
            onBack={() => navigateTo('MY_TAB')}
            onSelectPersona={(persona) => {
              setSessionData({ persona });
              navigateTo(Screen.PersonaDetail);
            }}
          />
        );
      
      case Screen.NotificationSettings:
        return (
          <NotificationSettingsScreen
            onBack={() => navigateTo('SETTINGS')}
          />
        );
      
      case Screen.DeleteAccount:
        return (
          <DeleteAccountScreen
            onBack={() => navigateTo('SETTINGS')}
            onConfirm={() => {
              localStorage.clear();
              setUser(null);
              setAppState('onboarding');
            }}
          />
        );
      
      case Screen.PerformanceDetail:
        const performanceData = {
          weeklyScore: 78,
          scoreChange: 5,
          scoreChangePercentage: 6.8,
          dailyScores: [65, 70, 72, 68, 75, 78, 78],
          radarData: {
            labels: ['친근함', '호기심', '공감', '유머', '표현력'],
            datasets: [{
              label: '내 점수',
              data: [80, 65, 75, 70, 85],
              backgroundColor: 'rgba(240, 147, 176, 0.2)',
              borderColor: '#F093B0',
              borderWidth: 2,
            }]
          },
          stats: {
            totalTime: '12시간 30분',
            sessionCount: 42,
            avgTime: '18분',
            longestSession: { time: '45분', persona: '김소연' },
            preferredType: '친근한 대화',
          },
          categoryScores: [
            { title: '친근함', emoji: '😊', score: 80, change: 5, goal: 85 },
            { title: '호기심', emoji: '🤔', score: 65, change: -2, goal: 70 },
            { title: '공감', emoji: '💝', score: 75, change: 8, goal: 80 },
          ]
        };
        return (
          <PerformanceDetailScreen
            onBack={() => navigateTo('HOME')}
          />
        );
      
      case Screen.DataExport:
        return <DataExportScreen onBack={() => navigateTo('SETTINGS')} />;
      
      case Screen.DesignGuide:
        return <DesignGuideScreen onBack={() => navigateTo('MY_TAB')} />;
      
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

  // 인증 화면
  if (appState === 'auth') {
    switch (currentScreen) {
      case 'SIGNUP':
        return (
          <SignupScreen
            onNavigate={navigateTo}
            onSignupSuccess={(userData) => {
              if (userData.profile) {
                setUser(userData.profile);
                localStorage.setItem('userProfile', JSON.stringify(userData.profile));
                setAppState('main');
                navigateTo('HOME');
              } else {
                setAppState('onboarding');
                navigateTo('ONBOARDING');
              }
            }}
          />
        );
      
      case 'LOGIN':
      default:
        return (
          <LoginScreen
            onNavigate={navigateTo}
            onLoginSuccess={(userData) => {
              if (userData.profile) {
                setUser(userData.profile);
                localStorage.setItem('userProfile', JSON.stringify(userData.profile));
                setAppState('main');
                navigateTo('HOME');
              } else {
                setAppState('onboarding');
                navigateTo('ONBOARDING');
              }
            }}
          />
        );
    }
  }

  if (appState === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const showBottomNav = [
    'HOME',
    'CHAT_TAB',
    'COACHING_TAB',
    'MY_TAB'
  ].includes(currentScreen as string);

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
    <QueryClientProvider client={queryClient}>
      <Providers>
        <AppContent />
      </Providers>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;