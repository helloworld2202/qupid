

import React from 'react';
import { UserProfile, Persona, Screen, Tab, Badge, PerformanceData } from '@qupid/core';
import { BellIcon, ChartTrendingUpIcon, ChevronRightIcon, SearchIcon, SettingsIcon, TrophyIcon } from '@qupid/ui';

interface HomeScreenProps {
  userProfile: UserProfile;
  onNavigateToPage: (screen: Screen) => void;
  onSelectPersona: (persona: Persona) => void;
  personas: Persona[];
  badges: Badge[];
  performanceData: PerformanceData;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ userProfile, onNavigateToPage, onSelectPersona, personas, badges, performanceData }) => {
  const recentBadge = badges.find(b => b.featured);
  const partnerGender = userProfile.user_gender === 'female' ? 'male' : 'female';
  const recommendedPersonas = personas.filter(p => p.gender === partnerGender).slice(0, 5);
  
  return (
    <div className="flex flex-col h-full w-full" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className="flex-shrink-0 p-4 pt-5 bg-white border-b" style={{borderColor: '#F2F4F6'}}>
        <div className="flex justify-between items-center">
            <div className="flex items-center">
                <img src="https://em-content.zobj.net/source/apple/391/waving-hand_1f44b.png" alt="profile" className="w-10 h-10 rounded-full" />
                <div className="ml-3">
                    <p className="font-bold text-xl text-[#191F28]">안녕하세요, {userProfile.name}님!</p>
                    <p className="text-sm text-[#8B95A1]">오늘도 대화 실력을 키워볼까요?</p>
                </div>
            </div>
            <div className="flex items-center space-x-1">
                 <button className="p-2 relative">
                    <BellIcon className="w-6 h-6" style={{color: '#191F28'}}/>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                </button>
            </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        
        {/* Today Goal Card */}
        <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg, #FDF2F8, #EBF2FF)' }}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-[#191F28]">📅 오늘의 목표</p>
                    <p className="text-2xl font-bold mt-1" style={{color: '#F093B0'}}>2/3 대화 완료</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium" style={{color: '#4F7ABA'}}>1번 더 대화하면 목표 달성!</p>
                    <button onClick={() => {
                        const firstRecommended = personas.find(p => p.gender === partnerGender);
                        if (firstRecommended) {
                            onSelectPersona(firstRecommended);
                        }
                    }} className="mt-2 h-9 px-4 text-sm font-bold text-white rounded-lg" style={{backgroundColor: '#F093B0'}}>
                        바로 대화하기
                    </button>
                </div>
            </div>
            <div className="w-full bg-white/30 h-1.5 rounded-full mt-3">
                <div className="bg-[#F093B0] h-1.5 rounded-full" style={{width: '66%'}}></div>
            </div>
        </div>

        {/* Performance Card */}
        <div onClick={() => onNavigateToPage(Screen.PerformanceDetail)} className="p-5 bg-white rounded-2xl border cursor-pointer" style={{borderColor: '#F2F4F6'}}>
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg">📊 이번 주 성장</h2>
                <div className="flex items-center text-sm font-medium" style={{color: '#4F7ABA'}}>
                    자세히 보기 <ChevronRightIcon className="w-4 h-4" />
                </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
                <p className="text-3xl font-bold" style={{color: '#0AC5A8'}}>+{performanceData.scoreChange}점 향상</p>
                <p className="text-sm font-medium" style={{color: '#8B95A1'}}>지난주 대비 +{performanceData.scoreChangePercentage}%</p>
            </div>
        </div>

        {/* Recommended AI Card */}
        <div className="p-5 bg-white rounded-2xl border" style={{borderColor: '#F2F4F6'}}>
            <h2 className="font-bold text-lg">💕 오늘의 추천 AI</h2>
            <p className="text-sm text-gray-500 mb-4">지금 대화하기 좋은 친구들이에요</p>
            <div className="flex space-x-3 overflow-x-auto pb-2 -mx-5 px-5">
                {recommendedPersonas.map(p => (
                    <div key={p.id} onClick={() => onSelectPersona(p)} className="flex-shrink-0 w-32 p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E8EB] text-center cursor-pointer">
                        <div className="relative w-16 h-16 mx-auto">
                           <img src={p.avatar} alt={p.name} className="w-full h-full rounded-full object-cover" />
                           <div className="absolute -bottom-0.5 right-0 w-4 h-4 bg-[#0AC5A8] rounded-full border-2 border-white"></div>
                        </div>
                        <p className="mt-2 font-bold text-sm truncate">{p.name}</p>
                        <p className="text-xs text-[#0AC5A8] font-bold">{p.match_rate}%</p>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Achievement Banner */}
        {recentBadge && (
            <div 
              className="p-4 rounded-2xl flex items-center cursor-pointer" 
              style={{ background: 'linear-gradient(90deg, #F7F4FF, #FDF2F8)', border: '1px solid #B794F6' }}
              onClick={() => onNavigateToPage(Screen.Badges)}
            >
                <span className="text-4xl">{recentBadge.icon}</span>
                <div className="flex-1 ml-3">
                    <p className="font-bold text-base" style={{color: '#191F28'}}>새로운 배지 획득!</p>
                    <p className="font-medium text-sm" style={{color: '#8B95A1'}}>{recentBadge.name}</p>
                </div>
                <button className="h-8 px-3 text-xs font-bold text-white rounded-lg" style={{backgroundColor: '#B794F6'}}>
                    확인하기
                </button>
            </div>
        )}

      </main>
    </div>
  );
};

export { HomeScreen };
export default HomeScreen;
