
import React, { useEffect, useRef } from 'react';
import { PerformanceData } from '@qupid/core';
import { ArrowLeftIcon } from '@qupid/ui';
import { Chart, registerables } from 'chart.js/auto';
import { usePerformance } from '../../../shared/hooks/usePerformance';
import { useAppStore } from '../../../shared/stores/useAppStore';

Chart.register(...registerables);

interface PerformanceDetailScreenProps {
  onBack: () => void;
}

const PerformanceDetailScreen: React.FC<PerformanceDetailScreenProps> = ({ onBack }) => {
  const { currentUserId } = useAppStore();
  const { data: performanceData, isLoading, error } = usePerformance(currentUserId || '');
  
  // 🚀 프로덕션용 로그 정리 - 개발 환경에서만 로그 출력
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 PerformanceDetailScreen - currentUserId:', currentUserId);
    console.log('📊 PerformanceDetailScreen - performanceData:', performanceData);
    console.log('📊 PerformanceDetailScreen - isLoading:', isLoading);
    console.log('📊 PerformanceDetailScreen - error:', error);
  }
  
  // 🚀 API 데이터를 우선 사용하고, 없을 때만 기본값 사용
  const data = performanceData || {
    weeklyScore: 0,
    scoreChange: 0,
    scoreChangePercentage: 0,
    dailyScores: [0, 0, 0, 0, 0, 0, 0],
    radarData: {
      labels: ['친근함', '호기심', '공감력', '유머', '배려', '적극성'],
      datasets: [{
        label: '이번 주',
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(240, 147, 176, 0.2)',
        borderColor: 'rgba(240, 147, 176, 1)',
        borderWidth: 2,
      }]
    },
    stats: {
      totalTime: '0분',
      sessionCount: 0,
      avgTime: '0분',
      longestSession: { time: '0분', persona: '' },
      preferredType: '아직 대화 기록이 없습니다'
    },
    categoryScores: [
      { title: '친근함', emoji: '😊', score: 0, change: 0, goal: 90 },
      { title: '호기심', emoji: '🤔', score: 0, change: 0, goal: 90 },
      { title: '공감력', emoji: '💬', score: 0, change: 0, goal: 70 },
    ]
  };
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const radarChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let lineChart: Chart | null = null;
    let radarChart: Chart | null = null;

    if (lineChartRef.current) {
        const lineCtx = lineChartRef.current.getContext('2d');
        if (lineCtx) {
            lineChart = new Chart(lineCtx, {
                type: 'line',
                data: {
                    labels: ['월', '화', '수', '목', '금', '토', '일'],
                    datasets: [{
                        label: '일일 점수',
                        data: data.dailyScores,
                        borderColor: '#F093B0',
                        backgroundColor: 'rgba(240, 147, 176, 0.1)',
                        fill: true,
                        tension: 0.4,
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }
    }

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
                        angleLines: { display: false },
                        suggestedMin: 0,
                        suggestedMax: 100,
                        ticks: { display: false },
                        grid: { circular: true }
                    }
                }
            }
        });
      }
    }
    
    return () => {
        lineChart?.destroy();
        radarChart?.destroy();
    };
  }, [data]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
        <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-[#F2F4F6] bg-white">
          <div className="w-10">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
              <ArrowLeftIcon className="w-6 h-6 text-[#8B95A1]" />
            </button>
          </div>
          <h2 className="text-center text-lg font-bold text-[#191F28]">내 대화 실력 분석</h2>
          <div className="w-10"></div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F093B0]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
      <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-[#F2F4F6] bg-white">
        <div className="w-10">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
              <ArrowLeftIcon className="w-6 h-6 text-[#8B95A1]" />
            </button>
        </div>
        <h2 className="text-center text-lg font-bold text-[#191F28]">내 대화 실력 분석</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* 이번 주 성과 요약 */}
        <section className="p-5 bg-white rounded-2xl border border-[#F2F4F6] transition-all hover:shadow-md">
            <h2 className="font-bold text-lg">이번 주 성과 요약</h2>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="transition-transform hover:scale-110">
                    <p className="text-3xl font-black text-[#F093B0]">{data.weeklyScore || 0}</p>
                    <p className="text-sm font-medium text-gray-500">총점</p>
                </div>
                <div className="transition-transform hover:scale-110">
                    <p className="text-3xl font-black text-[#0AC5A8]">
                      {data.scoreChangePercentage > 0 ? '+' : ''}{data.scoreChangePercentage || 0}%{data.scoreChangePercentage > 0 ? '↗' : ''}
                    </p>
                    <p className="text-sm font-medium text-gray-500">성장률</p>
                </div>
                 <div className="transition-transform hover:scale-110">
                    <p className="text-3xl font-black text-[#4F7ABA]">{Math.round((data.weeklyScore || 0) * 0.85)}%</p>
                    <p className="text-sm font-medium text-gray-500">목표달성</p>
                </div>
            </div>
        </section>

        {/* 영역별 분석 */}
        <section className="p-5 bg-white rounded-2xl border border-[#F2F4F6]">
            <h3 className="font-bold text-lg">영역별 분석</h3>
            <div className="h-64 mt-2"><canvas ref={radarChartRef}></canvas></div>
        </section>

        <section className="p-6 flex flex-col items-center bg-white rounded-2xl border border-[#F2F4F6]">
            <p className="text-lg font-semibold text-[#8B95A1]">이번 주 평균</p>
            <p className="text-6xl font-black text-[#F093B0] my-1">{data.weeklyScore}점</p>
            <p className="text-lg font-bold text-[#0AC5A8]">+{data.scoreChange}점 ({data.scoreChangePercentage}%↗)</p>
        </section>

        <section className="p-5 bg-white rounded-2xl border border-[#F2F4F6]">
            <h3 className="font-bold text-lg">주간 점수 변화</h3>
            <div className="h-48 mt-2"><canvas ref={lineChartRef}></canvas></div>
        </section>
        
        <section className="p-5 bg-white rounded-2xl border border-[#F2F4F6]">
            <h3 className="font-bold text-lg">영역별 능력치</h3>
            <div className="h-64 mt-2"><canvas ref={radarChartRef}></canvas></div>
        </section>

        <section className="space-y-3">
             {data.categoryScores && data.categoryScores.length > 0 && data.categoryScores.map(cat => (
                <div key={cat.title} className="p-4 bg-white rounded-xl border border-[#F2F4F6]">
                    <div className="flex items-center">
                        <p className="text-2xl mr-3">{cat.emoji}</p>
                        <div className="flex-1">
                            <p className="font-bold">{cat.title}</p>
                            <p className="text-sm text-[#8B95A1]">목표: {cat.goal}점</p>
                        </div>
                        <p className="text-2xl font-bold text-[#191F28]">{cat.score}점</p>
                        <p className={`ml-2 text-sm font-semibold ${cat.change >= 0 ? 'text-[#0AC5A8]' : 'text-red-500'}`}>
                            ({cat.change >= 0 ? '+' : ''}{cat.change})
                        </p>
                    </div>
                </div>
            ))}
        </section>

        <section className="p-5 bg-white rounded-2xl border border-[#F2F4F6]">
            <h3 className="font-bold text-lg">대화 기록 요약</h3>
            <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                <div>
                    <p className="text-xl font-bold">{data.stats.totalTime}</p>
                    <p className="text-sm text-[#8B95A1]">총 대화 시간</p>
                </div>
                 <div>
                    <p className="text-xl font-bold">{data.stats.sessionCount}회</p>
                    <p className="text-sm text-[#8B95A1]">대화 횟수</p>
                </div>
                 <div>
                    <p className="text-xl font-bold">{data.stats.avgTime}</p>
                    <p className="text-sm text-[#8B95A1]">평균 대화 시간</p>
                </div>
                 <div>
                    <p className="text-xl font-bold">{data.stats.longestSession.time}</p>
                    <p className="text-sm text-[#8B95A1]">{data.stats.longestSession.persona}</p>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
};

export { PerformanceDetailScreen };
export default PerformanceDetailScreen;
