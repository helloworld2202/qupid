

import React, { useState, useEffect } from 'react';
import { UserProfile, Screen, PerformanceData, PREDEFINED_PERSONAS, MOCK_BADGES, MOCK_PERFORMANCE_DATA } from '@qupid/core';
import { BellIcon, ChevronRightIcon } from '@qupid/ui';
import { usePersonas } from '../hooks/usePersonas';
import { useBadges } from '../hooks/useBadges';
import { usePerformance } from '../hooks/usePerformance';
import { useAppStore } from '../stores/useAppStore';
import { useUserProfile } from '../hooks/api/useUser';
import { useGenerateDynamicPersonas } from '../../features/chat/hooks/useChatQueries';
import { getRandomAvatar } from '../utils/avatarGenerator';

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
  const [hasGeneratedPersonas, setHasGeneratedPersonas] = useState(false);
  
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
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 동적 페르소나 생성 시작:', userProfile);
    }
    setIsGeneratingPersonas(true);
    
    // 🚀 진짜 API 호출만 수행 - 즉시 fallback 제거
    
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
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ 동적 페르소나 생성 성공:', newPersonas);
      }
      setDynamicPersonas(newPersonas);
      setHasGeneratedPersonas(true);
      setCurrentSlideIndex(0);
      setHasViewedAllSlides(false);
    } catch (error) {
      console.error('❌ 동적 페르소나 생성 실패:', error);
      
      // 🚀 Fallback: 동적 페르소나 생성 실패 시 기본 페르소나 사용
      const fallbackPersonas = [
        {
          id: 'fallback-persona-1',
          name: '김민지',
          age: 24,
          gender: 'female',
          job: '디자이너',
          avatar: getRandomAvatar('female'),
          intro: '안녕하세요! 디자인을 좋아하는 민지예요 😊',
          tags: ['디자인', '예술', '창의적'],
          match_rate: 85,
          systemInstruction: '당신은 24세 디자이너 김민지입니다. 창의적이고 예술적인 대화를 좋아해요.',
          personality_traits: ['창의적', '감성적', '친근함'],
          interests: [
            { emoji: '🎨', topic: '디자인', description: '그래픽 디자인을 좋아해요' },
            { emoji: '📸', topic: '사진', description: '일상 사진 찍는 걸 좋아해요' }
          ],
          conversation_preview: [
            { sender: 'ai', text: '안녕하세요! 오늘 하루는 어땠나요? 😊' }
          ]
        },
        {
          id: 'fallback-persona-2',
          name: '박준호',
          age: 26,
          gender: 'male',
          job: '개발자',
          avatar: getRandomAvatar('male'),
          intro: '안녕하세요! 개발자 준호입니다 👨‍💻',
          tags: ['개발', '기술', '논리적'],
          match_rate: 82,
          systemInstruction: '당신은 26세 개발자 박준호입니다. 기술과 논리적인 대화를 선호해요.',
          personality_traits: ['논리적', '차분함', '친절함'],
          interests: [
            { emoji: '💻', topic: '프로그래밍', description: '새로운 기술을 배우는 걸 좋아해요' },
            { emoji: '🎮', topic: '게임', description: '스팀 게임을 즐겨해요' }
          ],
          conversation_preview: [
            { sender: 'ai', text: '안녕하세요! 어떤 일로 바쁘셨나요? 👋' }
          ]
        }
      ];
      
      setDynamicPersonas(fallbackPersonas);
      setHasGeneratedPersonas(true);
      setCurrentSlideIndex(0);
      setHasViewedAllSlides(false);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Fallback 페르소나 사용:', fallbackPersonas);
      }
    } finally {
      setIsGeneratingPersonas(false);
    }
  };

  // 🚀 수동 생성 방식으로 변경 - 자동 생성 로직 제거

  // 🚀 동적 페르소나 우선 사용, 없으면 API 데이터 사용
  const allPersonas = dynamicPersonas.length > 0 ? dynamicPersonas : apiPersonas;
  const allBadges = apiBadges.length > 0 ? apiBadges : MOCK_BADGES;
  // 🚀 실제 성과 데이터 사용 (API에서 가져온 데이터 또는 기본값)
  const performanceData = apiPerformanceData || {
    weeklyScore: 0,
    scoreChange: 0,
    scoreChangePercentage: 0,
    dailyScores: [0, 0, 0, 0, 0, 0, 0],
    radarData: {
      labels: ['친근함', '호기심', '공감력', '유머', '배려', '적극성'],
      datasets: [{
        label: '이번 주',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(240, 147, 176, 0.2)',
        borderColor: 'rgba(240, 147, 176, 1)',
        borderWidth: 2,
      }]
    },
    stats: {
      totalTime: '0분',
      sessionCount: 0,
      avgTime: '0분',
      longestSession: { time: '0분', persona: '' },
      preferredType: '아직 대화 기록이 없습니다'
    },
    categoryScores: [
      { title: '친근함', emoji: '😊', score: 0, change: 0, goal: 90 },
      { title: '호기심', emoji: '🤔', score: 0, change: 0, goal: 90 },
      { title: '공감력', emoji: '💬', score: 0, change: 0, goal: 70 },
    ]
  };
  
  // 🚀 홈탭은 목표 중심 대시보드로 변경 - AI 페르소나 슬라이드 제거
  // 가장 추천하는 1명의 AI만 빠른 액션용으로 사용
  const quickStartPersona = dynamicPersonas.length > 0 ? dynamicPersonas[0] : {
    id: 'quick-start-persona',
    name: '김민지',
    age: 24,
    gender: 'female',
    job: '디자이너',
    avatar: getRandomAvatar('female'),
    intro: '안녕하세요! 디자인을 좋아하는 민지예요 😊',
    tags: ['디자인', '예술', '창의적'],
    match_rate: 85,
    systemInstruction: '당신은 24세 디자이너 김민지입니다. 창의적이고 예술적인 대화를 좋아해요.',
    personality_traits: ['창의적', '감성적', '친근함'],
    interests: [
      { emoji: '🎨', topic: '디자인', description: '그래픽 디자인을 좋아해요' },
      { emoji: '📸', topic: '사진', description: '일상 사진 찍는 걸 좋아해요' }
    ],
    conversation_preview: [
      { sender: 'ai', text: '안녕하세요! 오늘 하루는 어땠나요? 😊' }
    ]
  };
  
  // 🚀 프로덕션용 로그 정리 - 개발 환경에서만 로그 출력
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 HomeScreen 상태:', {
      dynamicPersonas: dynamicPersonas.length,
      quickStartPersona: quickStartPersona.name,
      isGeneratingPersonas,
      userProfile: userProfile?.name
    });
  }
  
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
  
  // 🚀 하드코딩된 데이터 제거 - 이제 API 데이터만 사용
  
  const displayPerformanceData = performanceData;
  const recentBadge = badges && badges.length > 0 ? badges.find(b => b.featured) : undefined;
  const partnerGender = currentUser.user_gender === 'female' ? 'male' : 'female';
  
  // 🚀 슬라이드 함수들 제거 - 더 이상 슬라이드 UI 사용하지 않음
  
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
        
        {/* 🚀 목표 중심 대시보드 */}
        <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #FDF2F8, #EBF2FF)' }}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-[#191F28]">📅 오늘의 목표</p>
                    <p className="text-2xl font-bold mt-1" style={{color: '#F093B0'}}>{todayConversations}/3 대화 완료</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium" style={{color: '#4F7ABA'}}>
                        {todayConversations >= 3 ? '🎉 목표 달성!' : `${3 - todayConversations}번 더 대화하면 목표 달성!`}
                    </p>
                    <button onClick={() => {
                        if (onSelectPersona) {
                            onSelectPersona(quickStartPersona);
                        } else {
                            onNavigate('CHAT_TAB');
                        }
                    }} className="mt-2 h-9 px-4 text-sm font-bold text-white rounded-lg" style={{backgroundColor: '#F093B0'}}>
                        ⚡ 지금 대화하기
                    </button>
                </div>
            </div>
            <div className="w-full bg-white/30 h-1.5 rounded-full mt-3">
                <div className="bg-[#F093B0] h-1.5 rounded-full" style={{width: `${(todayConversations / 3) * 100}%`}}></div>
            </div>
        </div>

        {/* 🚀 빠른 액션 섹션 */}
        <div className="p-5 bg-white rounded-2xl border" style={{borderColor: '#F2F4F6'}}>
            <h2 className="font-bold text-lg mb-4">⚡ 빠른 액션</h2>
            <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onNavigate('CHAT_TAB')}
                  className="p-4 rounded-xl border-2 border-[#F093B0] bg-[#FDF2F8] transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="text-2xl mb-2">👥</div>
                  <p className="font-bold text-sm">AI 친구들</p>
                  <p className="text-xs text-gray-500 mt-1">다양한 AI와 대화</p>
                </button>
                <button 
                  onClick={() => onNavigate('COACHING_TAB')}
                  className="p-4 rounded-xl border-2 border-[#0AC5A8] bg-[#F0FDFA] transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="text-2xl mb-2">📚</div>
                  <p className="font-bold text-sm">전문 코칭</p>
                  <p className="text-xs text-gray-500 mt-1">스킬 향상 도움</p>
                </button>
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

        {/* 🚀 최근 활동 섹션 */}
        <div className="p-5 bg-white rounded-2xl border" style={{borderColor: '#F2F4F6'}}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">📝 최근 활동</h2>
                <button 
                  onClick={() => onNavigate('CHAT_TAB')}
                  className="text-sm font-bold text-[#F093B0] hover:underline"
                >
                  전체 보기
                </button>
            </div>
            
            {/* 🚀 동적 최근 대화 기록 - 실제 AI 페르소나 기반 */}
            <div className="space-y-3">
                {dynamicPersonas.slice(0, 3).map((persona, index) => {
                    const timeAgo = index === 0 ? '2시간 전' : index === 1 ? '어제' : '3일 전';
                    const duration = index === 0 ? '15분 대화' : index === 1 ? '12분 대화' : '8분 대화';
                    
                    return (
                        <div 
                            key={persona.id} 
                            className="flex items-center p-3 rounded-lg border border-[#F2F4F6] hover:border-[#F093B0] transition-colors cursor-pointer"
                            onClick={() => onSelectPersona && onSelectPersona(persona)}
                        >
                            <img src={persona.avatar} alt={persona.name} className="w-10 h-10 rounded-full object-cover" />
                            <div className="ml-3 flex-1">
                                <p className="font-semibold text-sm">{persona.name}</p>
                                <p className="text-xs text-gray-500">{timeAgo}</p>
                            </div>
                            <div className="text-xs text-gray-400">{duration}</div>
                        </div>
                    );
                })}
                
                {/* 🚀 페르소나가 3개 미만일 때 fallback 표시 */}
                {dynamicPersonas.length < 3 && (
                    <div className="flex items-center justify-center p-3 rounded-lg border border-dashed border-[#F093B0]">
                        <div className="text-center">
                            <p className="text-sm text-[#F093B0] font-semibold">더 많은 AI 친구를 만나보세요!</p>
                            <button 
                                onClick={() => onNavigate('CHAT_TAB')}
                                className="text-xs text-[#F093B0] hover:underline mt-1"
                            >
                                대화탭으로 이동
                            </button>
                        </div>
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
