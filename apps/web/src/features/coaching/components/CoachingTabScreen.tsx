

import React from 'react';
import { AICoach, Screen } from '@qupid/core';
import { useCoaches } from '../../../shared/hooks/useCoaches';
import { useUserStore } from '../../../shared/stores/userStore';
import { AI_COACHES } from '@qupid/core';
import {} from '@qupid/ui';

interface CoachingTabScreenProps {
  onNavigate: (screen: Screen) => void;
  onStartCoachChat?: (coach: AICoach) => void;
}

const CoachCard: React.FC<{ coach: AICoach; onStart: () => void; }> = ({ coach, onStart }) => (
  <div className="p-4 bg-white rounded-xl border border-[#F2F4F6] flex items-center space-x-4 transition-all hover:shadow-lg hover:border-[#DB7093] hover:-translate-y-0.5 cursor-pointer" onClick={onStart}>
    <img src={coach.avatar} alt={coach.name} className="w-16 h-16 rounded-full object-cover" />
    <div className="flex-1">
      <p className="font-bold text-base text-[#191F28]">{coach.name} 코치</p>
      <p className="text-sm font-semibold text-[#4F7ABA]">{coach.specialty} 전문</p>
      <p className="text-xs text-[#8B95A1] mt-1 truncate">{coach.tagline}</p>
    </div>
    <button className="px-3 py-1.5 bg-[#FDF2F8] text-sm text-[#DB7093] font-bold rounded-full transition-all hover:bg-[#DB7093] hover:text-white">
      상담 시작
    </button>
  </div>
);

const CoachingTabScreen: React.FC<CoachingTabScreenProps> = ({ onNavigate, onStartCoachChat }) => {
  const { data: apiCoaches = [], isLoading } = useCoaches();
  const coaches = apiCoaches.length > 0 ? apiCoaches : AI_COACHES;

  return (
    <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
      <header className="flex-shrink-0 p-4 pt-5 bg-white border-b border-[#F2F4F6]">
        <h1 className="text-2xl font-bold text-[#191F28]">코칭</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* 1:1 Personalized Coaching */}
        <section>
          <h2 className="text-lg font-bold text-[#191F28] px-1">1:1 맞춤 코칭 🎓</h2>
          <p className="text-sm text-[#8B95A1] px-1 mb-3">부족한 부분을 전문 코치와 함께 집중적으로 연습해보세요.</p>
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0AC5A8]"></div>
              </div>
            ) : (
              coaches.map(coach => (
                <CoachCard 
                  key={coach.id} 
                  coach={coach} 
                  onStart={() => {
                    if (onStartCoachChat) {
                      onStartCoachChat(coach);
                    } else {
                      // Fallback to navigate to Chat screen
                      onNavigate(Screen.Chat);
                    }
                  }} 
                />
              ))
            )}
          </div>
        </section>

        {/* Custom Learning Content */}
        <section>
            <h2 className="font-bold text-lg px-1">맞춤 학습 콘텐츠 💡</h2>
            <div className="mt-2 space-y-3">
                <div className="p-4 bg-white rounded-xl border border-[#F2F4F6] cursor-pointer transition-all hover:shadow-lg hover:border-blue-400 hover:-translate-y-0.5">
                    <p className="font-semibold text-blue-600">추천 강의</p>
                    <p className="font-bold text-base mt-1">공감 능력 향상시키기: 상대의 마음을 얻는 3가지 질문법</p>
                    <p className="text-sm text-gray-500 mt-1">15분 강의 · 75% 수강</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-[#F2F4F6] cursor-pointer transition-all hover:shadow-lg hover:border-green-400 hover:-translate-y-0.5">
                    <p className="font-semibold text-green-600">실전 팁</p>
                    <p className="font-bold text-base mt-1">어색한 침묵 깨기: 5가지 유용한 대화 주제</p>
                    <p className="text-sm text-gray-500 mt-1">3분 분량</p>
                </div>
            </div>
        </section>

        {/* Goal Management */}
        <section className="p-5 bg-white rounded-2xl border border-[#F2F4F6] transition-all hover:shadow-md">
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg">목표 관리</h2>
                <button className="text-sm font-bold text-[#F093B0] transition-colors hover:text-[#DB7093]">수정하기</button>
            </div>
            <div className="mt-3">
                <p className="font-semibold">현재 목표: 🔥 집중</p>
                <p className="text-sm text-gray-500">일 3회 대화 (45분) / 새로운 AI와 대화하기</p>
            </div>
             <button className="w-full mt-3 h-10 bg-[#F2F4F6] text-[#191F28] font-bold rounded-lg transition-all hover:bg-[#F093B0] hover:text-white hover:shadow-md">새로운 목표 설정하기</button>
        </section>
      </main>
    </div>
  );
};

export { CoachingTabScreen };
export default CoachingTabScreen;