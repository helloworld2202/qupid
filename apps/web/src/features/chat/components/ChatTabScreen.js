import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Screen } from '@qupid/core';
import { SearchIcon, SettingsIcon, PlusCircleIcon } from '@qupid/ui';
import { usePersonas } from '../../../shared/hooks/usePersonas';
import { useFavorites } from '../../../shared/hooks/useUser';
import { useAppStore } from '../../../shared/stores/useAppStore';
import { useGenerateDynamicPersonas } from '../hooks/useChatQueries';
import { useUserProfile } from '../../../shared/hooks/api/useUser';
const PersonaCard = ({ persona, onSelect }) => {
    return (_jsxs("div", { className: "w-full p-4 flex bg-white rounded-2xl border border-[#F2F4F6] transition-all hover:shadow-lg hover:border-[#F093B0] hover:-translate-y-0.5 cursor-pointer", onClick: onSelect, children: [_jsx("img", { src: persona.avatar, alt: persona.name, className: "w-20 h-20 rounded-xl object-cover" }), _jsxs("div", { className: "ml-4 flex-1 flex flex-col", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-bold text-lg text-[#191F28]", children: [persona.name, ", ", persona.age] }), _jsxs("p", { className: "text-sm text-[#8B95A1] mt-0.5", children: [persona.job, " \u00B7 ", persona.mbti] })] }), _jsxs("p", { className: "font-bold text-sm text-[#0AC5A8]", children: [persona.match_rate, "% \uB9DE\uC74C"] })] }), _jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: persona.tags.map(tag => (_jsxs("span", { className: "px-2 py-0.5 bg-[#EBF2FF] text-[#4F7ABA] text-xs font-medium rounded-md", children: ["#", tag] }, tag))) })] })] }));
};
const ChatTabScreen = ({ onNavigate, onSelectPersona: onSelectPersonaProp }) => {
    const [searchQuery] = useState('');
    const [dynamicPersonas, setDynamicPersonas] = useState([]);
    const [isGeneratingPersonas, setIsGeneratingPersonas] = useState(false);
    const [hasGeneratedPersonas, setHasGeneratedPersonas] = useState(false);
    const { currentUserId } = useAppStore();
    // API 호출
    const { data: apiPersonas = [], isLoading: isLoadingPersonas } = usePersonas();
    const { data: userProfile } = useUserProfile(currentUserId || '');
    const generateDynamicPersonasMutation = useGenerateDynamicPersonas();
    // 🚀 동적 페르소나 생성
    const generateNewPersonas = async () => {
        if (!userProfile || isGeneratingPersonas)
            return;
        setIsGeneratingPersonas(true);
        // 🚀 진짜 API 호출만 수행 - 즉시 fallback 제거
        try {
            const newPersonas = await generateDynamicPersonasMutation.mutateAsync({
                userProfile: {
                    name: userProfile.name,
                    age: 25,
                    gender: userProfile.user_gender,
                    job: '학생',
                    interests: userProfile.interests || [],
                    experience: userProfile.experience,
                    mbti: 'ENFP',
                    personality: ['친근함', '긍정적']
                },
                count: 6
            });
            setDynamicPersonas(newPersonas);
            setHasGeneratedPersonas(true);
            console.log('🎉 동적 페르소나로 업데이트 완료:', newPersonas.length, '개');
        }
        catch (error) {
            console.error('❌ 동적 페르소나 생성 실패:', error);
            console.log('⚠️ fallback 페르소나 유지');
        }
        finally {
            setIsGeneratingPersonas(false);
        }
    };
    // 🚀 수동 생성 방식으로 변경 - 자동 생성 로직 완전 제거
    // 🚀 동적 페르소나 우선 사용, 없으면 API 데이터 사용
    const personas = dynamicPersonas.length > 0 ? dynamicPersonas : apiPersonas;
    const { data: favoriteIds = [] } = useFavorites(currentUserId || '');
    // 임시 하드코딩 사용자 프로필 (추후 API 구현)
    const tempUserProfile = {
        user_gender: 'male',
        partner_gender: 'female',
        experience: 'beginner',
        interests: ['영화', '음악']
    };
    // const isLoadingProfile = false;
    // 즐겨찾기 페르소나 필터링
    const favoritePersonas = useMemo(() => {
        return personas.filter(p => favoriteIds.includes(p.id));
    }, [personas]);
    // 이성 페르소나만 필터링
    const filteredPersonas = useMemo(() => {
        const oppositeGender = tempUserProfile.partner_gender || (tempUserProfile.user_gender === 'male' ? 'female' : 'male');
        return personas.filter(p => p.gender === oppositeGender);
    }, [personas]);
    // 검색 필터링
    const searchedPersonas = useMemo(() => {
        if (!searchQuery)
            return filteredPersonas;
        const query = searchQuery.toLowerCase();
        return filteredPersonas.filter(p => p.name.toLowerCase().includes(query) ||
            p.job?.toLowerCase().includes(query) ||
            p.tags.some((tag) => tag.toLowerCase().includes(query)));
    }, [filteredPersonas, searchQuery]);
    const onSelectPersona = (persona) => {
        if (onSelectPersonaProp) {
            onSelectPersonaProp(persona);
        }
        else {
            onNavigate(Screen.ConversationPrep);
        }
    };
    const getConsiderations = () => {
        if (!tempUserProfile)
            return [];
        const considerations = [];
        if (tempUserProfile.experience === '없음' || tempUserProfile.experience === '1-2회') {
            considerations.push('연애 초보자를 위한 친근한 성격');
        }
        if (tempUserProfile.interests && tempUserProfile.interests.length > 0) {
            considerations.push(`${tempUserProfile.interests[0].replace(/🎮|🎬|💪|✈️|🍕|📚|🎵|🎨|📱|🐕|☕|📷|🏖️|🎪|💼\s/g, '')} 등 공통 관심사 보유`);
        }
        return considerations;
    };
    const considerations = getConsiderations();
    return (_jsxs("div", { className: "flex flex-col h-full w-full bg-[#F9FAFB]", children: [_jsx("header", { className: "flex-shrink-0 p-4 pt-5 bg-white border-b border-[#F2F4F6]", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-bold text-[#191F28]", children: "AI \uCE5C\uAD6C\uB4E4" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { className: "p-2 rounded-full hover:bg-gray-100 transition-colors", children: _jsx(SearchIcon, { className: "w-6 h-6 text-[#191F28]" }) }), _jsx("button", { className: "p-2 rounded-full hover:bg-gray-100 transition-colors", children: _jsx(SettingsIcon, { className: "w-6 h-6 text-[#191F28]" }) })] })] }) }), _jsxs("main", { className: "flex-1 overflow-y-auto p-4 space-y-6 pb-24", children: [favoritePersonas.length > 0 && (_jsxs("section", { children: [_jsx("h2", { className: "text-lg font-bold text-[#191F28] mb-3 px-1", children: "\u2B50 \uC990\uACA8\uCC3E\uB294 AI" }), _jsx("div", { className: "flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4", children: favoritePersonas.map((p, index) => (_jsxs("div", { onClick: () => onSelectPersona(p), className: "flex-shrink-0 w-20 text-center cursor-pointer transition-transform hover:-translate-y-1", style: { animationDelay: `${index * 80}ms` }, children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: p.avatar, alt: p.name, className: "w-20 h-20 rounded-full object-cover" }), _jsx("div", { className: "absolute bottom-0 right-0 w-4 h-4 bg-[#0AC5A8] rounded-full border-2 border-white" })] }), _jsx("p", { className: "mt-1.5 text-sm font-semibold truncate", children: p.name })] }, p.id))) })] })), _jsxs("section", { className: "space-y-3", children: [_jsxs("div", { className: "p-4 bg-gradient-to-r from-[#FDF2F8] to-[#EBF2FF] rounded-xl", children: [_jsx("h2", { className: "text-lg font-bold text-[#191F28]", children: "\uD83D\uDCAC \uB2F9\uC2E0\uC744 \uC704\uD55C \uCD94\uCC9C" }), _jsx("p", { className: "text-sm text-[#4F7ABA] mt-1", children: isGeneratingPersonas
                                            ? 'AI가 당신에게 맞는 친구들을 생성하고 있어요...'
                                            : '설문 결과를 바탕으로, 아래 친구들을 추천해드려요!' }), considerations.length > 0 && !isGeneratingPersonas && (_jsx("ul", { className: "mt-2 space-y-1 text-xs list-disc list-inside text-[#DB7093] font-medium", children: considerations.map(c => _jsx("li", { children: c }, c)) }))] }), isLoadingPersonas || isGeneratingPersonas ? (_jsxs("div", { className: "flex flex-col justify-center items-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-[#0AC5A8] mb-4" }), _jsx("p", { className: "text-sm text-gray-500", children: isGeneratingPersonas ? 'AI가 맞춤 친구들을 만들고 있어요...' : '페르소나를 불러오는 중...' })] })) : searchedPersonas.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83E\uDD16\u2728" }), _jsx("h3", { className: "font-bold text-lg mb-2", children: "\uC0C8\uB85C\uC6B4 AI \uCE5C\uAD6C\uB97C \uB9CC\uB098\uBCF4\uC138\uC694!" }), _jsxs("p", { className: "text-sm text-gray-500 text-center mb-6", children: ["\uB2F9\uC2E0\uC758 \uC131\uACA9\uACFC \uAD00\uC2EC\uC0AC\uC5D0 \uB9DE\uB294", _jsx("br", {}), "\uD2B9\uBCC4\uD55C AI \uCE5C\uAD6C\uB4E4\uC744 \uC0DD\uC131\uD574\uB4DC\uB824\uC694"] }), _jsx("button", { onClick: generateNewPersonas, disabled: isGeneratingPersonas, className: "px-8 py-4 text-lg font-bold text-white rounded-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg", style: { backgroundColor: '#0AC5A8' }, children: isGeneratingPersonas ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2" }), "AI \uCE5C\uAD6C \uC0DD\uC131 \uC911..."] })) : ('💕 AI 친구 만나보기') })] })) : (searchedPersonas.map((persona, i) => (_jsx("div", { className: "animate-fade-in-up", style: { animationDelay: `${i * 80}ms` }, children: _jsx(PersonaCard, { persona: persona, onSelect: () => onSelectPersona(persona) }) }, persona.id))))] }), _jsx("section", { children: _jsxs("button", { onClick: () => onNavigate(Screen.CustomPersona), className: "w-full p-4 bg-white rounded-2xl border border-dashed border-[#B794F6] flex items-center justify-center text-[#B794F6] font-bold hover:bg-[#F7F4FF] transition-all hover:shadow-md hover:border-[#9B7FE5]", children: [_jsx(PlusCircleIcon, { className: "w-6 h-6 mr-2" }), "\uB098\uB9CC\uC758 AI \uB9CC\uB4E4\uAE30"] }) })] })] }));
};
export { ChatTabScreen };
export default ChatTabScreen;
