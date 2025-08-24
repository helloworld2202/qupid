import React from 'react';
import { ArrowLeftIcon, PaperAirplaneIcon, SparklesIcon, PlusCircleIcon, ChevronRightIcon, UserIcon, CheckIcon, SearchIcon, SettingsIcon, HeartIcon, LightbulbIcon, ThumbUpIcon, HelpCircleIcon, TargetIcon, ClockIcon, TrendingUpIcon, BellIcon, CalendarDaysIcon, TrophyIcon, BookmarkSquareIcon } from '@qupid/ui';
import { PREDEFINED_PERSONAS } from '@qupid/core';
import BottomNavBar from '../../../shared/components/BottomNavBar';

// Helper Components
const Section: React.FC<{ title: string; children: React.ReactNode; description?: string }> = ({ title, description, children }) => (
    <section className="mt-8">
        <h2 className="text-2xl font-bold text-[#191F28] pb-1 border-b border-gray-200">{title}</h2>
        {description && <p className="mt-2 text-base text-[#8B95A1]">{description}</p>}
        <div className="mt-4">{children}</div>
    </section>
);

const ColorSwatch: React.FC<{ name: string; hex: string; varName: string }> = ({ name, hex, varName }) => (
    <div className="flex items-center">
        <div className="w-16 h-16 rounded-lg border border-gray-200" style={{ backgroundColor: hex }}></div>
        <div className="ml-4">
            <p className="font-bold text-base text-[#191F28]">{name}</p>
            <p className="text-sm text-[#8B95A1]">{hex}</p>
            <code className="text-xs text-[#4F7ABA] bg-gray-100 px-1 py-0.5 rounded">{varName}</code>
        </div>
    </div>
);

const ComponentShowcase: React.FC<{ title: string; children: React.ReactNode; widthClass?: string }> = ({ title, children, widthClass = 'w-full' }) => (
    <div className="mt-4">
        <h3 className="font-semibold text-lg text-[#191F28]">{title}</h3>
        <div className={`mt-2 p-4 bg-white rounded-xl border border-gray-200 flex flex-col items-center space-y-2 ${widthClass}`}>
            {children}
        </div>
    </div>
);

interface DesignGuideScreenProps {
  onBack: () => void;
}

