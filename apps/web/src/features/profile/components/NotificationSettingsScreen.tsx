import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@qupid/ui';

interface NotificationSettingsScreenProps {
  onBack: () => void;
  notificationTime: string;
  doNotDisturbStart: string;
  doNotDisturbEnd: string;
  onSave: (notificationTime: string, doNotDisturbStart: string, doNotDisturbEnd: string) => void;
}

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

const SettingItem: React.FC<{
  icon: string;
  title: string;
  subtitle?: string;
  rightComponent: React.ReactNode;
  onClick?: () => void;
  isLast?: boolean;
}> = ({ icon, title, subtitle, rightComponent, onClick, isLast = false }) => (
    <div className={`flex items-center w-full h-[56px] px-5 ${isLast ? '' : 'border-b border-[#F2F4F6]'} ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
        <div className="flex items-center flex-1">
            <span className="text-2xl w-6 text-center">{icon}</span>
            <div className="ml-4 text-left">
                <p className="text-base font-medium text-[#191F28]">{title}</p>
                {subtitle && <p className="text-sm text-[#8B95A1]">{subtitle}</p>}
            </div>
        </div>
        <div className="flex items-center space-x-2 text-[#8B95A1]">
            {rightComponent}
        </div>
    </div>
);

const SectionContainer: React.FC<{ title?: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={`mt-4 ${className}`}>
        {title && <h3 className="px-5 pb-1 text-lg font-bold text-[#191F28]">{title}</h3>}
        <div className="bg-white rounded-2xl border border-[#F2F4F6] overflow-hidden">
            {children}
        </div>
    </div>
);

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ 
  onBack, 
  notificationTime, 
  doNotDisturbStart, 
  doNotDisturbEnd, 
  onSave 
}) => {
  const [localNotificationTime, setLocalNotificationTime] = useState(notificationTime);
  const [localDoNotDisturbStart, setLocalDoNotDisturbStart] = useState(doNotDisturbStart);
  const [localDoNotDisturbEnd, setLocalDoNotDisturbEnd] = useState(doNotDisturbEnd);
  
  // 알림 설정 상태
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [newAIRecommendation, setNewAIRecommendation] = useState(true);
  const [badgeNotification, setBadgeNotification] = useState(true);
  const [matchingNotification, setMatchingNotification] = useState(true);
  const [appUpdateNotification, setAppUpdateNotification] = useState(true);

  const handleSave = () => {
    onSave(localNotificationTime, localDoNotDisturbStart, localDoNotDisturbEnd);
    onBack();
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? '오후' : '오전';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${period} ${displayHour}:${minute}`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
      <header className="flex-shrink-0 flex items-center justify-between p-3 bg-white">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeftIcon className="w-6 h-6 text-[#191F28]" />
        </button>
        <h1 className="text-xl font-bold text-[#191F28]">알림 설정</h1>
        <button 
          onClick={handleSave}
          className="px-3 py-1 text-sm font-medium text-[#F093B0] hover:text-[#DB7093]"
        >
          저장
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {/* 상단 알림 설정 */}
        <SectionContainer>
          <SettingItem 
            icon="📊" 
            title="주간/월간 성과 요약" 
            rightComponent={<TossToggle value={weeklySummary} onToggle={() => setWeeklySummary(v => !v)} />}
          />
        </SectionContainer>

        {/* 소셜 알림 */}
        <SectionContainer>
          <SettingItem 
            icon="💕" 
            title="새로운 AI 추천" 
            subtitle="맞춤 AI 추천 시"
            rightComponent={<TossToggle value={newAIRecommendation} onToggle={() => setNewAIRecommendation(v => !v)} />}
          />
          <SettingItem 
            icon="🏆" 
            title="배지 획득 알림" 
            subtitle="새로운 성취 달성 시"
            rightComponent={<TossToggle value={badgeNotification} onToggle={() => setBadgeNotification(v => !v)} />}
          />
          <SettingItem 
            icon="💬" 
            title="매칭 알림" 
            subtitle="실제 매칭 관련 알림"
            rightComponent={<TossToggle value={matchingNotification} onToggle={() => setMatchingNotification(v => !v)} />}
            isLast={true}
          />
        </SectionContainer>

        {/* 시스템 알림 */}
        <SectionContainer>
          <SettingItem 
            icon="⬆️" 
            title="앱 업데이트 알림" 
            rightComponent={<TossToggle value={appUpdateNotification} onToggle={() => setAppUpdateNotification(v => !v)} />}
          />
          <SettingItem 
            icon="🔒" 
            title="보안 알림" 
            rightComponent={<span className="text-sm text-[#8B95A1]">항상 ON</span>}
            isLast={true}
          />
        </SectionContainer>

        {/* 알림 시간 설정 */}
        <SectionContainer>
          <SettingItem 
            icon="⏰" 
            title="연습 알림 시간" 
            rightComponent={
              <div className="flex items-center space-x-2">
                <span className="text-sm text-[#F093B0] font-medium">{formatTime(localNotificationTime)}</span>
                <input
                  type="time"
                  value={localNotificationTime}
                  onChange={(e) => setLocalNotificationTime(e.target.value)}
                  className="w-0 h-0 opacity-0 absolute"
                  id="notification-time"
                />
                <label htmlFor="notification-time" className="cursor-pointer">
                  <span className="text-xs text-[#8B95A1]">수정</span>
                </label>
              </div>
            }
          />
          <SettingItem 
            icon="🔕" 
            title="방해 금지 시간" 
            rightComponent={
              <div className="flex items-center space-x-2">
                <span className="text-sm text-[#8B95A1] font-medium">
                  {formatTime(localDoNotDisturbStart)} ~ {formatTime(localDoNotDisturbEnd)}
                </span>
                <input
                  type="time"
                  value={localDoNotDisturbStart}
                  onChange={(e) => setLocalDoNotDisturbStart(e.target.value)}
                  className="w-0 h-0 opacity-0 absolute"
                  id="dnd-start"
                />
                <input
                  type="time"
                  value={localDoNotDisturbEnd}
                  onChange={(e) => setLocalDoNotDisturbEnd(e.target.value)}
                  className="w-0 h-0 opacity-0 absolute"
                  id="dnd-end"
                />
                <label htmlFor="dnd-start" className="cursor-pointer">
                  <span className="text-xs text-[#8B95A1]">수정</span>
                </label>
              </div>
            }
            isLast={true}
          />
        </SectionContainer>
      </main>
    </div>
  );
};

export default NotificationSettingsScreen;