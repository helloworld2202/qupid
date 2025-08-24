
import React, { useState } from 'react';
import { UserProfile } from '@qupid/core';
import { ChevronRightIcon } from '@qupid/ui';
import { useUpdateProfile } from '../../../shared/hooks/useUpdateProfile';
import { useUserStore } from '../../../shared/stores/userStore';

interface ProfileEditScreenProps {
  userProfile: UserProfile;
  onBack: () => void;
  onSave?: (profile: UserProfile) => void;
}

const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ userProfile, onBack, onSave }) => {
    const { user, setUser } = useUserStore();
    const updateProfileMutation = useUpdateProfile();
    
    // 기본값 설정
    const defaultProfile: UserProfile = {
        name: '사용자',
        user_gender: 'male',
        partner_gender: 'female',
        interests: [],
        experience: '없음',
        confidence: 3,
        difficulty: 2
    };
    
    const profile = userProfile || user || defaultProfile;
    
    const [nickname, setNickname] = useState(profile.name);
    const [experience, setExperience] = useState(profile.experience || '없음');
    const [interests, setInterests] = useState<string[]>(profile.interests || []);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [showExperienceModal, setShowExperienceModal] = useState(false);
    const [showInterestModal, setShowInterestModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const initialNickname = profile.name;
    const hasChanges = nickname !== initialNickname || 
                      experience !== profile.experience || 
                      JSON.stringify(interests) !== JSON.stringify(profile.interests);
    
    const initial = profile.name.charAt(0).toUpperCase();

    return (
        <div className="flex flex-col h-full w-full bg-white">
            <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-[#F2F4F6]">
                <button onClick={onBack} className="px-2 text-base font-medium text-[#191F28]">취소</button>
                <h1 className="text-xl font-bold text-[#191F28]">프로필 편집</h1>
                <button 
                    onClick={async () => {
                        if (hasChanges) {
                            setIsLoading(true);
                            try {
                                const updates = {
                                    name: nickname,
                                    experience,
                                    interests
                                };
                                
                                if (user?.id && !user.isGuest) {
                                    // 서버에 업데이트
                                    const updatedProfile = await updateProfileMutation.mutateAsync({
                                        userId: user.id,
                                        updates
                                    });
                                    setUser(updatedProfile);
                                } else if (onSave) {
                                    // 게스트는 로컬만 업데이트
                                    onSave({ ...profile, ...updates });
                                }
                            } catch (error) {
                                console.error('Failed to update profile:', error);
                            } finally {
                                setIsLoading(false);
                                onBack();
                            }
                        } else {
                            onBack();
                        }
                    }}
                    disabled={!hasChanges || isLoading}
                    className="px-2 text-base font-bold disabled:text-[#D1D6DB] text-[#F093B0]"
                >
                    {isLoading ? '저장 중...' : '완료'}
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                {/* Profile Picture */}
                <div className="flex justify-center items-center mt-8">
                    <div className="relative">
                        <div 
                            className="w-[120px] h-[120px] rounded-full bg-[#FDF2F8] border-2 border-[#F093B0] flex items-center justify-center text-6xl font-bold text-[#F093B0]"
                        >
                            {initial}
                        </div>
                        <button 
                            onClick={() => setShowActionSheet(true)}
                            className="absolute bottom-0 right-0 w-9 h-9 bg-[#F093B0] rounded-full flex items-center justify-center border-2 border-white"
                        >
                            <span className="text-base">✏️</span>
                        </button>
                    </div>
                </div>

                {/* Basic Info Form */}
                <div className="mt-10 space-y-6">
                    <div>
                        <label className="text-base font-bold text-[#191F28]">닉네임</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            maxLength={10}
                            className="mt-2 w-full h-14 px-4 bg-[#F9FAFB] border border-[#E5E8EB] rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-[#F093B0]"
                        />
                        <p className="mt-2 text-sm text-[#8B95A1]">다른 사용자에게 표시되는 이름이에요. ( {nickname.length} / 10 )</p>
                    </div>
                    <div>
                        <label className="text-base font-bold text-[#191F28]">나이</label>
                        <div className="mt-2 w-full h-14 px-4 bg-[#F9FAFB] border border-[#E5E8EB] rounded-xl flex items-center justify-between">
                            <span className="text-lg">28세</span>
                            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                     <div>
                        <label className="text-base font-bold text-[#191F28]">거주 지역</label>
                        <div className="mt-2 w-full h-14 px-4 bg-[#F9FAFB] border border-[#E5E8EB] rounded-xl flex items-center justify-between">
                            <span className="text-lg">서울특별시</span>
                             <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Learning Info Section */}
                <div className="mt-10">
                    <h3 className="text-lg font-bold">학습 정보</h3>
                    <div className="mt-4 space-y-4">
                        <button 
                            onClick={() => setShowExperienceModal(true)}
                            className="flex justify-between items-center w-full"
                        >
                            <p className="text-base font-medium">연애 경험</p>
                            <p className="text-base font-medium text-[#8B95A1]">{experience} <ChevronRightIcon className="inline w-4 h-4" /></p>
                        </button>
                        <div className="flex justify-between items-center">
                            <p className="text-base font-medium">학습 목표</p>
                            <p className="text-base font-medium text-[#8B95A1]">{profile.difficulty} <ChevronRightIcon className="inline w-4 h-4" /></p>
                        </div>
                         <div className="flex flex-col items-start">
                            <p className="text-base font-medium">관심 분야</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {interests && interests.length > 0 ? (
                                    interests.map((interest: string) => (
                                        <span key={interest} className="px-3 py-1.5 bg-[#EBF2FF] text-[#4F7ABA] text-sm font-medium rounded-full">
                                            {interest.replace(/^(?:. )/, '#')}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-[#8B95A1]">관심사를 추가해주세요</span>
                                )}
                                <button 
                                    onClick={() => setShowInterestModal(true)}
                                    className="px-3 py-1.5 bg-gray-200 text-gray-600 text-sm font-medium rounded-full"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
             <footer className="p-4 bg-white border-t border-[#F2F4F6]">
                <button
                    onClick={async () => {
                        if (hasChanges) {
                            setIsLoading(true);
                            try {
                                const updates = {
                                    name: nickname,
                                    experience,
                                    interests
                                };
                                
                                if (user?.id && !user.isGuest) {
                                    // 서버에 업데이트
                                    const updatedProfile = await updateProfileMutation.mutateAsync({
                                        userId: user.id,
                                        updates
                                    });
                                    setUser(updatedProfile);
                                } else if (onSave) {
                                    // 게스트는 로컬만 업데이트
                                    onSave({ ...profile, ...updates });
                                }
                            } catch (error) {
                                console.error('Failed to update profile:', error);
                            } finally {
                                setIsLoading(false);
                                onBack();
                            }
                        } else {
                            onBack();
                        }
                    }}
                    disabled={!hasChanges || isLoading}
                    className="w-full h-14 text-white text-lg font-bold rounded-xl transition-colors duration-300 disabled:bg-[#D1D6DB]"
                    style={{ backgroundColor: hasChanges && !isLoading ? '#F093B0' : '#D1D6DB' }}
                >
                    완료
                </button>
            </footer>

            {/* 연애 경험 선택 모달 */}
            {showExperienceModal && (
                <div className="absolute inset-0 bg-black/40 flex justify-center items-center animate-fade-in" onClick={() => setShowExperienceModal(false)}>
                    <div className="w-[90%] max-w-sm bg-white rounded-2xl p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-center mb-4">연애 경험 선택</h3>
                        <div className="space-y-2">
                            {['없음', '1-2번', '3-5번', '5번 이상'].map(exp => (
                                <button
                                    key={exp}
                                    onClick={() => {
                                        setExperience(exp);
                                        setShowExperienceModal(false);
                                    }}
                                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                                        experience === exp 
                                            ? 'bg-[#F093B0] text-white' 
                                            : 'bg-[#F9FAFB] text-[#191F28] hover:bg-[#F2F4F6]'
                                    }`}
                                >
                                    {exp}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 관심사 선택 모달 */}
            {showInterestModal && (
                <div className="absolute inset-0 bg-black/40 flex justify-center items-center animate-fade-in" onClick={() => setShowInterestModal(false)}>
                    <div className="w-[90%] max-w-sm bg-white rounded-2xl p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-center mb-4">관심사 선택</h3>
                        <div className="space-y-2">
                            {['영화', '음악', '여행', '운동', '요리', '독서', '게임', '예술'].map(interest => (
                                <button
                                    key={interest}
                                    onClick={() => {
                                        if (interests.includes(interest)) {
                                            setInterests(interests.filter(i => i !== interest));
                                        } else {
                                            setInterests([...interests, interest]);
                                        }
                                    }}
                                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                                        interests.includes(interest)
                                            ? 'bg-[#F093B0] text-white' 
                                            : 'bg-[#F9FAFB] text-[#191F28] hover:bg-[#F2F4F6]'
                                    }`}
                                >
                                    {interest} {interests.includes(interest) && '✓'}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowInterestModal(false)}
                            className="w-full mt-4 py-3 bg-[#191F28] text-white rounded-lg font-bold"
                        >
                            완료
                        </button>
                    </div>
                </div>
            )}

            {/* Action Sheet Modal */}
            {showActionSheet && (
                <div className="absolute inset-0 bg-black/40 flex justify-center items-end animate-fade-in" onClick={() => setShowActionSheet(false)}>
                    <div className="w-full bg-white rounded-t-2xl p-4 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <button className="w-full text-center text-lg py-3 text-blue-500">카메라로 촬영</button>
                        <div className="h-px bg-gray-200"></div>
                        <button className="w-full text-center text-lg py-3 text-blue-500">갤러리에서 선택</button>
                        <div className="h-px bg-gray-200"></div>
                        <button className="w-full text-center text-lg py-3 text-red-500">기본 이미지로 변경</button>
                        <button onClick={() => setShowActionSheet(false)} className="w-full mt-2 text-center text-lg py-3 bg-gray-100 rounded-lg font-bold text-blue-500">취소</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export { ProfileEditScreen };
export default ProfileEditScreen;
