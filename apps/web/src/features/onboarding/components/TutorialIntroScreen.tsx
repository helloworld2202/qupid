
import React from 'react';
import { Persona } from '@qupid/core';
import { ArrowLeftIcon, CoachKeyIcon } from '@qupid/ui';
import { TUTORIAL_STEPS } from '@qupid/core';

interface TutorialIntroScreenProps {
  persona: Persona;
  onStart: () => void;
  onBack: () => void;
}

const TutorialIntroScreen: React.FC<TutorialIntroScreenProps> = ({ persona, onStart, onBack }) => {
  const tutorialGoals = TUTORIAL_STEPS.slice(0, 4).map(step => step.title.split(': ')[1]);

  return (
    <div className="flex flex-col h-full w-full bg-white animate-fade-in">
      <header className="flex-shrink-0 flex items-center p-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeftIcon className="w-6 h-6 text-[#8B95A1]" />
        </button>
      </header>

      <main className="flex-1 px-6 text-center">
        <img src={persona.avatar} alt={persona.name} className="w-24 h-24 rounded-full mx-auto shadow-lg" />
        <h1 className="mt-4 text-2xl font-bold text-[#191F28]">첫 대화 튜토리얼</h1>
        <p className="text-base text-[#8B95A1] mt-2">첫 대화는 AI 친구 <span className="font-bold text-[#F093B0]">{persona.name}</span>님과 함께해요.</p>
        
        <div className="mt-8 p-6 bg-[#F9FAFB] border border-[#E5E8EB] rounded-2xl text-left">
            <h2 className="text-lg font-bold text-[#191F28]">튜토리얼 목표 🎯</h2>
            <p className="mt-1 text-sm text-gray-600">이 튜토리얼을 통해 대화의 기본기를 다져봐요.</p>
            <ul className="mt-4 space-y-3">
                {tutorialGoals.map((goal, i) => (
                    <li key={i} className="flex items-center">
                        <span className="text-lg mr-3 text-[#0AC5A8]">✓</span>
                        <p className="text-base text-[#191F28] font-medium">{goal}</p>
                    </li>
                ))}
            </ul>
        </div>
        
        <div className="mt-4 p-5 bg-[#EBF2FF] rounded-2xl text-left">
            <h2 className="text-lg font-bold text-[#191F28] flex items-center">
                <CoachKeyIcon className="w-5 h-5 mr-2 text-yellow-500" />
                실시간 코칭
            </h2>
             <p className="mt-2 text-sm text-[#4F7ABA] leading-relaxed font-medium">
                대화 중에 AI 코치가 실시간으로 팁을 드릴 거예요. 막히는 부분이 있어도 걱정하지 마세요!
             </p>
        </div>

      </main>

      <footer className="flex-shrink-0 p-4">
        <button
          onClick={onStart}
          className="w-full h-14 bg-[#F093B0] text-white text-lg font-bold rounded-xl"
        >
          튜토리얼 시작하기
        </button>
      </footer>
    </div>
  );
};

export { TutorialIntroScreen };
export default TutorialIntroScreen;
