
import React, { useState } from 'react';
import { UserProfile, Screen } from '@qupid/core';
import { ArrowLeftIcon, ChevronRightIcon } from '@qupid/ui';

interface SettingsScreenProps {
  onNavigate: (screen: Screen | string) => void;
  onBack: () => void;
  onLogout?: () => void;
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
  onClick: () => void;
  dangerous?: boolean;
  isLast?: boolean;
}> = ({ icon, title, subtitle, rightComponent, onClick, dangerous = false, isLast = false }) => (
    <button onClick={onClick} className={`flex items-center w-full h-[56px] px-5 ${isLast ? '' : 'border-b border-[#F2F4F6]'}`}>
        <div className="flex items-center flex-1">
            <span className="text-2xl w-6 text-center">{icon}</span>
            <div className="ml-4 text-left">
                <p className={`text-base font-medium ${dangerous ? 'text-[var(--error-red)]' : 'text-[#191F28]'}`}>{title}</p>
                {subtitle && <p className="text-sm text-[#8B95A1]">{subtitle}</p>}
            </div>
        </div>
        <div className="flex items-center space-x-2 text-[#8B95A1]">
            {rightComponent}
        </div>
    </button>
);

const SectionContainer: React.FC<{ title?: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={`mt-4 ${className}`}>
        {title && <h3 className="px-5 pb-1 text-lg font-bold text-[#191F28]">{title}</h3>}
        <div className="bg-white rounded-2xl border border-[#F2F4F6] overflow-hidden">
            {children}
        </div>
    </div>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate, onBack, onLogout }) => {
    // localStorage에서 사용자 정보 가져오기
    const storedProfile = localStorage.getItem('userProfile');
    const userProfile = storedProfile ? JSON.parse(storedProfile) : { name: '사용자', user_gender: 'female' } as UserProfile;
    const [practiceNotification, setPracticeNotification] = useState(true);
    const [analysisDisplay, setAnalysisDisplay] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [soundEffects, setSoundEffects] = useState(true);
    const [hapticFeedback, setHapticFeedback] = useState(true);

    const initial = userProfile.name.charAt(0).toUpperCase();

    return (
        <div className="flex flex-col h-full w-full bg-[#F9FAFB]">
            <header className="flex-shrink-0 flex items-center justify-between p-3 bg-white">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeftIcon className="w-6 h-6 text-[#191F28]" />
                </button>
                <h1 className="text-xl font-bold text-[#191F28]">설정</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto p-4">
                {/* Profile Card */}
                <div 
                    className="h-[120px] rounded-2xl p-5 flex items-center text-white" 
                    style={{ background: 'linear-gradient(135deg, #FDF2F8, #EBF2FF)' }}
                >
                    <div className="w-16 h-16 rounded-full bg-[#F093B0] flex items-center justify-center text-white text-3xl font-bold">
                        {initial}
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="font-bold text-xl text-[#191F28]">{userProfile.name}</p>
                        <p className="font-medium text-sm text-[#8B95A1]">Level 3 · 대화 중급자</p>
                        <div className="mt-1.5 h-1 w-full bg-white/30 rounded-full">
                            <div className="h-1 rounded-full bg-[#F093B0]" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                    <button onClick={() => onNavigate(Screen.ProfileEdit)} className="h-8 px-4 rounded-lg bg-white/20 border border-white/30 text-[#4F7ABA] text-sm font-bold">
                        편집
                    </button>
                </div>

                {/* Learning Settings */}
                <SectionContainer>
                    <SettingItem icon="📚" title="학습 목표 설정" onClick={() => onNavigate(Screen.LearningGoals)} rightComponent={<><span className="text-base font-medium">일 3회 대화</span><ChevronRightIcon className="w-4 h-4" /></>} />
                    <SettingItem icon="🎯" title="관심 분야 수정" onClick={() => onNavigate(Screen.ProfileEdit)} rightComponent={<><span className="text-base font-medium">게임, 영화 외 3개</span><ChevronRightIcon className="w-4 h-4" /></>} />
                    <SettingItem icon="⏰" title="연습 시간 알림" onClick={() => {}} rightComponent={<TossToggle value={practiceNotification} onToggle={() => setPracticeNotification(v => !v)} />} />
                    <SettingItem icon="📊" title="실시간 분석 표시" onClick={() => {}} rightComponent={<TossToggle value={analysisDisplay} onToggle={() => setAnalysisDisplay(v => !v)} />} isLast />
                </SectionContainer>
                
                {/* Personal Info */}
                <SectionContainer title="개인 정보">
                    <SettingItem icon="👤" title="프로필 수정" onClick={() => onNavigate(Screen.ProfileEdit)} rightComponent={<ChevronRightIcon className="w-4 h-4" />} />
                    <SettingItem icon="🚻" title="성별 변경" onClick={() => {}} rightComponent={<><span className="text-base font-medium">{userProfile.user_gender === 'male' ? '남성' : '여성'}</span><ChevronRightIcon className="w-4 h-4" /></>} />
                    <SettingItem icon="📝" title="초기 설문 다시하기" onClick={() => {}} rightComponent={<ChevronRightIcon className="w-4 h-4" />} />
                    <SettingItem icon="🔐" title="개인정보 처리방침" onClick={() => {}} rightComponent={<ChevronRightIcon className="w-4 h-4" />} isLast />
                </SectionContainer>
                
                {/* App Settings */}
                <SectionContainer title="앱 설정">
                    <SettingItem icon="🔔" title="알림 설정" onClick={() => onNavigate(Screen.NotificationSettings)} rightComponent={<><span className="text-base font-medium">모두 허용</span><ChevronRightIcon className="w-4 h-4" /></>} />
                    <SettingItem icon="🌙" title="다크 모드" onClick={() => {}} rightComponent={<TossToggle value={darkMode} onToggle={() => setDarkMode(v => !v)} />} />
                    <SettingItem icon="🔊" title="사운드 효과" onClick={() => {}} rightComponent={<TossToggle value={soundEffects} onToggle={() => setSoundEffects(v => !v)} />} />
                    <SettingItem icon="📱" title="햅틱 피드백" onClick={() => {}} rightComponent={<TossToggle value={hapticFeedback} onToggle={() => setHapticFeedback(v => !v)} />} />
                    <SettingItem icon="🌐" title="언어 설정" onClick={() => {}} rightComponent={<><span className="text-base font-medium">한국어</span><ChevronRightIcon className="w-4 h-4" /></>} isLast />
                </SectionContainer>
                
                {/* Data Management */}
                <SectionContainer title="데이터 관리">
                    <SettingItem icon="📈" title="내 데이터 보기" subtitle="대화 기록, 분석 결과 등" onClick={() => {}} rightComponent={<ChevronRightIcon className="w-4 h-4" />} />
                    <SettingItem icon="📤" title="데이터 내보내기" subtitle="Excel, PDF로 다운로드" onClick={() => onNavigate(Screen.DataExport)} rightComponent={<ChevronRightIcon className="w-4 h-4" />} />
                    <SettingItem icon="🗑️" title="대화 기록 삭제" subtitle="선택적 또는 전체 삭제" onClick={() => {}} rightComponent={<ChevronRightIcon className="w-4 h-4" />} />
                    <SettingItem icon="☁️" title="백업 설정" onClick={() => {}} rightComponent={<><span className="text-base font-medium">자동 백업 ON</span><ChevronRightIcon className="w-4 h-4" /></>} isLast />
                </SectionContainer>
                
                {/* Customer Support */}
                <SectionContainer title="고객 지원">
                    <SettingItem icon="❓" title="도움말" onClick={() => {}} rightComponent={<ChevronRightIcon className="w-4 h-4" />} />
                    <SettingItem icon="📞" title="고객센터 문의" onClick={() => {}} rightComponent={<ChevronRightIcon className="w-4 h-4" />} />
                    <SettingItem icon="⭐" title="앱 평가하기" onClick={() => {}} rightComponent={<ChevronRightIcon className="w-4 h-4" />} />
                    <SettingItem icon="📄" title="버전 정보" onClick={() => {}} rightComponent={<span className="text-base font-medium">v1.2.3</span>} isLast />
                </SectionContainer>
                
                {/* Danger Zone */}
                <div className="mt-8">
                     <SectionContainer>
                        <SettingItem 
                            icon="🚪" 
                            title="로그아웃" 
                            onClick={() => {
                                if (onLogout) {
                                    onLogout();
                                } else {
                                    // 기본 로그아웃 처리
                                    localStorage.removeItem('authToken');
                                    localStorage.removeItem('refreshToken');
                                    localStorage.removeItem('userId');
                                    localStorage.removeItem('userProfile');
                                    window.location.href = '/';
                                }
                            }} 
                            dangerous 
                            rightComponent={<ChevronRightIcon className="w-4 h-4" />} 
                        />
                        <SettingItem icon="❌" title="회원 탈퇴" subtitle="모든 데이터가 삭제됩니다" onClick={() => onNavigate(Screen.DeleteAccount)} dangerous rightComponent={<ChevronRightIcon className="w-4 h-4" />} isLast />
                    </SectionContainer>
                </div>
            </main>
        </div>
    );
};

export { SettingsScreen };
export default SettingsScreen;