const DesignGuideScreen: React.FC<DesignGuideScreenProps> = ({ onBack }) => {

    const colors = {
        primary: [
            { name: 'Primary Pink Main', hex: '#F093B0', varName: '--primary-pink-main' },
            { name: 'Primary Pink Light', hex: '#FDF2F8', varName: '--primary-pink-light' },
            { name: 'Primary Pink Dark', hex: '#DB7093', varName: '--primary-pink-dark' },
            { name: 'Secondary Blue Main', hex: '#4F7ABA', varName: '--secondary-blue-main' },
            { name: 'Secondary Blue Light', hex: '#EBF2FF', varName: '--secondary-blue-light' },
            { name: 'Secondary Blue Dark', hex: '#3A5A8A', varName: '--secondary-blue-dark' },
            { name: 'Accent Lavender', hex: '#B794F6', varName: '--accent-lavender' },
        ],
        functional: [
            { name: 'Success Green', hex: '#0AC5A8', varName: '--success-green' },
            { name: 'Warning Orange', hex: '#FF8A00', varName: '--warning-orange' },
            { name: 'Error Red', hex: '#FF4757', varName: '--error-red' },
            { name: 'Error Red Light', hex: '#FFE8EA', varName: '--error-red-light' },
        ],
        neutral: [
            { name: 'Surface', hex: '#FFFFFF', varName: '--surface' },
            { name: 'Background', hex: '#F9FAFB', varName: '--background' },
            { name: 'Card', hex: '#FFFFFF', varName: '--card' },
            { name: 'Border', hex: '#E5E8EB', varName: '--border' },
            { name: 'Divider', hex: '#F2F4F6', varName: '--divider' },
            { name: 'Text Primary', hex: '#191F28', varName: '--text-primary' },
            { name: 'Text Secondary', hex: '#8B95A1', varName: '--text-secondary' },
            { name: 'Text Tertiary', hex: '#B0B8C1', varName: '--text-tertiary' },
            { name: 'Text Disabled', hex: '#D1D6DB', varName: '--text-disabled' },
        ]
    };

    const allIcons = [
        { Icon: ArrowLeftIcon, name: 'ArrowLeft' }, { Icon: PaperAirplaneIcon, name: 'PaperAirplane' },
        { Icon: SparklesIcon, name: 'Sparkles' }, { Icon: PlusCircleIcon, name: 'PlusCircle' },
        { Icon: ChevronRightIcon, name: 'ChevronRight' }, { Icon: UserIcon, name: 'User' },
        { Icon: CheckIcon, name: 'Check' }, { Icon: SearchIcon, name: 'Search' },
        { Icon: SettingsIcon, name: 'Settings' }, { Icon: HeartIcon, name: 'Heart' },
        { Icon: LightbulbIcon, name: 'Lightbulb' },
        { Icon: ThumbUpIcon, name: 'ThumbUp' }, { Icon: HelpCircleIcon, name: 'HelpCircle' },
        { Icon: TargetIcon, name: 'Target' }, { Icon: ClockIcon, name: 'Clock' },
        { Icon: TrendingUpIcon, name: 'TrendingUp' }, { Icon: BellIcon, name: 'Bell' },
        { Icon: CalendarDaysIcon, name: 'CalendarDays' },
        { Icon: TrophyIcon, name: 'Trophy' }, { Icon: BookmarkSquareIcon, name: 'BookmarkSquare' }
    ];

    const TossToggle: React.FC<{ value: boolean; onToggle: () => void; }> = ({ value, onToggle }) => (
        <button
            onClick={onToggle}
            className={`relative inline-flex items-center h-[30px] w-[50px] rounded-full transition-colors duration-300 ease-in-out focus:outline-none`}
            style={{ backgroundColor: value ? '#F093B0' : '#E5E8EB' }}
        >
            <span
                className={`inline-block w-[26px] h-[26px] transform bg-white rounded-full transition-transform duration-300 ease-in-out shadow-sm`}
                style={{ transform: value ? 'translateX(22px)' : 'translateX(2px)' }}
            />
        </button>
    );

    return (
        <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
            <header className="flex-shrink-0 flex items-center p-3 bg-white border-b border-[#F2F4F6]">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeftIcon className="w-6 h-6 text-[#191F28]" />
                </button>
                <h1 className="flex-1 text-center text-xl font-bold text-[#191F28]">🎨 디자인 가이드</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                <p className="text-lg text-gray-600">이 문서는 프로젝트의 일관된 디자인 시스템을 정의합니다. 컴포넌트, 색상, 타이포그래피 등의 가이드라인을 포함합니다.</p>

                <Section title="1. 색상 (Colors)" description="앱 전체에서 사용되는 색상 팔레트입니다. CSS 변수로 관리됩니다.">
                    <h3 className="text-xl font-semibold mt-4">Primary Colors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                        {colors.primary.map(c => <ColorSwatch key={c.varName} {...c} />)}
                    </div>
                     <h3 className="text-xl font-semibold mt-6">Functional Colors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                        {colors.functional.map(c => <ColorSwatch key={c.varName} {...c} />)}
                    </div>
                     <h3 className="text-xl font-semibold mt-6">Neutral Colors (Light Mode)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                        {colors.neutral.map(c => <ColorSwatch key={c.varName} {...c} />)}
                    </div>
                </Section>

                <Section title="2. 타이포그래피 (Typography)" description="앱의 텍스트 계층 구조입니다. Pretendard (주)와 Inter (부) 폰트를 사용합니다.">
                    <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-4">
                        <div><h1 className="text-3xl font-bold text-[#191F28]">H1 - 3xl/bold: 안녕하세요</h1></div>
                        <div><h2 className="text-2xl font-bold text-[#191F28]">H2 - 2xl/bold: 안녕하세요</h2></div>
                        <div><h3 className="text-xl font-bold text-[#191F28]">H3 - xl/bold: 안녕하세요</h3></div>
                        <div><h4 className="text-lg font-bold text-[#191F28]">H4 - lg/bold: 안녕하세요</h4></div>
                        <div><p className="text-base font-medium text-[#191F28]">Body1 - base/medium: 안녕하세요</p></div>
                        <div><p className="text-sm text-[#8B95A1]">Body2 - sm/regular: 안녕하세요</p></div>
                        <div><p className="text-xs text-[#B0B8C1]">Caption - xs/regular: 안녕하세요</p></div>
                    </div>
                </Section>
                
                <Section title="3. 아이콘 (Icons)" description="SVG 아이콘은 React 컴포넌트로 관리됩니다.">
                     <div className="p-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 bg-white rounded-xl border border-gray-200">
                        {allIcons.map(({ Icon, name }) => (
                            <div key={name} className="flex flex-col items-center text-center">
                                <Icon className="w-8 h-8 text-gray-700" />
                                <p className="text-xs mt-2 text-gray-500">{name}</p>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="4. 컴포넌트 (Components)" description="재사용 가능한 UI 요소들입니다.">
                     <ComponentShowcase title="Buttons">
                        <button className="h-12 px-6 bg-[#F093B0] text-white font-bold rounded-xl text-lg">기본 버튼</button>
                        <button className="h-10 px-4 bg-[#FDF2F8] text-[#DB7093] font-bold rounded-lg text-sm">보조 버튼</button>
                         <button className="h-12 px-6 bg-[#F2F4F6] text-[#8B95A1] font-bold rounded-xl text-lg" disabled>비활성 버튼</button>
                         <button className="h-12 w-12 flex items-center justify-center bg-[#F093B0] text-white rounded-full"><PaperAirplaneIcon className="w-6 h-6" /></button>
                    </ComponentShowcase>
                     <ComponentShowcase title="Toggles">
                        <div className="flex space-x-4">
                            <TossToggle value={true} onToggle={() => {}} />
                            <TossToggle value={false} onToggle={() => {}} />
                        </div>
                    </ComponentShowcase>
                    <ComponentShowcase title="Inputs">
                        <input type="text" placeholder="이름이나 특성으로 검색" className="w-full h-11 pl-4 pr-4 bg-[#F2F4F6] rounded-full focus:outline-none focus:ring-2 focus:ring-[#F093B0]" />
                        <textarea placeholder="성격, 나이, 직업, 취미, 가치관 등을 상세히 적어주세요." className="w-full h-24 p-4 border rounded-xl focus:outline-none focus:ring-2 resize-none text-base" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', '--tw-ring-color': 'var(--secondary-blue-main)' } as React.CSSProperties}></textarea>
                    </ComponentShowcase>
                    <ComponentShowcase title="Navigation Bar">
                        <div className="w-full max-w-[430px]">
                          <BottomNavBar activeTab="HOME" onTabChange={() => {}} />
                        </div>
                    </ComponentShowcase>
                     <ComponentShowcase title="Chat Bubbles">
                         <div className="w-full flex flex-col space-y-2">
                             <div className="flex items-end gap-2 justify-start">
                                <img src={PREDEFINED_PERSONAS[0].avatar} alt="ai" className="w-8 h-8 rounded-full self-start" />
                                <div className="max-w-xs px-4 py-3 shadow-sm rounded-t-[18px] rounded-r-[18px] rounded-bl-[6px] bg-[#F9FAFB] text-[#191F28]">
                                    <p>안녕하세요! 처음 뵙네요 😊</p>
                                </div>
                            </div>
                            <div className="flex items-end gap-2 justify-end">
                                <div className="max-w-xs px-4 py-3 shadow-sm text-white rounded-t-[18px] rounded-l-[18px] rounded-br-[6px] bg-[#F093B0]">
                                    <p>네, 안녕하세요! 만나서 반가워요.</p>
                                </div>
                            </div>
                         </div>
                    </ComponentShowcase>
                </Section>
            </main>
        </div>
    );
};

export { DesignGuideScreen };
export default DesignGuideScreen;