
import React from 'react';
import { Tab, Screen } from '@qupid/core';

interface BottomNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  notifications?: {
    chat?: boolean;
    coaching?: boolean;
    my?: boolean;
  };
}

const NavItem: React.FC<{
  label: string;
  icon: string;
  isActive: boolean;
  hasNotification?: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, hasNotification, onClick }) => {
  const activeColor = 'var(--primary-pink-main)';
  const inactiveColor = 'var(--text-secondary)';

  return (
    <button onClick={onClick} className="flex-1 flex flex-col items-center justify-center p-2 transition-transform duration-200 ease-out hover:scale-105">
      <div className="relative">
        <span className="text-2xl" style={{ color: isActive ? activeColor : inactiveColor }}>
          {icon}
        </span>
        {hasNotification && (
          <div className="absolute top-0 right-[-4px] w-2 h-2 bg-red-500 rounded-full border border-white"></div>
        )}
      </div>
      <span className={`text-xs font-bold mt-1`} style={{ color: isActive ? activeColor : inactiveColor }}>
        {label}
      </span>
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange, notifications = {} }) => {
  const tabs = [
    { id: 'HOME', label: '홈', icon: '🏠' },
    { id: 'CHAT_TAB', label: '대화', icon: '💬', notification: notifications.chat },
    { id: 'COACHING_TAB', label: '코칭', icon: '📚', notification: notifications.coaching },
    { id: 'MY_TAB', label: 'MY', icon: '👤', notification: notifications.my },
  ];

  return (
    <div className="flex-shrink-0 h-[80px] w-full bg-white border-t" style={{ borderColor: 'var(--divider)' }}>
      <div className="flex h-full w-full">
        {tabs.map(tab => (
          <NavItem
            key={tab.id}
            label={tab.label}
            icon={tab.icon}
            isActive={activeTab === tab.id}
            hasNotification={tab.notification}
            onClick={() => onTabChange(tab.id)}
          />
        ))}
      </div>
    </div>
  );
};

export { BottomNavBar };
export default BottomNavBar;
