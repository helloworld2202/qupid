

import React, { useState, useEffect } from 'react';
import { UserProfile, Screen, PerformanceData, PREDEFINED_PERSONAS, MOCK_BADGES, MOCK_PERFORMANCE_DATA } from '@qupid/core';
import { BellIcon, ChevronRightIcon } from '@qupid/ui';
import { usePersonas } from '../hooks/usePersonas';
import { useBadges } from '../hooks/useBadges';
import { usePerformance } from '../hooks/usePerformance';
import { useAppStore } from '../stores/useAppStore';
import { useUserProfile } from '../hooks/api/useUser';
import { useGenerateDynamicPersonas } from '../../features/chat/hooks/useChatQueries';

interface HomeScreenProps {
  onNavigate: (screen: Screen | string) => void;
  onSelectPersona?: (persona: any) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onSelectPersona }) => {
  const { currentUserId } = useAppStore();
  
  // 슬라이드 상태 관리
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [hasViewedAllSlides, setHasViewedAllSlides] = useState(false);
  
  // 🚀 동적 페르소나 상태 관리
  const [dynamicPersonas, setDynamicPersonas] = useState<any[]>([]);
  const [isGeneratingPersonas, setIsGeneratingPersonas] = useState(false);
  
  // API 데이터 페칭 (실패 시 constants 사용)
  const { data: apiPersonas = [], isLoading: isLoadingPersonas } = usePersonas();
  const { data: apiBadges = [], isLoading: isLoadingBadges } = useBadges();
  const { data: apiPerformanceData, isLoading: isLoadingPerformance } = usePerformance(currentUserId || '');
  const { data: userProfile } = useUserProfile(currentUserId || '');
  
  // 🚀 동적 페르소나 생성 훅
  const generateDynamicPersonasMutation = useGenerateDynamicPersonas();
  
  // 🚀 동적 페르소나 생성 함수
  const generateNewPersonas = async () => {
    if (!userProfile || isGeneratingPersonas) return;
    
    setIsGeneratingPersonas(true);
    try {
      const newPersonas = await generateDynamicPersonasMutation.mutateAsync({
        userProfile: {
          name: userProfile.name,
          age: 25, // 기본값
          gender: userProfile.user_gender,
          job: '학생', // 기본값
          interests: userProfile.interests || [],
          experience: userProfile.experience,
          mbti: 'ENFP', // 기본값
          personality: ['친근함', '긍정적'] // 기본값
        },
        count: 3
      });
      
      setDynamicPersonas(newPersonas);
      setCurrentSlideIndex(0);
      setHasViewedAllSlides(false);
    } catch (error) {
      console.error('동적 페르소나 생성 실패:', error);
    } finally {
      setIsGeneratingPersonas(false);
    }
  };

  // 🚀 초기 동적 페르소나 생성
  useEffect(() => {
    if (userProfile && dynamicPersonas.length === 0 && !isGeneratingPersonas) {
      generateNewPersonas();
    }
  }, [userProfile]);

  // API 데이터가 없으면 constants 사용
  const allPersonas = apiPersonas.length > 0 ? apiPersonas : PREDEFINED_PERSONAS;
  const allBadges = apiBadges.length > 0 ? apiBadges : MOCK_BADGES;
  const performanceData = apiPerformanceData || MOCK_PERFORMANCE_DATA;
  
  // 🚀 동적 페르소나가 있으면 우선 사용, 없으면 기본 페르소나 사용
  const recommendedPersonas = dynamicPersonas.length > 0 ? dynamicPersonas : allPersonas.slice(0, 3);
  
  // 로딩 중이거나 사용자 프로필이 없을 때의 기본값
  const defaultUserProfile = { 
    name: '사용자', 
    user_gender: 'male' as const,
    partner_gender: 'female' as const,
    interests: [],
    experience: '없음',
    confidence: 3,
    difficulty: 2
  } as UserProfile;
  
  const currentUser = userProfile || defaultUserProfile;
  
  // 오늘의 대화 수 계산
  const todayConversations = React.useMemo(() => {
    // localStorage에서 오늘의 대화 기록 확인
    const today = new Date().toDateString();
    const todayConversationsData = localStorage.getItem(`conversations_${today}`);
    
    if (todayConversationsData) {
      try {
        const conversations = JSON.parse(todayConversationsData);
        return conversations.length;
      } catch (error) {
        console.error('Error parsing today conversations:', error);
        return 0;
      }
    }
    
    // 게스트 모드인 경우 게스트 채팅 수 확인
    const guestChatCount = parseInt(localStorage.getItem('guestChatCount') || '0');
    return guestChatCount;
  }, []);
  
  // 이성 페르소나만 필터링
  const personas = allPersonas.filter(p => p.gender === (currentUser.partner_gender || 'female'));
  
  // 획득한 뱃지만 필터링
  const badges = allBadges.filter(b => b.acquired);
  
  // 기본 성과 데이터 (API 로딩 중일 때 사용)
  const defaultPerformanceData = {
    weeklyScore: 0,
    scoreChange: 0,
    scoreChangePercentage: 0,
    dailyScores: [60, 65, 70, 68, 75, 72, 78],
    radarData: {
      labels: ['친근함', '호기심', '공감력', '유머', '배려', '적극성'],
      datasets: [{
        label: '이번 주',
        data: [85, 92, 58, 60, 75, 70],
        backgroundColor: 'rgba(240, 147, 176, 0.2)',
        borderColor: 'rgba(240, 147, 176, 1)',
        borderWidth: 2,
      }]
    },
    stats: {
      totalTime: '2시간 15분',
      sessionCount: 8,
      avgTime: '17분',
      longestSession: { time: '32분', persona: '소연님과' },
      preferredType: '활발한 성격 (60%)'
    },
    categoryScores: [
      { title: '친근함', emoji: '😊', score: 85, change: 8, goal: 90 },
      { title: '호기심', emoji: '🤔', score: 92, change: 15, goal: 90 },
      { title: '공감력', emoji: '💬', score: 58, change: 3, goal: 70 },
    ]
  } as PerformanceData;
  
  const displayPerformanceData = performanceData || defaultPerformanceData;
  const recentBadge = badges && badges.length > 0 ? badges.find(b => b.featured) : undefined;
  const partnerGender = currentUser.user_gender === 'female' ? 'male' : 'female';
  
  // 슬라이드 함수들
  const handleSlideNext = () => {
    if (currentSlideIndex < recommendedPersonas.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      // 마지막 슬라이드까지 본 경우
      setHasViewedAllSlides(true);
    }
  };
  
  const handleSlidePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      setHasViewedAllSlides(false);
    }
  };
  
  const handleRefreshRecommendations = async () => {
    // 🚀 새로운 동적 페르소나 생성
    console.log('🔄 새로운 추천 AI를 위해 비용을 지불합니다...');
    await generateNewPersonas();
  };
  
  // 로딩 상태 처리
  if (isLoadingPersonas || isLoadingBadges || isLoadingPerformance) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0AC5A8]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className="flex-shrink-0 p-4 pt-5 bg-white border-b" style={{borderColor: '#F2F4F6'}}>
        <div className="flex justify-between items-center">
            <div className="flex items-center">
                <img src="https://em-content.zobj.net/source/apple/391/waving-hand_1f44b.png" alt="profile" className="w-10 h-10 rounded-full" />
                <div className="ml-3">
                    <p className="font-bold text-xl text-[#191F28]">안녕하세요, {currentUser.name}님!</p>
                    <p className="text-sm text-[#8B95A1]">오늘도 대화 실력을 키워볼까요?</p>
                </div>
            </div>
            <div className="flex items-center space-x-1">
                 <button className="p-2 relative">
                    <BellIcon className="w-6 h-6" style={{color: '#191F28'}}/>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                </button>
            </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        
        {/* Today Goal Card */}
        <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #FDF2F8, #EBF2FF)' }}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-[#191F28]">📅 오늘의 목표</p>
                    <p className="text-2xl font-bold mt-1" style={{color: '#F093B0'}}>{todayConversations}/3 대화 완료</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium" style={{color: '#4F7ABA'}}>
                        {todayConversations >= 3 ? '목표 달성!' : `${3 - todayConversations}번 더 대화하면 목표 달성!`}
                    </p>
                    <button onClick={() => {
                        const firstRecommended = personas.find(p => p.gender === partnerGender);
                        if (firstRecommended && onSelectPersona) {
                            onSelectPersona(firstRecommended);
                        } else {
                            onNavigate('CHAT_TAB');
                        }
                    }} className="mt-2 h-9 px-4 text-sm font-bold text-white rounded-lg" style={{backgroundColor: '#F093B0'}}>
                        바로 대화하기
                    </button>
                </div>
            </div>
            <div className="w-full bg-white/30 h-1.5 rounded-full mt-3">
                <div className="bg-[#F093B0] h-1.5 rounded-full" style={{width: `${(todayConversations / 3) * 100}%`}}></div>
            </div>
        </div>

        {/* Performance Card */}
        <div onClick={() => onNavigate(Screen.PerformanceDetail)} className="p-5 bg-white rounded-2xl border cursor-pointer transition-all hover:shadow-lg hover:border-[#0AC5A8]" style={{borderColor: '#F2F4F6'}}>
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg">📊 이번 주 성장</h2>
                <div className="flex items-center text-sm font-medium transition-transform hover:translate-x-1" style={{color: '#4F7ABA'}}>
                    자세히 보기 <ChevronRightIcon className="w-4 h-4" />
                </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
                <p className="text-3xl font-bold" style={{color: '#0AC5A8'}}>
                    {displayPerformanceData.scoreChange > 0 ? '+' : ''}{displayPerformanceData.scoreChange}점 향상
                </p>
                <p className="text-sm font-medium" style={{color: '#8B95A1'}}>
                    지난주 대비 {displayPerformanceData.scoreChangePercentage > 0 ? '+' : ''}{displayPerformanceData.scoreChangePercentage}%
                </p>
            </div>
        </div>

        {/* Recommended AI Card - 슬라이드 UI */}
        <div className="p-5 bg-white rounded-2xl border" style={{borderColor: '#F2F4F6'}}>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="font-bold text-lg">💕 오늘의 추천 AI</h2>
                    <p className="text-sm text-gray-500">지금 대화하기 좋은 친구들이에요</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">{currentSlideIndex + 1}/{recommendedPersonas.length}</span>
                    {hasViewedAllSlides && (
                        <button 
                          onClick={handleRefreshRecommendations}
                          disabled={isGeneratingPersonas}
                          className="px-3 py-1 text-xs font-bold text-white rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{backgroundColor: '#F093B0'}}
                        >
                          {isGeneratingPersonas ? '생성 중... ⏳' : '새로고침 💎'}
                        </button>
                    )}
                </div>
            </div>
            
            {/* 슬라이드 컨테이너 */}
            <div className="relative overflow-hidden rounded-xl">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
                >
                    {recommendedPersonas.map((p, index) => (
                        <div 
                          key={p.id} 
                          className="w-full flex-shrink-0 p-6 rounded-xl bg-gradient-to-br from-[#F9FAFB] to-[#F0F4F8] border border-[#E5E8EB] text-center cursor-pointer transition-all hover:shadow-lg hover:border-[#F093B0] hover:-translate-y-1"
                          onClick={() => {
                            if (onSelectPersona) {
                              onSelectPersona(p);
                            } else {
                              onNavigate('CHAT_TAB');
                            }
                          }}
                        >
                            <div className="relative w-20 h-20 mx-auto mb-3">
                               <img src={p.avatar} alt={p.name} className="w-full h-full rounded-full object-cover" />
                               <div className="absolute -bottom-1 right-0 w-5 h-5 bg-[#0AC5A8] rounded-full border-2 border-white flex items-center justify-center">
                                 <span className="text-xs font-bold text-white">{p.match_rate}%</span>
                               </div>
                            </div>
                            <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{p.age}세 • {p.job}</p>
                            <div className="flex flex-wrap justify-center gap-1 mb-3">
                                {p.tags?.slice(0, 2).map((tag: string, tagIndex: number) => (
                                    <span key={tagIndex} className="px-2 py-1 text-xs bg-[#F093B0] text-white rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="text-xs text-gray-500 mb-3">
                                {p.intro?.length > 50 ? `${p.intro.substring(0, 50)}...` : p.intro}
                            </div>
                            <button className="w-full py-2 px-4 text-sm font-bold text-white rounded-lg transition-all hover:scale-105" style={{backgroundColor: '#F093B0'}}>
                                자세히 보기
                            </button>
                        </div>
                    ))}
                </div>
                
                {/* 슬라이드 네비게이션 */}
                {recommendedPersonas.length > 1 && (
                    <div className="flex justify-center space-x-2 mt-4">
                        <button 
                          onClick={handleSlidePrev}
                          disabled={currentSlideIndex === 0}
                          className="p-2 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{backgroundColor: currentSlideIndex === 0 ? '#E5E8EB' : '#F093B0'}}
                        >
                            <ChevronRightIcon className="w-4 h-4 text-white rotate-180" />
                        </button>
                        <div className="flex space-x-1">
                            {recommendedPersonas.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentSlideIndex(index)}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    index === currentSlideIndex ? 'bg-[#F093B0]' : 'bg-[#E5E8EB]'
                                  }`}
                                />
                            ))}
                        </div>
                        <button 
                          onClick={handleSlideNext}
                          disabled={currentSlideIndex === recommendedPersonas.length - 1}
                          className="p-2 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{backgroundColor: currentSlideIndex === recommendedPersonas.length - 1 ? '#E5E8EB' : '#F093B0'}}
                        >
                            <ChevronRightIcon className="w-4 h-4 text-white" />
                        </button>
                    </div>
                )}
            </div>
        </div>
        
        {/* Achievement Banner */}
        {recentBadge && (
            <div 
              className="p-4 rounded-2xl flex items-center cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1" 
              style={{ background: 'linear-gradient(90deg, #F7F4FF, #FDF2F8)', border: '1px solid #B794F6' }}
              onClick={() => onNavigate(Screen.Badges)}
            >
                <span className="text-4xl animate-bounce">{recentBadge.icon}</span>
                <div className="flex-1 ml-3">
                    <p className="font-bold text-base" style={{color: '#191F28'}}>새로운 배지 획득!</p>
                    <p className="font-medium text-sm" style={{color: '#8B95A1'}}>{recentBadge.name}</p>
                </div>
                <button className="h-8 px-3 text-xs font-bold text-white rounded-lg transition-transform hover:scale-105" style={{backgroundColor: '#B794F6'}}>
                    확인하기
                </button>
            </div>
        )}

      </main>
    </div>
  );
};

export { HomeScreen };
export default HomeScreen;
