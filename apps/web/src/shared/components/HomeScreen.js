import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
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
        if (!userProfile || isGeneratingPersonas)
            return;
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
            setHasGeneratedPersonas(true);
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
    // 🚀 슬라이드 함수들 제거 - 더 이상 슬라이드 UI 사용하지 않음
    // 로딩 상태 처리
    if (isLoadingPersonas || isLoadingBadges || isLoadingPerformance) {
        return (_jsx("div", { className: "flex justify-center items-center h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-[#0AC5A8]" }) }));
    }
    return (_jsxs("div", { className: "flex flex-col h-full w-full", style: { backgroundColor: 'var(--background)' }, children: [_jsx("header", { className: "flex-shrink-0 p-4 pt-5 bg-white border-b", style: { borderColor: '#F2F4F6' }, children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("img", { src: "https://em-content.zobj.net/source/apple/391/waving-hand_1f44b.png", alt: "profile", className: "w-10 h-10 rounded-full" }), _jsxs("div", { className: "ml-3", children: [_jsxs("p", { className: "font-bold text-xl text-[#191F28]", children: ["\uC548\uB155\uD558\uC138\uC694, ", currentUser.name, "\uB2D8!"] }), _jsx("p", { className: "text-sm text-[#8B95A1]", children: "\uC624\uB298\uB3C4 \uB300\uD654 \uC2E4\uB825\uC744 \uD0A4\uC6CC\uBCFC\uAE4C\uC694?" })] })] }), _jsx("div", { className: "flex items-center space-x-1", children: _jsxs("button", { className: "p-2 relative", children: [_jsx(BellIcon, { className: "w-6 h-6", style: { color: '#191F28' } }), _jsx("div", { className: "absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" })] }) })] }) }), _jsxs("main", { className: "flex-1 overflow-y-auto p-4 space-y-4 pb-24", children: [_jsxs("div", { className: "p-5 rounded-2xl", style: { background: 'linear-gradient(135deg, #FDF2F8, #EBF2FF)' }, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold text-[#191F28]", children: "\uD83D\uDCC5 \uC624\uB298\uC758 \uBAA9\uD45C" }), _jsxs("p", { className: "text-2xl font-bold mt-1", style: { color: '#F093B0' }, children: [todayConversations, "/3 \uB300\uD654 \uC644\uB8CC"] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm font-medium", style: { color: '#4F7ABA' }, children: todayConversations >= 3 ? '🎉 목표 달성!' : `${3 - todayConversations}번 더 대화하면 목표 달성!` }), _jsx("button", { onClick: () => {
                                                    if (onSelectPersona) {
                                                        onSelectPersona(quickStartPersona);
                                                    }
                                                    else {
                                                        onNavigate('CHAT_TAB');
                                                    }
                                                }, className: "mt-2 h-9 px-4 text-sm font-bold text-white rounded-lg", style: { backgroundColor: '#F093B0' }, children: "\u26A1 \uC9C0\uAE08 \uB300\uD654\uD558\uAE30" })] })] }), _jsx("div", { className: "w-full bg-white/30 h-1.5 rounded-full mt-3", children: _jsx("div", { className: "bg-[#F093B0] h-1.5 rounded-full", style: { width: `${(todayConversations / 3) * 100}%` } }) })] }), _jsxs("div", { className: "p-5 bg-white rounded-2xl border", style: { borderColor: '#F2F4F6' }, children: [_jsx("h2", { className: "font-bold text-lg mb-4", children: "\u26A1 \uBE60\uB978 \uC561\uC158" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("button", { onClick: () => onNavigate('CHAT_TAB'), className: "p-4 rounded-xl border-2 border-[#F093B0] bg-[#FDF2F8] transition-all hover:shadow-lg hover:-translate-y-0.5", children: [_jsx("div", { className: "text-2xl mb-2", children: "\uD83D\uDC65" }), _jsx("p", { className: "font-bold text-sm", children: "AI \uCE5C\uAD6C\uB4E4" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "\uB2E4\uC591\uD55C AI\uC640 \uB300\uD654" })] }), _jsxs("button", { onClick: () => onNavigate('COACHING_TAB'), className: "p-4 rounded-xl border-2 border-[#0AC5A8] bg-[#F0FDFA] transition-all hover:shadow-lg hover:-translate-y-0.5", children: [_jsx("div", { className: "text-2xl mb-2", children: "\uD83D\uDCDA" }), _jsx("p", { className: "font-bold text-sm", children: "\uC804\uBB38 \uCF54\uCE6D" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "\uC2A4\uD0AC \uD5A5\uC0C1 \uB3C4\uC6C0" })] })] })] }), _jsxs("div", { onClick: () => onNavigate(Screen.PerformanceDetail), className: "p-5 bg-white rounded-2xl border cursor-pointer transition-all hover:shadow-lg hover:border-[#0AC5A8]", style: { borderColor: '#F2F4F6' }, children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "font-bold text-lg", children: "\uD83D\uDCCA \uC774\uBC88 \uC8FC \uC131\uC7A5" }), _jsxs("div", { className: "flex items-center text-sm font-medium transition-transform hover:translate-x-1", style: { color: '#4F7ABA' }, children: ["\uC790\uC138\uD788 \uBCF4\uAE30 ", _jsx(ChevronRightIcon, { className: "w-4 h-4" })] })] }), _jsxs("div", { className: "mt-2 flex items-baseline space-x-2", children: [_jsxs("p", { className: "text-3xl font-bold", style: { color: '#0AC5A8' }, children: [displayPerformanceData.scoreChange > 0 ? '+' : '', displayPerformanceData.scoreChange, "\uC810 \uD5A5\uC0C1"] }), _jsxs("p", { className: "text-sm font-medium", style: { color: '#8B95A1' }, children: ["\uC9C0\uB09C\uC8FC \uB300\uBE44 ", displayPerformanceData.scoreChangePercentage > 0 ? '+' : '', displayPerformanceData.scoreChangePercentage, "%"] })] })] }), _jsxs("div", { className: "p-5 bg-white rounded-2xl border", style: { borderColor: '#F2F4F6' }, children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "font-bold text-lg", children: "\uD83D\uDCDD \uCD5C\uADFC \uD65C\uB3D9" }), _jsx("button", { onClick: () => onNavigate('CHAT_TAB'), className: "text-sm font-bold text-[#F093B0] hover:underline", children: "\uC804\uCCB4 \uBCF4\uAE30" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center p-3 rounded-lg border border-[#F2F4F6] hover:border-[#F093B0] transition-colors cursor-pointer", children: [_jsx("img", { src: quickStartPersona.avatar, alt: quickStartPersona.name, className: "w-10 h-10 rounded-full object-cover" }), _jsxs("div", { className: "ml-3 flex-1", children: [_jsx("p", { className: "font-semibold text-sm", children: quickStartPersona.name }), _jsx("p", { className: "text-xs text-gray-500", children: "2\uC2DC\uAC04 \uC804" })] }), _jsx("div", { className: "text-xs text-gray-400", children: "15\uBD84 \uB300\uD654" })] }), _jsxs("div", { className: "flex items-center p-3 rounded-lg border border-[#F2F4F6] hover:border-[#F093B0] transition-colors cursor-pointer", children: [_jsx("img", { src: getRandomAvatar('female'), alt: "AI \uCE5C\uAD6C", className: "w-10 h-10 rounded-full object-cover" }), _jsxs("div", { className: "ml-3 flex-1", children: [_jsx("p", { className: "font-semibold text-sm", children: "\uC774\uC11C\uC601" }), _jsx("p", { className: "text-xs text-gray-500", children: "\uC5B4\uC81C" })] }), _jsx("div", { className: "text-xs text-gray-400", children: "12\uBD84 \uB300\uD654" })] }), _jsxs("div", { className: "flex items-center p-3 rounded-lg border border-[#F2F4F6] hover:border-[#F093B0] transition-colors cursor-pointer", children: [_jsx("img", { src: getRandomAvatar('male'), alt: "AI \uCE5C\uAD6C", className: "w-10 h-10 rounded-full object-cover" }), _jsxs("div", { className: "ml-3 flex-1", children: [_jsx("p", { className: "font-semibold text-sm", children: "\uBC15\uC900\uD638" }), _jsx("p", { className: "text-xs text-gray-500", children: "3\uC77C \uC804" })] }), _jsx("div", { className: "text-xs text-gray-400", children: "8\uBD84 \uB300\uD654" })] })] })] }), recentBadge && (_jsxs("div", { className: "p-4 rounded-2xl flex items-center cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1", style: { background: 'linear-gradient(90deg, #F7F4FF, #FDF2F8)', border: '1px solid #B794F6' }, onClick: () => onNavigate(Screen.Badges), children: [_jsx("span", { className: "text-4xl animate-bounce", children: recentBadge.icon }), _jsxs("div", { className: "flex-1 ml-3", children: [_jsx("p", { className: "font-bold text-base", style: { color: '#191F28' }, children: "\uC0C8\uB85C\uC6B4 \uBC30\uC9C0 \uD68D\uB4DD!" }), _jsx("p", { className: "font-medium text-sm", style: { color: '#8B95A1' }, children: recentBadge.name })] }), _jsx("button", { className: "h-8 px-3 text-xs font-bold text-white rounded-lg transition-transform hover:scale-105", style: { backgroundColor: '#B794F6' }, children: "\uD655\uC778\uD558\uAE30" })] }))] })] }));
};
export { HomeScreen };
export default HomeScreen;
