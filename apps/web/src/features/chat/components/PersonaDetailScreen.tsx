
import React from 'react';
import { Persona } from '@qupid/core';
import { ArrowLeftIcon, HeartIcon } from '@qupid/ui';

interface PersonaDetailScreenProps {
  persona: Persona;
  isFavorite: boolean;
  onStartChat: (persona: Persona) => void;
  onToggleFavorite: (personaId: string) => void;
  onBack: () => void;
}

const InfoCard: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
    <div className="mt-6">
        <h3 className="text-lg font-bold text-[#191F28]">{title}</h3>
        <div className="mt-3 p-5 bg-[#F9FAFB] rounded-xl">
            {children}
        </div>
    </div>
);

const PersonaDetailScreen: React.FC<PersonaDetailScreenProps> = ({ persona, isFavorite, onStartChat, onToggleFavorite, onBack }) => {
  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-[#F2F4F6] sticky top-0 bg-white z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeftIcon className="w-6 h-6 text-[#8B95A1]" />
        </button>
        <h2 className="text-lg font-bold text-[#191F28]">{persona.name}</h2>
        <button onClick={() => onToggleFavorite(persona.id)} className="p-2 rounded-full hover:bg-red-50">
          <HeartIcon 
            className={`w-6 h-6 transition-colors ${isFavorite ? 'text-[#F093B0] fill-[#F093B0]' : 'text-[#8B95A1]'}`} 
          />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Profile Section */}
        <section className="pt-8 pb-6 flex flex-col items-center justify-center bg-gradient-to-b from-[#FDF2F8] to-white">
          <div className="relative">
            <img src={persona.avatar} alt={persona.name} className="w-32 h-32 rounded-full object-cover shadow-lg" />
            <div className="absolute -bottom-2 -right-2 bg-[#0AC5A8] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {persona.match_rate}% 맞음
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[#191F28]">{persona.name}, {persona.age}</h1>
          <p className="mt-1 text-base text-[#8B95A1]">{persona.job} · {persona.mbti}</p>
          <p className="mt-2 text-sm font-semibold text-[#0AC5A8]">🟢 온라인</p>
        </section>
        
        <section className="px-5 pb-28">
            <InfoCard title="자기소개">
                <p className="text-base text-[#191F28] leading-relaxed">{persona.intro}</p>
            </InfoCard>

            <InfoCard title="성격 특성">
                <div className="flex flex-wrap gap-2">
                    {persona.personality_traits.map(trait => (
                        <span key={trait} className="px-3 py-1.5 bg-[#EBF2FF] text-[#4F7ABA] text-sm font-medium rounded-full">
                            #{trait}
                        </span>
                    ))}
                </div>
            </InfoCard>
            
            <InfoCard title="관심 있는 것들">
                <ul className="space-y-4">
                    {persona.interests.map(interest => (
                        <li key={interest.topic} className="flex items-center">
                            <span className="text-2xl mr-3">{interest.emoji}</span>
                            <div>
                                <p className="font-bold text-base text-[#191F28]">{interest.topic}</p>
                                <p className="text-sm text-[#8B95A1]">{interest.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </InfoCard>

            <InfoCard title="대화 미리보기">
                <div className="space-y-2">
                    {persona.conversation_preview.map((msg, index) => (
                        <div key={index} className="flex">
                             <div className="px-4 py-2 bg-white rounded-t-lg rounded-r-lg text-[#191F28] border border-[#E5E8EB]">
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </InfoCard>
        </section>
      </main>

      {/* Footer CTA */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-[#F2F4F6]">
        <button
          onClick={() => onStartChat(persona)}
          className="w-full h-14 bg-[#F093B0] text-white text-lg font-bold rounded-xl transition-colors hover:bg-opacity-90"
        >
          {persona.name}님과 대화 시작하기
        </button>
      </footer>
    </div>
  );
};

export { PersonaDetailScreen };
export default PersonaDetailScreen;
