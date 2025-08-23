
import React, { useState } from 'react';
import { ArrowLeftIcon } from '@qupid/ui';

type Step = 'confirm' | 'final';

const DeleteAccountScreen: React.FC<{ onBack: () => void; onComplete: () => void; }> = ({ onBack, onComplete }) => {
    const [step, setStep] = useState<Step>('confirm');
    const [agree, setAgree] = useState(false);

    if (step === 'final') {
        return (
             <div className="flex flex-col h-full w-full bg-white justify-center items-center text-center p-8 animate-fade-in">
                <span className="text-6xl">👋</span>
                <h1 className="mt-6 text-3xl font-bold text-[#191F28]">아쉽지만 안녕히 가세요</h1>
                <p className="mt-3 text-base text-[#8B95A1]">언제든 다시 돌아와 주세요.<br/>더 나은 모습으로 기다리고 있을게요.</p>
                <button onClick={onComplete} className="mt-8 w-full max-w-xs h-14 bg-[#F093B0] text-white text-lg font-bold rounded-xl">앱 종료하기</button>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
            <header className="flex-shrink-0 flex items-center p-3 bg-white border-b border-[#F2F4F6]">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeftIcon className="w-6 h-6 text-[#191F28]" />
                </button>
                <h1 className="flex-1 text-center text-xl font-bold text-[#191F28]">회원 탈퇴</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                 <section className="p-5 rounded-2xl border border-[#FF4757]" style={{ backgroundColor: '#FFF4F4' }}>
                    <div className="flex items-start">
                        <span className="text-3xl mt-1">⚠️</span>
                        <div className="ml-3">
                            <h2 className="font-bold text-lg text-[#FF4757]">정말 탈퇴하시겠어요?</h2>
                            <p className="mt-1 text-sm text-[#FF4757] leading-relaxed">
                                탈퇴하시면 다음 데이터가 모두 삭제되며 복구할 수 없어요.
                            </p>
                            <ul className="mt-3 list-disc list-inside space-y-1 text-sm font-medium text-[#FF4757]">
                                <li>모든 대화 기록 (총 25회)</li>
                                <li>성장 분석 데이터 (3개월간)</li>
                                <li>획득한 배지 12개</li>
                                <li>즐겨찾는 AI 설정</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="p-4 bg-white rounded-2xl border border-[#F2F4F6]">
                    <h3 className="font-bold text-lg px-3">탈퇴 사유를 알려주세요 (선택)</h3>
                    <p className="text-sm text-[#8B95A1] px-3 mt-1">더 나은 서비스를 위해 사용될 소중한 의견이에요.</p>
                    <div className="mt-3 space-y-1">
                        {["원하는 기능이 없어요", "사용법이 복잡해요", "효과를 느끼지 못했어요", "다른 앱을 사용하게 됐어요", "개인정보가 걱정돼요"].map(reason => (
                             <label key={reason} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                                <input type="checkbox" className="w-5 h-5 rounded accent-[#F093B0] border-gray-300" />
                                <span className="text-base text-[#191F28]">{reason}</span>
                            </label>
                        ))}
                    </div>
                    <textarea 
                        placeholder="개선사항이나 의견을 자유롭게 써주세요"
                        className="w-full h-24 mt-2 p-3 text-sm bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#F093B0]"
                    ></textarea>
                </section>
                
                 <label className="flex items-center space-x-3 p-3">
                    <input type="checkbox" checked={agree} onChange={() => setAgree(v => !v)} className="w-5 h-5 rounded accent-[#F093B0] border-gray-300" />
                    <span className="text-base font-bold text-[#191F28]">위 내용을 모두 확인했으며, 데이터 삭제에 동의합니다.</span>
                </label>
            </main>

            <footer className="p-4 bg-white border-t border-[#F2F4F6] grid grid-cols-2 gap-3">
                <button
                    onClick={onBack}
                    className="w-full h-14 bg-[#F9FAFB] text-[#191F28] text-lg font-bold rounded-xl border border-[#E5E8EB]"
                >
                    다시 생각해보기
                </button>
                <button
                    onClick={() => setStep('final')}
                    disabled={!agree}
                    className="w-full h-14 bg-[#FF4757] text-white text-lg font-bold rounded-xl disabled:bg-[#D1D6DB] disabled:border-transparent"
                >
                    탈퇴하기
                </button>
            </footer>
        </div>
    );
};

export { DeleteAccountScreen };
export default DeleteAccountScreen;
