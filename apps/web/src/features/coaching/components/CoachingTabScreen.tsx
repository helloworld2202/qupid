

import React, { useEffect, useRef } from 'react';
import { PerformanceData, AICoach } from '@qupid/core';
import { Chart, registerables } from 'chart.js/auto';
import { AI_COACHES } from '@qupid/core';
import { ChevronRightIcon } from '@qupid/ui';

Chart.register(...registerables);

interface CoachingTabScreenProps {
  data: PerformanceData;
  onStartCoachChat: (coach: AICoach) => void;
}

const CoachCard: React.FC<{ coach: AICoach; onStart: () => void; }> = ({ coach, onStart }) => (
  <div className="p-4 bg-white rounded-xl border border-[#F2F4F6] flex items-center space-x-4">
    <img src={coach.avatar} alt={coach.name} className="w-16 h-16 rounded-full object-cover" />
    <div className="flex-1">
      <p className="font-bold text-base text-[#191F28]">{coach.name} 코치</p>
      <p className="text-sm font-semibold text-[#4F7ABA]">{coach.specialty} 전문</p>
      <p className="text-xs text-[#8B95A1] mt-1 truncate">{coach.tagline}</p>
    </div>
    <button onClick={onStart} className="px-3 py-1.5 bg-[#FDF2F8] text-sm text-[#DB7093] font-bold rounded-full">
      상담 시작
    </button>
  </div>
);

const CoachingTabScreen: React.FC<CoachingTabScreenProps> = ({ data, onStartCoachChat }) => {
  const radarChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let radarChart: Chart | null = null;
    if (radarChartRef.current) {
      const radarCtx = radarChartRef.current.getContext('2d');
      if (radarCtx) {
        radarChart = new Chart(radarCtx, {
            type: 'radar',
            data: data.radarData,
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    r: {
                        angleLines: { color: 'rgba(0,0,0,0.05)' },
                        suggestedMin: 0,
                        suggestedMax: 100,
                        ticks: { display: false },
                        grid: { circular: true, color: 'rgba(0,0,0,0.05)' },
                        pointLabels: { font: { size: 14, weight: 'bold' }, color: '#191F28' }
                    }
                }
            }
        });
      }
    }
    return () => {
        radarChart?.destroy();
    };
  }, [data]);

  return (
    <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
      <header className="flex-shrink-0 p-4 pt-5 bg-white border-b border-[#F2F4F6]">
        <h1 className="text-2xl font-bold text-[#191F28]">코칭</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Performance Summary Card */}
        <section className="p-5 bg-white rounded-2xl border border-[#F2F4F6]">
            <h2 className="font-bold text-lg">이번 주 성과 요약</h2>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                    <p className="text-3xl font-black text-[#F093B0]">{data.weeklyScore}</p>
                    <p className="text-sm font-medium text-gray-500">총점</p>
                </div>
                <div>
                    <p className="text-3xl font-black text-[#0AC5A8]">{data.scoreChangePercentage}%↗</p>
                    <p className="text-sm font-medium text-gray-500">성장률</p>
                </div>
                 <div>
                    <p className="text-3xl font-black text-[#4F7ABA]">85%</p>
                    <p className="text-sm font-medium text-gray-500">목표달성</p>
                </div>
            </div>
        </section>

        {/* Skill Analysis */}
        <section className="p-5 bg-white rounded-2xl border border-[#F2F4F6]">
            <h3 className="font-bold text-lg">영역별 분석</h3>
            <div className="h-64 mt-2"><canvas ref={radarChartRef}></canvas></div>
        </section>

        {/* 1:1 Personalized Coaching */}
        <section>
          <h2 className="text-lg font-bold text-[#191F28] px-1">1:1 맞춤 코칭 🎓</h2>
          <p className="text-sm text-[#8B95A1] px-1 mb-3">부족한 부분을 전문 코치와 함께 집중적으로 연습해보세요.</p>
          <div className="space-y-3">
            {AI_COACHES.map(coach => (
              <CoachCard key={coach.id} coach={coach} onStart={() => onStartCoachChat(coach)} />
            ))}
          </div>
        </section>

        {/* Custom Learning Content */}
        <section>
            <h2 className="font-bold text-lg px-1">맞춤 학습 콘텐츠 💡</h2>
            <div className="mt-2 space-y-3">
                <div className="p-4 bg-white rounded-xl border border-[#F2F4F6]">
                    <p className="font-semibold text-blue-600">추천 강의</p>
                    <p className="font-bold text-base mt-1">공감 능력 향상시키기: 상대의 마음을 얻는 3가지 질문법</p>
                    <p className="text-sm text-gray-500 mt-1">15분 강의 · 75% 수강</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-[#F2F4F6]">
                    <p className="font-semibold text-green-600">실전 팁</p>
                    <p className="font-bold text-base mt-1">어색한 침묵 깨기: 5가지 유용한 대화 주제</p>
                    <p className="text-sm text-gray-500 mt-1">3분 분량</p>
                </div>
            </div>
        </section>

        {/* Goal Management */}
        <section className="p-5 bg-white rounded-2xl border border-[#F2F4F6]">
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg">목표 관리</h2>
                <button className="text-sm font-bold text-[#F093B0]">수정하기</button>
            </div>
            <div className="mt-3">
                <p className="font-semibold">현재 목표: 🔥 집중</p>
                <p className="text-sm text-gray-500">일 3회 대화 (45분) / 새로운 AI와 대화하기</p>
            </div>
             <button className="w-full mt-3 h-10 bg-[#F2F4F6] text-[#191F28] font-bold rounded-lg">새로운 목표 설정하기</button>
        </section>
      </main>
    </div>
  );
};

export { CoachingTabScreen };
export default CoachingTabScreen;