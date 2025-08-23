
import React, { useState } from 'react';
import { ArrowLeftIcon } from '@qupid/ui';

const DataExportScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [progress, setProgress] = useState(0);
    const [isExporting, setIsExporting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const startExport = () => {
        setIsExporting(true);
        setIsComplete(false);
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsExporting(false);
                    setIsComplete(true);
                    return 100;
                }
                return prev + 5;
            });
        }, 150);
    };

    const CheckboxRow: React.FC<{title: string; defaultChecked?: boolean}> = ({title, defaultChecked=true}) => (
        <label className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
            <input type="checkbox" defaultChecked={defaultChecked} className="w-5 h-5 rounded accent-[#F093B0] border-gray-300" />
            <span className="text-base text-[#191F28]">{title}</span>
        </label>
    );

    const FileFormatCard: React.FC<{title: string; description: string; size: string;}> = ({title, description, size}) => (
         <label className="flex items-center p-4 border-2 border-[#F2F4F6] rounded-xl has-[:checked]:border-[#F093B0] has-[:checked]:bg-[#FDF2F8]">
            <input type="radio" name="file-format" className="w-5 h-5 accent-[#F093B0]" />
            <div className="ml-4 flex-1">
                <p className="font-bold text-base text-[#191F28]">{title}</p>
                <p className="text-sm text-[#8B95A1]">{description}</p>
            </div>
            <p className="text-sm font-medium text-[#8B95A1]">{size}</p>
        </label>
    );

    return (
        <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
            <header className="flex-shrink-0 flex items-center p-3 bg-white border-b border-[#F2F4F6]">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeftIcon className="w-6 h-6 text-[#191F28]" />
                </button>
                <h1 className="flex-1 text-center text-xl font-bold text-[#191F28]">데이터 내보내기</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                <section className="p-5 rounded-2xl" style={{ backgroundColor: '#EBF2FF' }}>
                    <div className="flex items-center">
                        <span className="text-3xl">📊</span>
                        <div className="ml-4">
                            <h2 className="font-bold text-lg text-[#191F28]">내 데이터 내보내기</h2>
                            <p className="mt-1 text-sm text-[#4F7ABA] leading-relaxed">
                                연애 박사에서 생성된 모든 데이터를 안전하게 다운로드할 수 있어요. 개인정보보호법에 따라 요청하신 데이터를 제공합니다.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="p-4 bg-white rounded-2xl border border-[#F2F4F6]">
                    <h3 className="font-bold text-lg px-3">내보낼 데이터 선택</h3>
                    <div className="mt-2 space-y-1">
                        <CheckboxRow title="전체 대화 내역" />
                        <CheckboxRow title="AI별 대화 요약" />
                        <CheckboxRow title="성과 및 성장 그래프 데이터" />
                        <CheckboxRow title="프로필 및 학습 설정" />
                        <CheckboxRow title="획득 배지 및 성취 기록" />
                    </div>
                </section>

                <section className="p-4 bg-white rounded-2xl border border-[#F2F4F6]">
                     <h3 className="font-bold text-lg px-3 mb-3">파일 형식 선택</h3>
                     <div className="space-y-3">
                        <FileFormatCard title="📄 PDF 보고서" description="보기 좋게 정리된 요약 보고서" size="약 5-10MB" />
                        <FileFormatCard title="📊 Excel 데이터" description="상세 데이터를 표로 정리" size="약 2-5MB" />
                        <FileFormatCard title="📋 JSON 원본 데이터" description="개발자용 원본 데이터" size="약 1-3MB" />
                     </div>
                </section>

                <section className="text-center text-sm text-[#8B95A1]">
                    <p>예상 파일 크기: <span className="font-bold text-gray-600">약 8MB</span></p>
                    <p>예상 소요 시간: <span className="font-bold text-gray-600">30초 ~ 1분</span></p>
                </section>
            </main>
            
            <footer className="p-4 bg-white border-t border-[#F2F4F6]">
                {isExporting ? (
                    <div className="w-full h-14 rounded-xl bg-gray-200 flex items-center justify-center relative">
                        <div className="absolute top-0 left-0 h-full bg-[#F093B0] rounded-xl transition-all" style={{width: `${progress}%`}}></div>
                        <p className="relative font-bold text-lg text-white">내보내는 중... {progress}%</p>
                    </div>
                ) : isComplete ? (
                    <div className="flex space-x-2">
                        <button className="flex-1 h-14 bg-[#0AC5A8] text-white text-lg font-bold rounded-xl">다운로드 완료!</button>
                         <button className="flex-1 h-14 bg-gray-600 text-white text-lg font-bold rounded-xl">공유하기</button>
                    </div>
                ) : (
                    <button
                        onClick={startExport}
                        className="w-full h-14 bg-[#F093B0] text-white text-lg font-bold rounded-xl"
                    >
                        내보내기 시작
                    </button>
                )}
            </footer>
        </div>
    );
};

export { DataExportScreen };
export default DataExportScreen;
