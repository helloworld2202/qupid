import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Screen, MOCK_BADGES } from '@qupid/core';
import { BellIcon, ChevronRightIcon } from '@qupid/ui';
import { usePersonas } from '../hooks/usePersonas';
import { useBadges } from '../hooks/useBadges';
import { usePerformance } from '../hooks/usePerformance';
import { useAppStore } from '../stores/useAppStore';
import { useUserProfile } from '../hooks/api/useUser';
import { useGenerateDynamicPersonas } from '../../features/chat/hooks/useChatQueries';
import { getRandomAvatar } from '../utils/avatarGenerator';
const HomeScreen = ({ onNavigate, onSelectPersona }) => {
    const { currentUserId } = useAppStore();
    // 슬라이드 상태 관리
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [hasViewedAllSlides, setHasViewedAllSlides] = useState(false);
    // 🚀 동적 페르소나 상태 관리
    const [dynamicPersonas, setDynamicPersonas] = useState([]);
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
        if (!userProfile || isGeneratingPersonas)
            return;
        if (process.env.NODE_ENV === 'development') {
            console.log('🚀 동적 페르소나 생성 시작:', userProfile);
        }
        setIsGeneratingPersonas(true);
        // 🚀 즉시 fallback 페르소나 표시 (사용자 경험 개선)
        const immediateFallbackPersonas = [
            {
                id: 'immediate-persona-1',
                name: userProfile.user_gender === 'male' ? '김민지' : '박준호',
                age: userProfile.user_gender === 'male' ? 24 : 26,
                gender: userProfile.user_gender === 'male' ? 'female' : 'male',
                job: userProfile.user_gender === 'male' ? '디자이너' : '개발자',
                avatar: getRandomAvatar(userProfile.user_gender === 'male' ? 'female' : 'male'),
                intro: userProfile.user_gender === 'male' ? '안녕하세요! 디자인을 좋아하는 민지예요 😊' : '안녕하세요! 개발자 준호입니다 👨‍💻',
                tags: userProfile.user_gender === 'male' ? ['디자인', '예술', '창의적'] : ['개발', '기술', '논리적'],
                match_rate: 85,
                systemInstruction: userProfile.user_gender === 'male' ? '당신은 24세 디자이너 김민지입니다. 창의적이고 예술적인 대화를 좋아해요.' : '당신은 26세 개발자 박준호입니다. 기술과 논리적인 대화를 선호해요.',
                personality_traits: userProfile.user_gender === 'male' ? ['창의적', '감성적', '친근함'] : ['논리적', '차분함', '친절함'],
                interests: userProfile.user_gender === 'male' ? [
                    { emoji: '🎨', topic: '디자인', description: 'UI/UX 디자인에 관심이 있어요' },
                    { emoji: '📱', topic: '모바일', description: '모바일 앱 디자인을 좋아해요' },
                    { emoji: '☕', topic: '카페', description: '예쁜 카페에서 작업하는 걸 좋아해요' }
                ] : [
                    { emoji: '💻', topic: '개발', description: '새로운 기술을 배우는 걸 좋아해요' },
                    { emoji: '🎮', topic: '게임', description: '게임 개발에 관심이 있어요' },
                    { emoji: '🏃', topic: '운동', description: '러닝과 헬스장을 자주 가요' }
                ],
                conversation_preview: [
                    { sender: 'ai', text: userProfile.user_gender === 'male' ? '안녕하세요! 오늘 하루는 어땠나요? 😊' : '안녕하세요! 오늘 날씨가 정말 좋네요 😊' }
                ]
            }
        ];
        // 즉시 fallback 페르소나 표시
        setDynamicPersonas(immediateFallbackPersonas);
        console.log('⚡ 즉시 fallback 페르소나 표시 완료');
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
            setCurrentSlideIndex(0);
            setHasViewedAllSlides(false);
        }
        catch (error) {
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
            setCurrentSlideIndex(0);
            setHasViewedAllSlides(false);
            if (process.env.NODE_ENV === 'development') {
                console.log('🔄 Fallback 페르소나 사용:', fallbackPersonas);
            }
        }
        finally {
            setIsGeneratingPersonas(false);
        }
    };
    // 🚀 초기 동적 페르소나 생성 (즉시 fallback 표시)
    useEffect(() => {
        if (userProfile && !isGeneratingPersonas && dynamicPersonas.length === 0) {
            // 즉시 fallback 페르소나 표시 (조건 완화)
            const immediateFallbackPersonas = [
                {
                    id: 'immediate-persona-1',
                    name: userProfile.user_gender === 'male' ? '김민지' : '박준호',
                    age: userProfile.user_gender === 'male' ? 24 : 26,
                    gender: userProfile.user_gender === 'male' ? 'female' : 'male',
                    job: userProfile.user_gender === 'male' ? '디자이너' : '개발자',
                    avatar: getRandomAvatar(userProfile.user_gender === 'male' ? 'female' : 'male'),
                    intro: userProfile.user_gender === 'male' ? '안녕하세요! 디자인을 좋아하는 민지예요 😊' : '안녕하세요! 개발자 준호입니다 👨‍💻',
                    tags: userProfile.user_gender === 'male' ? ['디자인', '예술', '창의적'] : ['개발', '기술', '논리적'],
                    match_rate: 85,
                    systemInstruction: userProfile.user_gender === 'male' ? '당신은 24세 디자이너 김민지입니다. 창의적이고 예술적인 대화를 좋아해요.' : '당신은 26세 개발자 박준호입니다. 기술과 논리적인 대화를 선호해요.',
                    personality_traits: userProfile.user_gender === 'male' ? ['창의적', '감성적', '친근함'] : ['논리적', '차분함', '친절함'],
                    interests: userProfile.user_gender === 'male' ? [
                        { emoji: '🎨', topic: '디자인', description: 'UI/UX 디자인에 관심이 있어요' },
                        { emoji: '📱', topic: '모바일', description: '모바일 앱 디자인을 좋아해요' },
                        { emoji: '☕', topic: '카페', description: '예쁜 카페에서 작업하는 걸 좋아해요' }
                    ] : [
                        { emoji: '💻', topic: '개발', description: '새로운 기술을 배우는 걸 좋아해요' },
                        { emoji: '🎮', topic: '게임', description: '게임 개발에 관심이 있어요' },
                        { emoji: '🏃', topic: '운동', description: '러닝과 헬스장을 자주 가요' }
                    ],
                    conversation_preview: [
                        { sender: 'ai', text: userProfile.user_gender === 'male' ? '안녕하세요! 오늘 하루는 어땠나요? 😊' : '안녕하세요! 오늘 날씨가 정말 좋네요 😊' }
                    ]
                }
            ];
            setDynamicPersonas(prev => {
                if (prev.length === 0) {
                    console.log('⚡ 홈탭 즉시 fallback 페르소나 표시 완료');
                    return immediateFallbackPersonas;
                }
                return prev;
            });
            // 백그라운드에서 동적 페르소나 생성 (중복 방지)
            if (dynamicPersonas.length === 0) {
                generateNewPersonas();
            }
        }
    }, [userProfile, isGeneratingPersonas, dynamicPersonas.length]);
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
    // 🚀 동적 페르소나가 있으면 우선 사용, 없으면 빈 배열 (동적 생성 대기)
    const recommendedPersonas = dynamicPersonas.length > 0 ? dynamicPersonas.slice(0, 3) : [];
    // 🚀 프로덕션용 로그 정리 - 개발 환경에서만 로그 출력
    if (process.env.NODE_ENV === 'development') {
        console.log('📊 HomeScreen 상태:', {
            dynamicPersonas: dynamicPersonas.length,
            recommendedPersonas: recommendedPersonas.length,
            isGeneratingPersonas,
            userProfile: userProfile?.name
        });
    }
    // 로딩 중이거나 사용자 프로필이 없을 때의 기본값
    const defaultUserProfile = {
        name: '사용자',
        user_gender: 'male',
        partner_gender: 'female',
        interests: [],
        experience: '없음',
        confidence: 3,
        difficulty: 2
    };
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
            }
            catch (error) {
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
    // 슬라이드 함수들
    const handleSlideNext = () => {
        if (currentSlideIndex < recommendedPersonas.length - 1) {
            setCurrentSlideIndex(currentSlideIndex + 1);
        }
        else {
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
        return (_jsx("div", { className: "flex justify-center items-center h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-[#0AC5A8]" }) }));
    }
    return (_jsxs("div", { className: "flex flex-col h-full w-full", style: { backgroundColor: 'var(--background)' }, children: [_jsx("header", { className: "flex-shrink-0 p-4 pt-5 bg-white border-b", style: { borderColor: '#F2F4F6' }, children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("img", { src: "https://em-content.zobj.net/source/apple/391/waving-hand_1f44b.png", alt: "profile", className: "w-10 h-10 rounded-full" }), _jsxs("div", { className: "ml-3", children: [_jsxs("p", { className: "font-bold text-xl text-[#191F28]", children: ["\uC548\uB155\uD558\uC138\uC694, ", currentUser.name, "\uB2D8!"] }), _jsx("p", { className: "text-sm text-[#8B95A1]", children: "\uC624\uB298\uB3C4 \uB300\uD654 \uC2E4\uB825\uC744 \uD0A4\uC6CC\uBCFC\uAE4C\uC694?" })] })] }), _jsx("div", { className: "flex items-center space-x-1", children: _jsxs("button", { className: "p-2 relative", children: [_jsx(BellIcon, { className: "w-6 h-6", style: { color: '#191F28' } }), _jsx("div", { className: "absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" })] }) })] }) }), _jsxs("main", { className: "flex-1 overflow-y-auto p-4 space-y-4 pb-24", children: [_jsxs("div", { className: "p-5 rounded-2xl", style: { background: 'linear-gradient(135deg, #FDF2F8, #EBF2FF)' }, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold text-[#191F28]", children: "\uD83D\uDCC5 \uC624\uB298\uC758 \uBAA9\uD45C" }), _jsxs("p", { className: "text-2xl font-bold mt-1", style: { color: '#F093B0' }, children: [todayConversations, "/3 \uB300\uD654 \uC644\uB8CC"] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm font-medium", style: { color: '#4F7ABA' }, children: todayConversations >= 3 ? '목표 달성!' : `${3 - todayConversations}번 더 대화하면 목표 달성!` }), _jsx("button", { onClick: () => {
                                                    const firstRecommended = personas.find(p => p.gender === partnerGender);
                                                    if (firstRecommended && onSelectPersona) {
                                                        onSelectPersona(firstRecommended);
                                                    }
                                                    else {
                                                        onNavigate('CHAT_TAB');
                                                    }
                                                }, className: "mt-2 h-9 px-4 text-sm font-bold text-white rounded-lg", style: { backgroundColor: '#F093B0' }, children: "\uBC14\uB85C \uB300\uD654\uD558\uAE30" })] })] }), _jsx("div", { className: "w-full bg-white/30 h-1.5 rounded-full mt-3", children: _jsx("div", { className: "bg-[#F093B0] h-1.5 rounded-full", style: { width: `${(todayConversations / 3) * 100}%` } }) })] }), _jsxs("div", { onClick: () => onNavigate(Screen.PerformanceDetail), className: "p-5 bg-white rounded-2xl border cursor-pointer transition-all hover:shadow-lg hover:border-[#0AC5A8]", style: { borderColor: '#F2F4F6' }, children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "font-bold text-lg", children: "\uD83D\uDCCA \uC774\uBC88 \uC8FC \uC131\uC7A5" }), _jsxs("div", { className: "flex items-center text-sm font-medium transition-transform hover:translate-x-1", style: { color: '#4F7ABA' }, children: ["\uC790\uC138\uD788 \uBCF4\uAE30 ", _jsx(ChevronRightIcon, { className: "w-4 h-4" })] })] }), _jsxs("div", { className: "mt-2 flex items-baseline space-x-2", children: [_jsxs("p", { className: "text-3xl font-bold", style: { color: '#0AC5A8' }, children: [displayPerformanceData.scoreChange > 0 ? '+' : '', displayPerformanceData.scoreChange, "\uC810 \uD5A5\uC0C1"] }), _jsxs("p", { className: "text-sm font-medium", style: { color: '#8B95A1' }, children: ["\uC9C0\uB09C\uC8FC \uB300\uBE44 ", displayPerformanceData.scoreChangePercentage > 0 ? '+' : '', displayPerformanceData.scoreChangePercentage, "%"] })] })] }), _jsxs("div", { className: "p-5 bg-white rounded-2xl border", style: { borderColor: '#F2F4F6' }, children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-bold text-lg", children: "\uD83D\uDC95 \uC624\uB298\uC758 \uCD94\uCC9C AI" }), _jsx("p", { className: "text-sm text-gray-500", children: isGeneratingPersonas ? 'AI가 당신을 위한 맞춤 친구들을 생성 중이에요...' : '지금 대화하기 좋은 친구들이에요' })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [recommendedPersonas.length > 0 && (_jsxs("span", { className: "text-xs text-gray-400", children: [currentSlideIndex + 1, "/", recommendedPersonas.length] })), hasViewedAllSlides && (_jsx("button", { onClick: handleRefreshRecommendations, disabled: isGeneratingPersonas, className: "px-3 py-1 text-xs font-bold text-white rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed", style: { backgroundColor: '#F093B0' }, children: isGeneratingPersonas ? '생성 중... ⏳' : '새로고침 💎' }))] })] }), isGeneratingPersonas && recommendedPersonas.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-[#F093B0] mb-4" }), _jsx("p", { className: "text-sm text-gray-500", children: "AI\uAC00 \uB2F9\uC2E0\uC5D0\uAC8C \uB9DE\uB294 \uCE5C\uAD6C\uB4E4\uC744 \uCC3E\uACE0 \uC788\uC5B4\uC694..." })] })) : recommendedPersonas.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [_jsx("div", { className: "text-4xl mb-3", children: "\uD83E\uDD16" }), _jsxs("p", { className: "text-sm text-gray-500 text-center", children: ["\uC544\uC9C1 \uCD94\uCC9C\uD560 AI\uAC00 \uC5C6\uC5B4\uC694.", _jsx("br", {}), "\uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824\uC8FC\uC138\uC694!"] })] })) : (_jsx(_Fragment, { children: _jsxs("div", { className: "relative overflow-hidden rounded-xl", children: [_jsx("div", { className: "flex transition-transform duration-300 ease-in-out", style: { transform: `translateX(-${currentSlideIndex * 100}%)` }, children: recommendedPersonas.map((p, index) => (_jsxs("div", { className: "w-full flex-shrink-0 p-6 rounded-xl bg-gradient-to-br from-[#F9FAFB] to-[#F0F4F8] border border-[#E5E8EB] text-center cursor-pointer transition-all hover:shadow-lg hover:border-[#F093B0] hover:-translate-y-1", onClick: () => {
                                                    if (onSelectPersona) {
                                                        onSelectPersona(p);
                                                    }
                                                    else {
                                                        onNavigate('CHAT_TAB');
                                                    }
                                                }, children: [_jsxs("div", { className: "relative w-20 h-20 mx-auto mb-3", children: [_jsx("img", { src: p.avatar, alt: p.name, className: "w-full h-full rounded-full object-cover" }), _jsx("div", { className: "absolute -bottom-1 right-0 w-5 h-5 bg-[#0AC5A8] rounded-full border-2 border-white flex items-center justify-center", children: _jsxs("span", { className: "text-xs font-bold text-white", children: [p.match_rate, "%"] }) })] }), _jsx("h3", { className: "font-bold text-lg mb-1", children: p.name }), _jsxs("p", { className: "text-sm text-gray-600 mb-2", children: [p.age, "\uC138 \u2022 ", p.job] }), _jsx("div", { className: "flex flex-wrap justify-center gap-1 mb-3", children: p.tags?.slice(0, 2).map((tag, tagIndex) => (_jsx("span", { className: "px-2 py-1 text-xs bg-[#F093B0] text-white rounded-full", children: tag }, tagIndex))) }), _jsx("div", { className: "text-xs text-gray-500 mb-3", children: p.intro?.length > 50 ? `${p.intro.substring(0, 50)}...` : p.intro }), _jsx("button", { className: "w-full py-2 px-4 text-sm font-bold text-white rounded-lg transition-all hover:scale-105", style: { backgroundColor: '#F093B0' }, children: "\uC790\uC138\uD788 \uBCF4\uAE30" })] }, p.id))) }), recommendedPersonas.length > 1 && (_jsxs("div", { className: "flex justify-center space-x-2 mt-4", children: [_jsx("button", { onClick: handleSlidePrev, disabled: currentSlideIndex === 0, className: "p-2 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed", style: { backgroundColor: currentSlideIndex === 0 ? '#E5E8EB' : '#F093B0' }, children: _jsx(ChevronRightIcon, { className: "w-4 h-4 text-white rotate-180" }) }), _jsx("div", { className: "flex space-x-1", children: recommendedPersonas.map((_, index) => (_jsx("button", { onClick: () => setCurrentSlideIndex(index), className: `w-2 h-2 rounded-full transition-all ${index === currentSlideIndex ? 'bg-[#F093B0]' : 'bg-[#E5E8EB]'}` }, index))) }), _jsx("button", { onClick: handleSlideNext, disabled: currentSlideIndex === recommendedPersonas.length - 1, className: "p-2 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed", style: { backgroundColor: currentSlideIndex === recommendedPersonas.length - 1 ? '#E5E8EB' : '#F093B0' }, children: _jsx(ChevronRightIcon, { className: "w-4 h-4 text-white" }) })] }))] }) }))] }), recentBadge && (_jsxs("div", { className: "p-4 rounded-2xl flex items-center cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1", style: { background: 'linear-gradient(90deg, #F7F4FF, #FDF2F8)', border: '1px solid #B794F6' }, onClick: () => onNavigate(Screen.Badges), children: [_jsx("span", { className: "text-4xl animate-bounce", children: recentBadge.icon }), _jsxs("div", { className: "flex-1 ml-3", children: [_jsx("p", { className: "font-bold text-base", style: { color: '#191F28' }, children: "\uC0C8\uB85C\uC6B4 \uBC30\uC9C0 \uD68D\uB4DD!" }), _jsx("p", { className: "font-medium text-sm", style: { color: '#8B95A1' }, children: recentBadge.name })] }), _jsx("button", { className: "h-8 px-3 text-xs font-bold text-white rounded-lg transition-transform hover:scale-105", style: { backgroundColor: '#B794F6' }, children: "\uD655\uC778\uD558\uAE30" })] }))] })] }));
};
export { HomeScreen };
export default HomeScreen;
