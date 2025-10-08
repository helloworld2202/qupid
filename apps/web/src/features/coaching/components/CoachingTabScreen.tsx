

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
  <div className="p-4 bg-white rounded-xl border border-[#F2F4F6] flex items-center space-x-4 transition-all hover:shadow-lg hover:border-[#DB7093] hover:-translate-y-0.5 cursor-pointer group" onClick={onStart}>
    {/* 🚀 아바타 이미지 개선 */}
    <div className="flex-shrink-0">
      <img 
        src={coach.avatar} 
        alt={coach.name} 
        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-[#DB7093] transition-colors" 
      />
    </div>
    
    {/* 🚀 코치 정보 섹션 개선 */}
    <div className="flex-1 min-w-0">
      <p className="font-bold text-base text-[#191F28] mb-1">{coach.name} 코치</p>
      <p className="text-sm font-semibold text-[#4F7ABA] mb-1">{coach.specialty} 전문</p>
      <p className="text-xs text-[#8B95A1] leading-relaxed">{coach.tagline}</p>
    </div>
    
    {/* 🚀 버튼 개선 - UI 오류 수정 */}
    <div className="flex-shrink-0">
      <button 
        className="px-4 py-2 bg-[#FDF2F8] text-sm text-[#DB7093] font-bold rounded-full transition-all hover:bg-[#DB7093] hover:text-white hover:shadow-md whitespace-nowrap"
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
      >
        상담 시작
      </button>
    </div>
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

      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {/* 🚀 1:1 맞춤 코칭 섹션 개선 */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#191F28] mb-2">1:1 맞춤 코칭 🎓</h2>
            <p className="text-sm text-[#8B95A1] leading-relaxed">부족한 부분을 전문 코치와 함께 집중적으로 연습해보세요.</p>
          </div>
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

        {/* 🚀 맞춤 학습 콘텐츠 섹션 개선 */}
        <section>
            <h2 className="font-bold text-lg px-1 mb-3">맞춤 학습 콘텐츠 💡</h2>
            <div className="space-y-3">
                {/* 추천 강의 카드 */}
                <div className="p-4 bg-white rounded-xl border border-[#F2F4F6] cursor-pointer transition-all hover:shadow-lg hover:border-blue-400 hover:-translate-y-0.5 group">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="font-semibold text-blue-600 text-sm mb-2">추천 강의</p>
                            <p className="font-bold text-base text-[#191F28] leading-tight mb-2">공감 능력 향상시키기: 상대의 마음을 얻는 3가지 질문법</p>
                            <p className="text-sm text-[#8B95A1]">15분 강의 · 75% 수강</p>
                        </div>
                        <div className="ml-3 flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <span className="text-blue-600 text-lg">📚</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* 실전 팁 카드 */}
                <div className="p-4 bg-white rounded-xl border border-[#F2F4F6] cursor-pointer transition-all hover:shadow-lg hover:border-green-400 hover:-translate-y-0.5 group">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="font-semibold text-green-600 text-sm mb-2">실전 팁</p>
                            <p className="font-bold text-base text-[#191F28] leading-tight mb-2">어색한 침묵 깨기: 5가지 유용한 대화 주제</p>
                            <p className="text-sm text-[#8B95A1]">3분 분량</p>
                        </div>
                        <div className="ml-3 flex-shrink-0">
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                <span className="text-green-600 text-lg">💡</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* 목표관리 섹션 제거 - 설정에서 관리하도록 변경 */}
      </main>
    </div>
  );
};

export { CoachingTabScreen };
export default CoachingTabScreen;