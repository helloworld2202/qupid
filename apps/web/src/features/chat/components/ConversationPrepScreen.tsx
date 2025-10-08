
import React from 'react';
import { Persona } from '@qupid/core';
import { ArrowLeftIcon } from '@qupid/ui';

interface ConversationPrepScreenProps {
  partner?: Persona;
  onStart: () => void;
  onBack: () => void;
}

const ConversationPrepScreen: React.FC<ConversationPrepScreenProps> = ({ partner, onStart, onBack }) => {
  // partner가 없으면 기본 persona 사용
  if (!partner) {
    return (
      <div className="flex flex-col h-full w-full bg-white items-center justify-center">
        <p className="text-[#8B95A1]">파트너를 선택해주세요.</p>
        <button onClick={onBack} className="mt-4 px-6 py-3 bg-[#0AC5A8] text-white rounded-full">
          돌아가기
        </button>
      </div>
    );
  }

  const persona = partner;
  const checklist = [
    "편안한 마음가짐 준비",
    "15-20분 정도 시간 확보",
    "방해받지 않는 환경",
    "솔직하고 자연스럽게 대화"
  ];

  const tips = [
      "자기소개로 시작해보세요",
      `공통 관심사(${persona.tags?.join(', ') || '영화, 음악'})를 물어보세요`,
      "상대방 이야기에 관심을 보여주세요",
      "긴장하지 마세요, 연습이니까요!",
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white animate-fade-in">
      <header className="flex-shrink-0 flex items-center p-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeftIcon className="w-6 h-6 text-[#8B95A1]" />
        </button>
      </header>

      <main className="flex-1 px-6">
        <h1 className="text-[32px] font-bold text-[#191F28]">대화 준비 완료!</h1>
        <p className="text-base text-[#8B95A1] mt-2">{persona.name}님과의 첫 만남이에요</p>
        
        <div className="mt-8 p-6 bg-white border border-[#E5E8EB] rounded-2xl">
            <h2 className="text-lg font-bold text-[#191F28]">대화 전 확인해주세요</h2>
            <ul className="mt-4 space-y-3">
                {checklist.map((item, i) => (
                    <li key={i} className="flex items-center">
                        <span className="text-lg mr-3 text-[#0AC5A8]">✓</span>
                        <p className="text-base text-[#191F28] font-medium">{item}</p>
                    </li>
                ))}
            </ul>
        </div>

        <div className="mt-4 p-5 bg-[#FDF2F8] rounded-2xl">
            <h2 className="text-lg font-bold text-[#191F28]">💡 첫 대화 팁</h2>
             <ul className="mt-3 list-disc list-inside space-y-1.5">
                {tips.map((tip, i) => (
                    <li key={i} className="text-sm text-[#DB7093] font-medium">{tip}</li>
                ))}
            </ul>
        </div>
        
        <div className="mt-4 p-5 bg-[#EBF2FF] rounded-2xl">
            <h2 className="text-lg font-bold text-[#191F28]">📊 실시간 분석 기능</h2>
             <p className="mt-2 text-sm text-[#4F7ABA] leading-relaxed font-medium">
                대화 중에 AI가 실시간으로 분석해서 좋은 대화일 때 격려해드려요. 개선점이 있으면 힌트를 주고, 대화 후 상세한 피드백을 제공해요.
             </p>
        </div>

      </main>

      <footer className="flex-shrink-0 p-4">
        <button
          onClick={onStart}
          className="w-full h-14 bg-[#F093B0] text-white text-lg font-bold rounded-xl"
        >
          지금 대화 시작하기
        </button>
      </footer>
    </div>
  );
};

export { ConversationPrepScreen };
export default ConversationPrepScreen;
