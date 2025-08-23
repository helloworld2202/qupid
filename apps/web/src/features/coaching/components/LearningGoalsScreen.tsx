
import React, { useState } from 'react';
import { ArrowLeftIcon } from '@qupid/ui';

const LearningGoalsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [selectedGoal, setSelectedGoal] = useState('집중');
    const [customCount, setCustomCount] = useState(3);
    const [customTime, setCustomTime] = useState(15);

    const goalOptions = [
        { key: '초보자', title: '🌱 초보자', content: '일 1회 대화 (15분)', suitable: '연애 경험이 적은 분', bg: '#F0FDF9' },
        { key: '일반', title: '🎯 일반', content: '일 2회 대화 (30분)', suitable: '꾸준히 연습하고 싶은 분', bg: '#EBF2FF' },
        { key: '집중', title: '🔥 집중', content: '일 3회 대화 (45분)', suitable: '빠른 실력 향상을 원하는 분', bg: '#FDF2F8' },
        { key: '마스터', title: '💪 마스터', content: '일 4회 대화 (60분)', suitable: '최고 수준을 목표로 하는 분', bg: '#FFF4E6' },
    ];

    return (
        <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
            <header className="flex-shrink-0 flex items-center p-3 bg-white border-b border-[#F2F4F6]">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeftIcon className="w-6 h-6 text-[#191F28]" />
                </button>
                <div className="flex-1 text-center">
                    <h1 className="text-xl font-bold text-[#191F28]">학습 목표 설정</h1>
                    <p className="text-sm text-[#8B95A1]">꾸준한 연습을 위한 목표를 정해주세요</p>
                </div>
                <div className="w-10"></div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                <section className="p-5 rounded-2xl border border-[#F093B0]" style={{ backgroundColor: '#FDF2F8' }}>
                    <h2 className="font-bold text-lg text-[#191F28]">현재 목표</h2>
                    <p className="text-2xl font-bold mt-1 text-[#DB7093]">일 3회 대화</p>
                    <p className="font-medium mt-1 text-gray-600">이번 주 85% 달성</p>
                    <div className="mt-3 flex justify-between items-center text-lg">
                        {['월','화','수','목','금','토','일'].map((day, i) => (
                            <div key={day} className="flex flex-col items-center">
                                <span className={`font-bold ${i < 3 ? 'text-[#0AC5A8]' : 'text-[#F093B0]'}`}>{i < 3 ? '✅' : '⏸️'}</span>
                                <span className="text-xs mt-1 text-gray-500">{day}</span>
                            </div>
                        ))}
                    </div>
                </section>
                
                <section>
                    <h2 className="font-bold text-lg px-2 text-[#191F28]">새로운 목표 선택</h2>
                    <div className="mt-2 space-y-3">
                        {goalOptions.map(opt => (
                            <button 
                                key={opt.key}
                                onClick={() => setSelectedGoal(opt.key)}
                                className={`w-full p-4 rounded-2xl text-left border-2 relative transition-all ${selectedGoal === opt.key ? 'border-[#F093B0]' : 'border-transparent'}`}
                                style={{ backgroundColor: opt.bg }}
                            >
                                <h3 className="font-bold text-lg">{opt.title}</h3>
                                <p className="font-medium mt-1">{opt.content}</p>
                                <p className="text-sm text-gray-600">{opt.suitable}</p>
                                {selectedGoal === opt.key && <div className="absolute top-3 right-3 w-5 h-5 bg-[#F093B0] rounded-full flex items-center justify-center text-white text-xs">✓</div>}
                            </button>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="font-bold text-lg px-2 text-[#191F28]">직접 설정하기</h2>
                    <div className="mt-2 p-5 bg-white rounded-2xl border border-[#F2F4F6] space-y-4">
                        <div>
                            <label className="font-medium">일일 대화 횟수: <span className="font-bold text-[#F093B0]">{customCount}회</span></label>
                            <input type="range" min="1" max="5" value={customCount} onChange={e => setCustomCount(Number(e.target.value))} className="w-full mt-1 accent-[#F093B0]" />
                        </div>
                        <div>
                            <label className="font-medium">대화 시간: <span className="font-bold text-[#F093B0]">{customTime}분</span></label>
                            <input type="range" min="10" max="60" step="5" value={customTime} onChange={e => setCustomTime(Number(e.target.value))} className="w-full mt-1 accent-[#F093B0]" />
                        </div>
                        <div>
                            <p className="font-medium mb-2">주간 목표</p>
                            <div className="space-y-2">
                                <label className="flex items-center"><input type="checkbox" className="w-4 h-4 accent-[#F093B0] mr-2" defaultChecked /> 새로운 AI와 대화하기</label>
                                <label className="flex items-center"><input type="checkbox" className="w-4 h-4 accent-[#F093B0] mr-2" defaultChecked /> 특정 스킬 집중 연습</label>
                                <label className="flex items-center"><input type="checkbox" className="w-4 h-4 accent-[#F093B0] mr-2" /> 실제 매칭 도전하기</label>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="p-4 rounded-lg bg-[#EBF2FF]">
                    <h3 className="font-bold text-base text-[#4F7ABA]">💡 예상 성과</h3>
                    <p className="mt-1 text-sm text-[#3A5A8A] leading-relaxed">
                        "일 3회 대화 목표로 꾸준히 연습하면 4주 후 대화 점수 +25점 향상, 8주 후 고급 레벨 달성이 예상돼요!"
                    </p>
                </section>
            </main>
        </div>
    );
};

export { LearningGoalsScreen };
export default LearningGoalsScreen;
