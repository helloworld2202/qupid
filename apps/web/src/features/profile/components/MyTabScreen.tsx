
import React, { useState } from 'react';
import { UserProfile, Screen } from '@qupid/core';
import { ChevronRightIcon } from '@qupid/ui';
import { useUserProfile } from '../../../shared/hooks/api/useUser';
import { useAppStore } from '../../../shared/stores/useAppStore';

interface MyTabScreenProps {
  onNavigate: (screen: Screen) => void;
  onLogout?: () => void;
  isGuest?: boolean;
}

const TossToggle: React.FC<{ value: boolean; onToggle: () => void; }> = ({ value, onToggle }) => (
    <button
        onClick={(e) => {
            e.stopPropagation();
            onToggle();
        }}
        className={`relative inline-flex items-center h-[30px] w-[50px] rounded-full transition-colors duration-300 ease-in-out focus:outline-none`}
        style={{ backgroundColor: value ? 'var(--primary-pink-main)' : '#E5E8EB' }}
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
  dangerous?: boolean;
}> = ({ icon, title, subtitle, rightComponent, onClick, dangerous = false }) => {
    const isClickable = !!onClick;
    const Component = isClickable ? 'button' : 'div';
    
    return (
        <Component 
            onClick={onClick} 
            className={`flex items-center w-full h-[56px] px-5 bg-white ${isClickable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        >
            <div className="flex items-center flex-1">
                <span className="text-2xl w-6 text-center">{icon}</span>
                <div className="ml-4 text-left">
                    <p className={`text-base font-medium ${dangerous ? 'text-[var(--warning-orange)]' : 'text-[#191F28]'}`}>{title}</p>
                    {subtitle && <p className="text-xs text-[#8B95A1]">{subtitle}</p>}
                </div>
            </div>
            <div className="flex items-center space-x-2 text-[#8B95A1]">
                {rightComponent}
            </div>
        </Component>
    );
};

const SectionContainer: React.FC<{ title?: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={`mt-4 ${className}`}>
        {title && <h3 className="px-5 pb-1 text-base font-bold text-[#8B95A1]">{title}</h3>}
        <div className="bg-white rounded-2xl border border-[#F2F4F6] overflow-hidden divide-y divide-[#F2F4F6]">
            {children}
        </div>
    </div>
);

const MyTabScreen: React.FC<MyTabScreenProps> = ({ onNavigate, onLogout, isGuest }) => {
    const { currentUserId } = useAppStore();
    const { data: userProfile } = useUserProfile(currentUserId || '');
    
    // 로딩 중이거나 데이터가 없을 때의 기본값
    const defaultProfile = { name: '사용자', user_gender: 'male' } as UserProfile;
    const profile = userProfile || defaultProfile;
    const [practiceNotification, setPracticeNotification] = useState(true);
    // const [analysisDisplay] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const initial = profile.name.charAt(0).toUpperCase();

    return (
        <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
            <header className="flex-shrink-0 p-4 pt-5 bg-white">
                <h1 className="text-2xl font-bold text-[#191F28]">MY</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 pb-24">
                {/* Profile Card */}
                <div 
                    className="h-[120px] rounded-2xl p-5 flex items-center" 
                    style={{ background: 'linear-gradient(135deg, #FDF2F8, #EBF2FF)' }}
                >
                    <div className="w-16 h-16 rounded-full bg-[#F093B0] flex items-center justify-center text-white text-3xl font-bold">
                        {initial}
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="font-bold text-xl text-[#191F28]">
                            {isGuest ? '게스트' : profile.name}
                            {isGuest && <span className="ml-2 text-xs text-[#F093B0]">(임시)</span>}
                        </p>
                        <p className="font-medium text-sm text-[#8B95A1]">
                            {isGuest ? '체험 중' : 'Level 3 · 대화 중급자'}
                        </p>
                        {!isGuest && (
                            <div className="mt-1.5 h-1 w-full bg-white/30 rounded-full">
                                <div className="h-1 rounded-full bg-[#F093B0]" style={{ width: '75%' }}></div>
                            </div>
                        )}
                    </div>
                    {!isGuest && (
                        <button onClick={() => onNavigate(Screen.ProfileEdit)} className="h-8 px-4 rounded-lg bg-white/20 border border-white/30 text-[#4F7ABA] text-sm font-bold">
                            편집
                        </button>
                    )}
                    {isGuest && (
                        <button onClick={() => onNavigate('SIGNUP' as any)} className="h-8 px-4 rounded-lg bg-[#F093B0] text-white text-sm font-bold">
                            회원가입
                        </button>
                    )}
                </div>

                {/* Guest Limit Info */}
                {isGuest && (
                    <div className="bg-[#FFF5F7] border border-[#FFE0E6] rounded-2xl p-4">
                        <p className="text-sm font-bold text-[#F093B0] mb-2">🎁 게스트 체험 중</p>
                        <p className="text-xs text-[#8B95A1] mb-3">
                            남은 대화 횟수: {Math.max(0, 3 - parseInt(localStorage.getItem('guestChatCount') || '0'))}/3회
                        </p>
                        <button 
                            onClick={() => onNavigate('SIGNUP' as any)}
                            className="w-full h-10 bg-[#F093B0] text-white rounded-lg font-bold text-sm"
                        >
                            회원가입하고 모든 기능 사용하기
                        </button>
                    </div>
                )}

                {/* Learning Settings */}
                <SectionContainer title="학습 설정">
                    <SettingItem icon="📚" title="학습 목표 설정" onClick={() => onNavigate(Screen.LearningGoals)} rightComponent={<><span className="text-sm font-medium">일 3회 대화</span><ChevronRightIcon className="w-4 h-4" /></>} />
                    <SettingItem icon="🎯" title="관심 분야 수정" onClick={() => onNavigate(Screen.ProfileEdit)} rightComponent={<><span className="text-sm font-medium">게임, 영화 외 3개</span><ChevronRightIcon className="w-4 h-4" /></>} />
                    <SettingItem icon="⏰" title="연습 시간 알림" rightComponent={<TossToggle value={practiceNotification} onToggle={() => setPracticeNotification(v => !v)} />} />
                </SectionContainer>
                
                {/* App Settings */}
                <SectionContainer title="앱 설정">
                    <SettingItem icon="🔔" title="알림 설정" onClick={() => onNavigate(Screen.NotificationSettings)} rightComponent={<><span className="text-sm font-medium">모두 허용</span><ChevronRightIcon className="w-4 h-4" /></>} />
                    <SettingItem icon="🌙" title="다크 모드" rightComponent={<TossToggle value={darkMode} onToggle={() => setDarkMode(v => !v)} />} />
                </SectionContainer>

                 {/* Data Management */}
                <SectionContainer title="데이터 관리">
                    <SettingItem icon="📤" title="데이터 내보내기" onClick={() => onNavigate(Screen.DataExport)} rightComponent={<ChevronRightIcon className="w-4 h-4" />} />
                </SectionContainer>
                
                {/* Customer Support */}
                <SectionContainer title="고객 지원">
                    <SettingItem icon="❓" title="도움말" onClick={() => {}} rightComponent={<ChevronRightIcon className="w-4 h-4" />} />
                    <SettingItem icon="📞" title="고객센터 문의" onClick={() => {}} rightComponent={<ChevronRightIcon className="w-4 h-4" />} />
                    <SettingItem icon="⭐" title="앱 평가하기" onClick={() => {}} rightComponent={<ChevronRightIcon className="w-4 h-4" />} />
                    <SettingItem icon="📄" title="버전 정보" rightComponent={<span className="text-sm font-medium">v1.2.3</span>} />
                </SectionContainer>
                
                {/* Danger Zone */}
                <SectionContainer>
                    <SettingItem icon="🚪" title="로그아웃" {...(onLogout ? { onClick: onLogout } : {})} dangerous rightComponent={<></>} />
                    <SettingItem icon="❌" title="회원 탈퇴" subtitle="모든 데이터가 삭제됩니다" onClick={() => onNavigate(Screen.DeleteAccount)} dangerous rightComponent={<></>} />
                </SectionContainer>

                {/* Dev Only Section */}
                <SectionContainer title="개발자용" className="pb-4">
                    <SettingItem icon="🎨" title="디자인 가이드" onClick={() => onNavigate(Screen.DesignGuide)} rightComponent={<ChevronRightIcon className="w-4 h-4" />} />
                </SectionContainer>
            </main>
        </div>
    );
};

export { MyTabScreen };
export default MyTabScreen;
