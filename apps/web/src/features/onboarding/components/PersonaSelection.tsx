
import React, { useState } from 'react';
import { Persona, UserProfile } from '@qupid/core';
import { SearchIcon, SettingsIcon, ArrowLeftIcon } from '@qupid/ui';

interface PersonaSelectionProps {
  personas: Persona[];
  userProfile: UserProfile | null;
  onSelect: (persona: Persona) => void;
  onBack: () => void;
}

const PersonaCard: React.FC<{ persona: Persona; onSelect: () => void; }> = ({ persona, onSelect }) => {
  return (
    <div 
        className="w-full p-5 flex flex-col bg-white rounded-2xl border border-[#F2F4F6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-lg hover:border-[#F093B0] cursor-pointer"
        onClick={onSelect}
    >
      <div className="flex items-start flex-grow">
          <img src={persona.avatar} alt={persona.name} className="w-20 h-20 rounded-xl object-cover" />
          <div className="ml-4 flex-1">
              <div className="flex justify-between items-center">
                  <p className="font-bold text-lg text-[#191F28]">{persona.name}, {persona.age}</p>
                  <div className="flex items-center space-x-2">
                      <p className="font-bold text-sm text-[#0AC5A8]">{persona.match_rate}% 맞음</p>
                  </div>
              </div>
              <p className="text-sm text-[#8B95A1] mt-0.5">{persona.job} · {persona.mbti}</p>
              <p className="text-base text-[#191F28] mt-2 font-medium">"{persona.intro}"</p>
          </div>
      </div>
      <button className="w-full h-10 bg-[#FDF2F8] text-[#F093B0] font-bold rounded-lg transition-colors hover:bg-opacity-80 mt-4">
          대화하기
      </button>
    </div>
  );
};

const PersonaSelection: React.FC<PersonaSelectionProps> = ({ personas, userProfile, onSelect, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const partnerGender = userProfile?.user_gender === 'female' ? 'male' : 'female';
  const filteredPersonas = personas
    .filter(p => p.gender === partnerGender)
    .filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
      <header className="flex-shrink-0 p-3 pt-4 bg-white border-b border-[#F2F4F6]">
        <div className="flex justify-between items-center px-2">
           <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
             <ArrowLeftIcon className="w-6 h-6 text-[#191F28]" />
           </button>
          <h1 className="text-xl font-bold text-[#191F28]">추천 AI 친구들</h1>
          <button className="flex items-center space-x-1 text-[#4F7ABA] font-medium p-2">
            <SettingsIcon className="w-5 h-5" />
            <span className="hidden sm:inline">필터</span>
          </button>
        </div>
        <div className="mt-3 relative px-2">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B95A1]" />
          <input
            type="text"
            placeholder="이름이나 특성으로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-[#F2F4F6] rounded-full focus:outline-none focus:ring-2 focus:ring-[#F093B0]"
          />
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-5">
        <div className="space-y-4">
          {filteredPersonas.map((persona, i) => (
            <div key={persona.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <PersonaCard persona={persona} onSelect={() => onSelect(persona)} />
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-5 bg-[#F7F4FF] rounded-xl text-center">
            <p className="font-bold text-base text-[#191F28]">💡 더 많은 AI 친구들</p>
            <p className="text-sm text-[#6C7680] mt-1">매일 새로운 페르소나가 추가돼요. 내일 또 다른 친구를 만나보세요!</p>
        </div>
      </main>
    </div>
  );
};

export { PersonaSelection };
export default PersonaSelection;
