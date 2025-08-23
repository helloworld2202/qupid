
import React, { useState } from 'react';
import { ArrowLeftIcon } from '@qupid/ui';

const TossToggle: React.FC<{ value: boolean; onToggle: () => void; size?: 'normal' | 'large' }> = ({ value, onToggle, size = 'normal' }) => {
    const isLarge = size === 'large';
    const width = isLarge ? 60 : 50;
    const height = isLarge ? 34 : 30;
    const thumbSize = isLarge ? 30 : 26;
    const padding = 2;
    const translateX = value ? width - thumbSize - padding : padding;
    return (
    <button
        onClick={onToggle}
        className={`relative inline-flex items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none`}
        style={{ width, height, backgroundColor: value ? '#F093B0' : '#E5E8EB' }}
    >
        <span
            className={`inline-block transform bg-white rounded-full transition-transform duration-300 ease-in-out shadow-sm`}
            style={{ width: thumbSize, height: thumbSize, transform: `translateX(${translateX}px)` }}
        />
    </button>
    );
};

const Section: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
    <section>
        <h2 className="font-bold text-lg px-2 text-[#191F28]">{title}</h2>
        <div className="mt-2 bg-white rounded-2xl border border-[#F2F4F6] divide-y divide-[#F2F4F6]">
            {children}
        </div>
    </section>
);

const SettingRow: React.FC<{title: string; description?: string; rightContent: React.ReactNode;}> = ({title, description, rightContent}) => (
    <div className="p-4 flex items-center">
        <div className="flex-1">
            <p className="font-medium text-[#191F28]">{title}</p>
            {description && <p className="text-sm text-[#8B95A1] mt-0.5">{description}</p>}
        </div>
        {rightContent}
    </div>
);

const NotificationSettingsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [allNotifications, setAllNotifications] = useState(true);
    // Individual states
    const [practiceAlert, setPracticeAlert] = useState(true);
    const [goalAlert, setGoalAlert] = useState(true);
    const [summaryAlert, setSummaryAlert] = useState(true);
    const [aiRecAlert, setAiRecAlert] = useState(true);
    const [badgeAlert, setBadgeAlert] = useState(true);
    const [matchAlert, setMatchAlert] = useState(false);
    const [updateAlert, setUpdateAlert] = useState(true);

    const handleToggleAll = () => {
        const newState = !allNotifications;
        setAllNotifications(newState);
        setPracticeAlert(newState);
        setGoalAlert(newState);
        setSummaryAlert(newState);
        setAiRecAlert(newState);
        setBadgeAlert(newState);
        setMatchAlert(newState);
        setUpdateAlert(newState);
    }
    
    return (
        <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
            <header className="flex-shrink-0 flex items-center p-3 bg-white border-b border-[#F2F4F6]">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeftIcon className="w-6 h-6 text-[#191F28]" />
                </button>
                <h1 className="flex-1 text-center text-xl font-bold text-[#191F28]">알림 설정</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="p-4 flex items-center bg-white rounded-2xl border border-[#F2F4F6] h-20">
                    <span className="text-3xl mr-4">🔔</span>
                    <div className="flex-1">
                        <p className="font-bold text-lg">전체 알림</p>
                        <p className="text-sm text-[#8B95A1]">모든 알림을 한번에 켜거나 꺼요</p>
                    </div>
                    <TossToggle value={allNotifications} onToggle={handleToggleAll} size="large" />
                </div>

                <Section title="학습 알림">
                    <SettingRow title="📚 연습 시간 알림" description="설정한 시간에 대화 연습 알림" rightContent={<TossToggle value={practiceAlert} onToggle={() => setPracticeAlert(v => !v)} />}/>
                    <SettingRow title="🎯 목표 달성 알림" description="일일/주간 목표 달성 시" rightContent={<TossToggle value={goalAlert} onToggle={() => setGoalAlert(v => !v)} />}/>
                    <SettingRow title="📊 성과 요약 알림" description="주간/월간 성과 요약" rightContent={<TossToggle value={summaryAlert} onToggle={() => setSummaryAlert(v => !v)} />}/>
                </Section>
                
                <Section title="소셜 알림">
                    <SettingRow title="💕 새로운 AI 추천" description="맞춤 AI 추천 시" rightContent={<TossToggle value={aiRecAlert} onToggle={() => setAiRecAlert(v => !v)} />}/>
                    <SettingRow title="🏆 배지 획득 알림" description="새로운 성취 달성 시" rightContent={<TossToggle value={badgeAlert} onToggle={() => setBadgeAlert(v => !v)} />}/>
                    <SettingRow title="💬 매칭 알림" description="실제 매칭 관련 알림" rightContent={<TossToggle value={matchAlert} onToggle={() => setMatchAlert(v => !v)} />}/>
                </Section>
                
                <Section title="시스템 알림">
                    <SettingRow title="🆙 앱 업데이트 알림" rightContent={<TossToggle value={updateAlert} onToggle={() => setUpdateAlert(v => !v)} />}/>
                    <SettingRow title="🔐 보안 알림" rightContent={<span className="text-sm font-medium text-gray-400">항상 ON</span>}/>
                </Section>
                
                <Section title="알림 시간">
                    <SettingRow title="연습 알림 시간" rightContent={<p className="font-bold text-lg text-[#F093B0]">오후 7:00</p>} />
                    <SettingRow title="방해 금지 시간" rightContent={<p className="font-bold text-base text-gray-500">오후 10시 ~ 오전 8시</p>} />
                </Section>

            </main>
        </div>
    );
};

export { NotificationSettingsScreen };
export default NotificationSettingsScreen;
