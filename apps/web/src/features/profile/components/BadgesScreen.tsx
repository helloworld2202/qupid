
import React, { useState } from 'react';
import { Badge } from '@qupid/core';
import { ArrowLeftIcon } from '@qupid/ui';

interface BadgesScreenProps {
  badges: Badge[];
  onBack: () => void;
}

type Category = '전체' | '대화' | '성장' | '특별';

const BadgeCard: React.FC<{ badge: Badge }> = ({ badge }) => {
    const isLocked = !badge.acquired;
    return (
        <div className={`p-4 rounded-2xl flex flex-col items-center text-center transition-opacity ${isLocked ? 'bg-gray-100 opacity-60' : 'bg-white border border-[#F2F4F6]'}`}>
            <p className="text-5xl">{isLocked ? '🔒' : badge.icon}</p>
            <p className="mt-2 font-bold text-[#191F28]">{badge.name}</p>
            <p className="text-xs text-[#8B95A1] mt-1 flex-grow">{badge.description}</p>
            {badge.progress && (
                <div className="w-full mt-2">
                    <div className="w-full bg-[#E5E8EB] h-1.5 rounded-full">
                        <div className="bg-[#F093B0] h-1.5 rounded-full" style={{ width: `${(badge.progress.current / badge.progress.total) * 100}%` }}></div>
                    </div>
                    <p className="text-xs font-semibold mt-1 text-[#F093B0]">{badge.progress.current}/{badge.progress.total}</p>
                </div>
            )}
        </div>
    )
}

const BadgesScreen: React.FC<BadgesScreenProps> = ({ badges, onBack }) => {
  const [activeTab, setActiveTab] = useState<Category>('전체');
  
  const tabs: Category[] = ['전체', '대화', '성장', '특별'];
  const featuredBadge = badges.find(b => b.featured && b.acquired);

  const filteredBadges = activeTab === '전체' 
    ? badges 
    : badges.filter(b => b.category === activeTab);

  return (
    <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
      <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-[#F2F4F6] bg-white">
        <div className="w-10">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeftIcon className="w-6 h-6 text-[#8B95A1]" />
          </button>
        </div>
        <h2 className="text-center text-lg font-bold text-[#191F28]">획득한 배지</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-4">
        {featuredBadge && (
            <section className="p-5 rounded-2xl bg-gradient-to-br from-[#F093B0] to-[#B794F6] text-white">
                <div className="flex items-center">
                    <p className="text-5xl">{featuredBadge.icon}</p>
                    <div className="ml-4">
                        <p className="font-bold text-lg">{featuredBadge.name}</p>
                        <p className="text-sm opacity-90">{featuredBadge.description}</p>
                    </div>
                </div>
            </section>
        )}
        
        <nav className="flex bg-[#F2F4F6] p-1 rounded-full">
            {tabs.map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === tab ? 'bg-white text-[#F093B0] shadow-sm' : 'text-[#8B95A1]'}`}
                >
                    {tab}
                </button>
            ))}
        </nav>

        <section className="grid grid-cols-2 gap-3">
            {filteredBadges.map(badge => (
                <BadgeCard key={badge.id} badge={badge} />
            ))}
        </section>
      </main>
    </div>
  );
};

export { BadgesScreen };
export default BadgesScreen;
