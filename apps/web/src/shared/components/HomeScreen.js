import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Screen, PREDEFINED_PERSONAS, MOCK_BADGES, MOCK_PERFORMANCE_DATA } from '@qupid/core';
import { BellIcon, ChevronRightIcon } from '@qupid/ui';
import { usePersonas } from '../hooks/usePersonas';
import { useBadges } from '../hooks/useBadges';
import { usePerformance } from '../hooks/usePerformance';
import { useAppStore } from '../stores/useAppStore';
import { useUserProfile } from '../hooks/api/useUser';
const HomeScreen = ({ onNavigate, onSelectPersona }) => {
    const { currentUserId } = useAppStore();
    // API 데이터 페칭 (실패 시 constants 사용)
    const { data: apiPersonas = [], isLoading: isLoadingPersonas } = usePersonas();
    const { data: apiBadges = [], isLoading: isLoadingBadges } = useBadges();
    const { data: apiPerformanceData } = usePerformance(currentUserId || '');
    const { data: userProfile } = useUserProfile(currentUserId || '');
    // API 데이터가 없으면 constants 사용
    const allPersonas = apiPersonas.length > 0 ? apiPersonas : PREDEFINED_PERSONAS;
    const allBadges = apiBadges.length > 0 ? apiBadges : MOCK_BADGES;
    const performanceData = apiPerformanceData || MOCK_PERFORMANCE_DATA;
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
    };
    const displayPerformanceData = performanceData || defaultPerformanceData;
    const recentBadge = badges && badges.length > 0 ? badges.find(b => b.featured) : undefined;
    const partnerGender = currentUser.user_gender === 'female' ? 'male' : 'female';
    const recommendedPersonas = personas && personas.length > 0
        ? personas.filter(p => p.gender === partnerGender).slice(0, 5)
        : [];
    // 로딩 상태 처리
    if (isLoadingPersonas || isLoadingBadges) {
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
                                                }, className: "mt-2 h-9 px-4 text-sm font-bold text-white rounded-lg", style: { backgroundColor: '#F093B0' }, children: "\uBC14\uB85C \uB300\uD654\uD558\uAE30" })] })] }), _jsx("div", { className: "w-full bg-white/30 h-1.5 rounded-full mt-3", children: _jsx("div", { className: "bg-[#F093B0] h-1.5 rounded-full", style: { width: `${(todayConversations / 3) * 100}%` } }) })] }), _jsxs("div", { onClick: () => onNavigate(Screen.PerformanceDetail), className: "p-5 bg-white rounded-2xl border cursor-pointer transition-all hover:shadow-lg hover:border-[#0AC5A8]", style: { borderColor: '#F2F4F6' }, children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "font-bold text-lg", children: "\uD83D\uDCCA \uC774\uBC88 \uC8FC \uC131\uC7A5" }), _jsxs("div", { className: "flex items-center text-sm font-medium transition-transform hover:translate-x-1", style: { color: '#4F7ABA' }, children: ["\uC790\uC138\uD788 \uBCF4\uAE30 ", _jsx(ChevronRightIcon, { className: "w-4 h-4" })] })] }), _jsxs("div", { className: "mt-2 flex items-baseline space-x-2", children: [_jsxs("p", { className: "text-3xl font-bold", style: { color: '#0AC5A8' }, children: [displayPerformanceData.scoreChange > 0 ? '+' : '', displayPerformanceData.scoreChange, "\uC810 \uD5A5\uC0C1"] }), _jsxs("p", { className: "text-sm font-medium", style: { color: '#8B95A1' }, children: ["\uC9C0\uB09C\uC8FC \uB300\uBE44 ", displayPerformanceData.scoreChangePercentage > 0 ? '+' : '', displayPerformanceData.scoreChangePercentage, "%"] })] })] }), _jsxs("div", { className: "p-5 bg-white rounded-2xl border", style: { borderColor: '#F2F4F6' }, children: [_jsx("h2", { className: "font-bold text-lg", children: "\uD83D\uDC95 \uC624\uB298\uC758 \uCD94\uCC9C AI" }), _jsx("p", { className: "text-sm text-gray-500 mb-4", children: "\uC9C0\uAE08 \uB300\uD654\uD558\uAE30 \uC88B\uC740 \uCE5C\uAD6C\uB4E4\uC774\uC5D0\uC694" }), _jsx("div", { className: "flex space-x-3 overflow-x-auto pb-2 -mx-5 px-5", children: recommendedPersonas.map((p, index) => (_jsxs("div", { onClick: () => {
                                        if (onSelectPersona) {
                                            onSelectPersona(p);
                                        }
                                        else {
                                            onNavigate('CHAT_TAB');
                                        }
                                    }, className: "flex-shrink-0 w-32 p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E8EB] text-center cursor-pointer transition-all hover:shadow-md hover:border-[#F093B0] hover:-translate-y-1", style: { animationDelay: `${index * 100}ms` }, children: [_jsxs("div", { className: "relative w-16 h-16 mx-auto", children: [_jsx("img", { src: p.avatar, alt: p.name, className: "w-full h-full rounded-full object-cover" }), _jsx("div", { className: "absolute -bottom-0.5 right-0 w-4 h-4 bg-[#0AC5A8] rounded-full border-2 border-white" })] }), _jsx("p", { className: "mt-2 font-bold text-sm truncate", children: p.name }), _jsxs("p", { className: "text-xs text-[#0AC5A8] font-bold", children: [p.match_rate, "%"] })] }, p.id))) })] }), recentBadge && (_jsxs("div", { className: "p-4 rounded-2xl flex items-center cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1", style: { background: 'linear-gradient(90deg, #F7F4FF, #FDF2F8)', border: '1px solid #B794F6' }, onClick: () => onNavigate(Screen.Badges), children: [_jsx("span", { className: "text-4xl animate-bounce", children: recentBadge.icon }), _jsxs("div", { className: "flex-1 ml-3", children: [_jsx("p", { className: "font-bold text-base", style: { color: '#191F28' }, children: "\uC0C8\uB85C\uC6B4 \uBC30\uC9C0 \uD68D\uB4DD!" }), _jsx("p", { className: "font-medium text-sm", style: { color: '#8B95A1' }, children: recentBadge.name })] }), _jsx("button", { className: "h-8 px-3 text-xs font-bold text-white rounded-lg transition-transform hover:scale-105", style: { backgroundColor: '#B794F6' }, children: "\uD655\uC778\uD558\uAE30" })] }))] })] }));
};
export { HomeScreen };
export default HomeScreen;
