
import React, { useState, useMemo } from 'react';
import { Persona, Screen } from '@qupid/core';
import { SearchIcon, SettingsIcon, PlusCircleIcon } from '@qupid/ui';
import { usePersonas } from '../../../shared/hooks/usePersonas';
import { useFavorites } from '../../../shared/hooks/useUser';
import { useAppStore } from '../../../shared/stores/useAppStore';
// 🚀 하드코딩된 페르소나 제거 - 동적 생성 시스템 사용

interface ChatTabScreenProps {
  onNavigate: (screen: Screen) => void;
  onSelectPersona?: (persona: Persona) => void;
}

const PersonaCard: React.FC<{ persona: Persona; onSelect: () => void; }> = ({ persona, onSelect }) => {
  return (
    <div 
        className="w-full p-4 flex bg-white rounded-2xl border border-[#F2F4F6] transition-all hover:shadow-lg hover:border-[#F093B0] hover:-translate-y-0.5 cursor-pointer"
        onClick={onSelect}
    >
      <img src={persona.avatar} alt={persona.name} className="w-20 h-20 rounded-xl object-cover" />
      <div className="ml-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg text-[#191F28]">{persona.name}, {persona.age}</p>
                <p className="text-sm text-[#8B95A1] mt-0.5">{persona.job} · {persona.mbti}</p>
              </div>
              <p className="font-bold text-sm text-[#0AC5A8]">{persona.match_rate}% 맞음</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {persona.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-[#EBF2FF] text-[#4F7ABA] text-xs font-medium rounded-md">
                    #{tag}
                </span>
            ))}
          </div>
      </div>
    </div>
  );
};


const ChatTabScreen: React.FC<ChatTabScreenProps> = ({ onNavigate, onSelectPersona: onSelectPersonaProp }) => {
  const [searchQuery] = useState('');
  const { currentUserId } = useAppStore();
  
  // API 호출
  const { data: apiPersonas = [], isLoading: isLoadingPersonas } = usePersonas();
  // 🚀 하드코딩 제거 - API 데이터만 사용
  const personas = apiPersonas;
  const { data: favoriteIds = [] } = useFavorites(currentUserId || '');
  
  // 임시 하드코딩 사용자 프로필 (추후 API 구현)
  const userProfile = {
    user_gender: 'male' as const,
    partner_gender: 'female' as const,
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
    const oppositeGender = userProfile.partner_gender || (userProfile.user_gender === 'male' ? 'female' : 'male');
    return personas.filter(p => p.gender === oppositeGender);
  }, [personas]);
  
  // 검색 필터링
  const searchedPersonas = useMemo(() => {
    if (!searchQuery) return filteredPersonas;
    const query = searchQuery.toLowerCase();
    return filteredPersonas.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.job?.toLowerCase().includes(query) ||
      p.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [filteredPersonas, searchQuery]);
  const onSelectPersona = (persona: Persona) => {
    if (onSelectPersonaProp) {
      onSelectPersonaProp(persona);
    } else {
      onNavigate(Screen.ConversationPrep);
    }
  };

  const getConsiderations = () => {
    if (!userProfile) return [];
    const considerations = [];
    if (userProfile.experience === '없음' || userProfile.experience === '1-2회') {
      considerations.push('연애 초보자를 위한 친근한 성격');
    }
    if (userProfile.interests && userProfile.interests.length > 0) {
      considerations.push(`${userProfile.interests[0].replace(/🎮|🎬|💪|✈️|🍕|📚|🎵|🎨|📱|🐕|☕|📷|🏖️|🎪|💼\s/g, '')} 등 공통 관심사 보유`);
    }
    return considerations;
  }
  const considerations = getConsiderations();


  return (
    <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
      <header className="flex-shrink-0 p-4 pt-5 bg-white border-b border-[#F2F4F6]">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#191F28]">AI 친구들</h1>
            <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors"><SearchIcon className="w-6 h-6 text-[#191F28]" /></button>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors"><SettingsIcon className="w-6 h-6 text-[#191F28]" /></button>
            </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {/* Favorites Section */}
        {favoritePersonas.length > 0 && (
          <section>
              <h2 className="text-lg font-bold text-[#191F28] mb-3 px-1">⭐ 즐겨찾는 AI</h2>
              <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4">
                  {favoritePersonas.map((p, index) => (
                      <div 
                        key={p.id} 
                        onClick={() => onSelectPersona(p)} 
                        className="flex-shrink-0 w-20 text-center cursor-pointer transition-transform hover:-translate-y-1"
                        style={{ animationDelay: `${index * 80}ms` }}
                      >
                          <div className="relative">
                              <img src={p.avatar} alt={p.name} className="w-20 h-20 rounded-full object-cover"/>
                              <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#0AC5A8] rounded-full border-2 border-white"></div>
                          </div>
                          <p className="mt-1.5 text-sm font-semibold truncate">{p.name}</p>
                      </div>
                  ))}
              </div>
          </section>
        )}
        
        {/* Persona List */}
        <section className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-[#FDF2F8] to-[#EBF2FF] rounded-xl">
                 <h2 className="text-lg font-bold text-[#191F28]">💬 당신을 위한 추천</h2>
                 <p className="text-sm text-[#4F7ABA] mt-1">설문 결과를 바탕으로, 아래 친구들을 추천해드려요!</p>
                 <ul className="mt-2 space-y-1 text-xs list-disc list-inside text-[#DB7093] font-medium">
                    {considerations.map(c => <li key={c}>{c}</li>)}
                 </ul>
            </div>
          {isLoadingPersonas ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0AC5A8]"></div>
            </div>
          ) : (
            searchedPersonas.map((persona, i) => (
              <div key={persona.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <PersonaCard persona={persona} onSelect={() => onSelectPersona(persona)} />
              </div>
            ))
          )}
        </section>

        <section>
          <button onClick={() => onNavigate(Screen.CustomPersona)} className="w-full p-4 bg-white rounded-2xl border border-dashed border-[#B794F6] flex items-center justify-center text-[#B794F6] font-bold hover:bg-[#F7F4FF] transition-all hover:shadow-md hover:border-[#9B7FE5]">
            <PlusCircleIcon className="w-6 h-6 mr-2" />
            나만의 AI 만들기
          </button>
        </section>
      </main>
    </div>
  );
};

export { ChatTabScreen };
export default ChatTabScreen;
