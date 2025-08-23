
import React from 'react';
import { Persona } from '@qupid/core';
import { ArrowLeftIcon } from '@qupid/ui';

interface FavoritesScreenProps {
  personas: Persona[];
  onSelectPersona: (persona: Persona) => void;
  onBack: () => void;
}

const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ personas, onSelectPersona, onBack }) => {
  return (
    <div className="flex flex-col h-full w-full bg-white">
      <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-[#F2F4F6]">
        <div className="w-14">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeftIcon className="w-6 h-6 text-[#8B95A1]" />
          </button>
        </div>
        <div className="text-center">
            <h2 className="text-lg font-bold text-[#191F28]">즐겨찾는 AI 친구들</h2>
            <p className="text-sm text-[#8B95A1]">자주 대화하는 AI들이에요</p>
        </div>
        <button className="p-2 w-14 rounded-full text-[#4F7ABA] font-semibold text-base">편집</button>
      </header>

      <main className="flex-1 overflow-y-auto">
        {personas.length > 0 ? (
          <ul className="divide-y divide-[#F2F4F6]">
            {personas.map(persona => (
              <li key={persona.id} onClick={() => onSelectPersona(persona)} className="p-4 flex items-center cursor-pointer hover:bg-gray-50">
                <img src={persona.avatar} alt={persona.name} className="w-14 h-14 rounded-full object-cover" />
                <div className="flex-1 ml-4">
                  <p className="font-bold text-base text-[#191F28]">{persona.name}</p>
                  <p className="text-sm text-[#0AC5A8] font-semibold">🟢 온라인</p>
                  <p className="text-xs text-[#8B95A1]">어제 25분 대화</p>
                </div>
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        onSelectPersona(persona);
                    }}
                    className="px-4 py-2 bg-[#F093B0] text-white text-sm font-bold rounded-full"
                >
                    대화하기
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <p className="text-5xl mb-4">💔</p>
            <p className="text-xl font-bold text-[#191F28]">즐겨찾는 친구가 없어요</p>
            <p className="text-base text-[#8B95A1] mt-2">마음에 드는 AI의 프로필에서<br/>하트 버튼을 눌러 추가해보세요!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export { FavoritesScreen };
export default FavoritesScreen;
