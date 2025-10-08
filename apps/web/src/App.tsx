import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Providers } from './app/providers';
import { useUserStore } from './shared/stores/userStore';
import { useNavigationStore } from './shared/stores/navigationStore';
import { Screen, NavigationScreen } from '@qupid/core';

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
import { useBadges } from './shared/hooks/useBadges';
import { FavoritesScreen } from './features/profile/components/FavoritesScreen';
import NotificationSettingsScreen from './features/profile/components/NotificationSettingsScreen';
import { DeleteAccountScreen } from './features/profile/components/DeleteAccountScreen';
import { DesignGuideScreen } from './features/profile/components/DesignGuideScreen';
import { PerformanceDetailScreen } from './features/analytics/components/PerformanceDetailScreen';
import { DataExportScreen } from './features/analytics/components/DataExportScreen';
import { LoginScreen } from './features/auth/components/LoginScreen';
import { SignupScreen } from './features/auth/components/SignupScreen';
import AuthCallback from './features/auth/components/AuthCallback';

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
  const [appState, setAppState] = React.useState<'loading' | 'guest' | 'auth' | 'onboarding' | 'main'>('loading');
  const [sessionData, setSessionData] = React.useState<any>(null);
  // const [favoriteIds] = React.useState<string[]>(['persona-1', 'persona-3']);
  const [previousScreen, setPreviousScreen] = React.useState<NavigationScreen>('HOME');
  const [isGuest, setIsGuest] = React.useState(false);

  // 네비게이션 래퍼 - 이전 화면 추적
  const navigateTo = React.useCallback((screen: NavigationScreen) => {
    setPreviousScreen(currentScreen);
    originalNavigateTo(screen as any);
  }, [currentScreen, originalNavigateTo]);

  useEffect(() => {
    // 튜토리얼 세션 데이터 로드
    const tutorialSessionData = localStorage.getItem('tutorialSessionData');
    if (tutorialSessionData) {
      try {
        const session = JSON.parse(tutorialSessionData);
        setSessionData(session);
        console.log('튜토리얼 세션 데이터 로드됨:', session);
      } catch (error) {
        console.error('튜토리얼 세션 데이터 파싱 오류:', error);
      }
    }

    // Check if this is a social login callback
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const refreshToken = urlParams.get('refresh_token');
    
    if (token && refreshToken) {
      // This is a social login callback, check if we're in onboarding flow
      const isOnboardingFlow = localStorage.getItem('isOnboardingFlow') === 'true';
      
      if (isOnboardingFlow) {
        // Store tokens and continue with onboarding
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.removeItem('isOnboardingFlow');
        setAppState('onboarding');
        navigateTo('ONBOARDING');
        return;
      } else {
        // Regular social login callback
        setAppState('auth');
        navigateTo('AUTH_CALLBACK');
        return;
      }
    }

    // Check for auth token first
    const authToken = localStorage.getItem('authToken');
    const storedProfile = localStorage.getItem('userProfile');
    const guestId = localStorage.getItem('guestId');
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    
    if (authToken && storedProfile) {
      // Logged in with profile
      const profile = JSON.parse(storedProfile);
      setUser(profile);
      setAppState('main');
    } else if (authToken) {
      // Logged in but no profile yet
      setAppState('onboarding');
    } else if (hasCompletedOnboarding && guestId) {
      // Guest user who completed onboarding
      const guestProfile = {
        id: guestId,
        name: '게스트',
        user_gender: (localStorage.getItem('guestGender') || 'male') as 'male' | 'female',
        partner_gender: (localStorage.getItem('guestPartnerGender') || 'female') as 'male' | 'female',
        experience: localStorage.getItem('guestExperience') || '없음',
        confidence: parseInt(localStorage.getItem('guestConfidence') || '3'),
        difficulty: parseInt(localStorage.getItem('guestDifficulty') || '2'),
        interests: JSON.parse(localStorage.getItem('guestInterests') || '[]'),
        isTutorialCompleted: localStorage.getItem('guestTutorialCompleted') === 'true',
        isGuest: true
      };
      setUser(guestProfile);
      setIsGuest(true);
      setAppState('main');
    } else {
      // New user - start with onboarding
      setAppState('onboarding');
      navigateTo('ONBOARDING');
    }
  }, [setUser, navigateTo]);

  const handleOnboardingComplete = (profile: any, tutorialPersona?: any) => {
    // 게스트 프로필 생성
    const guestId = `guest_${new Date().getTime()}`;
    const newProfile = {
      ...profile,
      id: guestId,
      name: '게스트',
      created_at: new Date().toISOString(),
      isTutorialCompleted: false,
      isGuest: true
    };
    
    // 게스트 정보를 localStorage에 저장
    localStorage.setItem('guestId', guestId);
    localStorage.setItem('guestGender', profile.user_gender);
    localStorage.setItem('guestPartnerGender', profile.partner_gender);
    localStorage.setItem('guestExperience', profile.experience);
    localStorage.setItem('guestConfidence', profile.confidence.toString());
    localStorage.setItem('guestDifficulty', profile.difficulty.toString());
    localStorage.setItem('guestInterests', JSON.stringify(profile.interests || []));
    localStorage.setItem('hasCompletedOnboarding', 'true');
    
    setUser(newProfile);
    setIsGuest(true);
    setAppState('main');
    
    // 튜토리얼 페르소나를 sessionData에 저장
    console.log('🎉 온보딩 완료:', profile);
    console.log('🤖 튜토리얼 페르소나:', tutorialPersona);
    
    if (tutorialPersona) {
      setSessionData({ partner: tutorialPersona, isTutorial: true });
      console.log('✅ 온보딩 완료 - 튜토리얼 페르소나와 함께 튜토리얼 화면으로 이동', tutorialPersona);
    } else {
      console.log('⚠️ 튜토리얼 페르소나 없음 - 튜토리얼 화면으로 이동');
    }
    
    navigateTo(Screen.TutorialIntro);
  };
  
  // 회원가입/로그인 유도 함수
  const requireAuth = (callback?: () => void) => {
    if (isGuest) {
      // 게스트 사용자일 경우 회원가입 유도
      const confirmSignup = window.confirm('이 기능을 사용하려면 회원가입이 필요합니다. 회원가입 하시겠습니까?');
      if (confirmSignup) {
        navigateTo(Screen.SIGNUP);
      }
      return false;
    } else if (!user) {
      // 로그인되지 않은 경우
      navigateTo(Screen.LOGIN);
      return false;
    }
    // 인증된 사용자
    if (callback) callback();
    return true;
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return <HomeScreen 
          onNavigate={navigateTo} 
          onSelectPersona={(persona) => {
            setSessionData({ persona });
            navigateTo(Screen.PersonaDetail);
          }}
        />;
      
      case 'CHAT_TAB':
        return (
          <ChatTabScreen 
            onNavigate={navigateTo}
            onSelectPersona={(persona) => {
              // 게스트는 최대 3번의 대화만 가능
              if (isGuest) {
                const guestChatCount = parseInt(localStorage.getItem('guestChatCount') || '0');
                if (guestChatCount >= 3) {
                  requireAuth();
                  return;
                }
              }
              setSessionData({ persona });
              navigateTo(Screen.PersonaDetail);
            }}
          />
        );
      
      case Screen.ConversationPrep:
        return (
          <ConversationPrepScreen
            partner={sessionData?.partner}
            onStart={(mode) => {
              setSessionData({ ...sessionData, conversationMode: mode, isTutorial: sessionData?.isTutorial || false });
              navigateTo(Screen.Chat);
            }}
            onBack={() => navigateTo('CHAT_TAB')}
          />
        );
      
      case Screen.Chat:
        return (
          <ChatScreen
            partner={sessionData?.partner}
            isTutorial={sessionData?.isTutorial || false}
            isCoaching={sessionData?.isCoaching || false}
            conversationMode={sessionData?.conversationMode || 'normal'}
            userProfile={user} // 사용자 프로필 전달
            onComplete={async (analysis, tutorialCompleted) => {
              if (tutorialCompleted && user) {
                // 튜토리얼 완료 시 처리
                const updatedProfile = { ...user, isTutorialCompleted: true };
                setUser(updatedProfile);
                
                if (isGuest) {
                  // 게스트 사용자의 튜토리얼 완료 상태 저장
                  localStorage.setItem('guestTutorialCompleted', 'true');
                } else {
                  // 일반 사용자는 서버에 업데이트
                  localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
                  const userId = localStorage.getItem('userId');
                  if (userId) {
                    try {
                      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
                      await fetch(`${API_URL}/users/${userId}/tutorial/complete`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                      });
                    } catch (error) {
                      console.error('Failed to update tutorial status:', error);
                    }
                  }
                }
                
                // 홈으로 이동
                setSessionData(null);
                navigateTo('HOME');
              } else {
                // 일반 대화 완료 시
                if (isGuest && !sessionData?.isTutorial) {
                  // 게스트 채팅 횟수 증가
                  const currentCount = parseInt(localStorage.getItem('guestChatCount') || '0');
                  localStorage.setItem('guestChatCount', (currentCount + 1).toString());
                }
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
              // 튜토리얼 모드인 경우 isTutorial 유지
              const isTutorialMode = sessionData?.isTutorial || false;
              setSessionData({ partner: persona, isTutorial: isTutorialMode });
              navigateTo(Screen.ConversationPrep);
            }}
          />
        );
      
      case Screen.CustomPersona:
        return (
          <CustomPersonaForm
            onCancel={() => navigateTo('CHAT_TAB')}
          />
        );
      
      case Screen.TutorialIntro:
        // sessionData에서 튜토리얼 페르소나 가져오기
        const tutorialPartner = sessionData?.partner;
        
        // 🚀 페르소나 정보가 없으면 에러 화면 표시
        if (!tutorialPartner) {
          return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-white">
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">페르소나 정보가 없습니다</h2>
                <p className="text-gray-600 mb-6">튜토리얼을 시작할 수 없습니다.</p>
                <button 
                  onClick={() => navigateTo('HOME')}
                  className="px-6 py-3 bg-[#0AC5A8] text-white rounded-lg font-medium hover:bg-[#08A693] transition-colors"
                >
                  돌아가기
                </button>
              </div>
            </div>
          );
        }
        
        return (
          <TutorialIntroScreen
            persona={tutorialPartner}
            onBack={() => navigateTo('HOME')}
            onComplete={() => {
              // 튜토리얼 페르소나를 설정하고 튜토리얼 모드로 표시
              setSessionData({ partner: tutorialPartner, isTutorial: true });
              navigateTo(Screen.PersonaDetail);
            }}
          />
        );
      
      case 'PERSONA_SELECTION':
        return (
          <PersonaSelection
            personas={[]}
            userProfile={user!}
            onSelect={() => {
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
              // 게스트는 코칭 기능 사용 불가
              if (isGuest) {
                requireAuth();
                return;
              }
              // 코치와의 채팅 시작 (프렉 화면 건너뛰고 바로 채팅으로)
              setSessionData({ partner: coach, isTutorial: false, isCoaching: true });
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
          />
        );
      
      case 'MY_TAB':
        return (
          <MyTabScreen 
            onNavigate={(screen) => {
              // 게스트 사용자가 특정 기능에 접근하려 할 때 회원가입 유도
              const restrictedScreens = [Screen.Badges, Screen.Favorites, Screen.LearningGoals];
              if (isGuest && restrictedScreens.includes(screen)) {
                requireAuth();
                return;
              }
              navigateTo(screen);
            }}
            onLogout={() => {
              if (isGuest) {
                // 게스트 데이터 초기화
                localStorage.removeItem('guestId');
                localStorage.removeItem('guestGender');
                localStorage.removeItem('guestPartnerGender');
                localStorage.removeItem('guestExperience');
                localStorage.removeItem('guestConfidence');
                localStorage.removeItem('guestDifficulty');
                localStorage.removeItem('guestInterests');
                localStorage.removeItem('guestTutorialCompleted');
                localStorage.removeItem('guestChatCount');
                localStorage.removeItem('hasCompletedOnboarding');
                setUser(null);
                setIsGuest(false);
                setAppState('onboarding');
                navigateTo('ONBOARDING');
              } else {
                // 일반 사용자 로그아웃
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('userProfile');
                setUser(null);
                setAppState('auth');
                navigateTo(Screen.LOGIN);
              }
            }}
            isGuest={isGuest}
          />
        );
      
      case Screen.ProfileEdit:
        return (
          <ProfileEditScreen
            userProfile={user!}
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
              navigateTo(Screen.LOGIN);
            }}
          />
        );
      
      case Screen.Badges:
        return <BadgesContainer onBack={() => navigateTo(previousScreen)} />;
      
      case Screen.Favorites:
        const favoritePersonas: any[] = []; // TODO: Load from API
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
            notificationTime={localStorage.getItem('notificationTime') || '19:00'}
            doNotDisturbStart={localStorage.getItem('doNotDisturbStart') || '22:00'}
            doNotDisturbEnd={localStorage.getItem('doNotDisturbEnd') || '08:00'}
            onSave={(notificationTime, doNotDisturbStart, doNotDisturbEnd) => {
              localStorage.setItem('notificationTime', notificationTime);
              localStorage.setItem('doNotDisturbStart', doNotDisturbStart);
              localStorage.setItem('doNotDisturbEnd', doNotDisturbEnd);
            }}
          />
        );
      
      case Screen.DeleteAccount:
        return (
          <DeleteAccountScreen
            onBack={() => navigateTo('SETTINGS')}
            onComplete={() => {
              localStorage.clear();
              setUser(null);
              setAppState('onboarding');
            }}
          />
        );
      
      case Screen.PerformanceDetail:
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
      case 'AUTH_CALLBACK':
        return <AuthCallback onNavigate={navigateTo} />;
      
      case Screen.SIGNUP:
        return (
          <SignupScreen
            onNavigate={navigateTo}
            onSignupSuccess={(userData) => {
              if (userData.profile) {
                setUser(userData.profile);
                localStorage.setItem('userProfile', JSON.stringify(userData.profile));
                setAppState('main');
                // 튜토리얼 완료 여부에 따라 다른 화면으로 이동
                if (!userData.profile.is_tutorial_completed) {
                  navigateTo(Screen.TutorialIntro);
                } else {
                  navigateTo('HOME');
                }
              } else {
                setAppState('onboarding');
                navigateTo('ONBOARDING');
              }
            }}
          />
        );
      
      case Screen.LOGIN:
      default:
        return (
          <LoginScreen
            onNavigate={navigateTo}
            onLoginSuccess={(userData) => {
              if (userData.profile) {
                setUser(userData.profile);
                localStorage.setItem('userProfile', JSON.stringify(userData.profile));
                setAppState('main');
                // 튜토리얼 완료 여부에 따라 다른 화면으로 이동
                if (!userData.profile.is_tutorial_completed) {
                  navigateTo(Screen.TutorialIntro);
                } else {
                  navigateTo('HOME');
                }
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
          activeTab={String(currentScreen)}
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