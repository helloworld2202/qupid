
import React, { useState } from 'react';
import { UserProfile } from '@qupid/core';
import { ChevronRightIcon } from '@qupid/ui';

interface ProfileEditScreenProps {
  userProfile: UserProfile;
  onBack: () => void;
}

const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ userProfile, onBack }) => {
    const [nickname, setNickname] = useState(userProfile.name);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const initialNickname = userProfile.name;
    const hasChanges = nickname !== initialNickname;
    
    const initial = userProfile.name.charAt(0).toUpperCase();

    return (
        <div className="flex flex-col h-full w-full bg-white">
            <header className="flex-shrink-0 flex items-center justify-between p-3 border-b border-[#F2F4F6]">
                <button onClick={onBack} className="px-2 text-base font-medium text-[#191F28]">취소</button>
                <h1 className="text-xl font-bold text-[#191F28]">프로필 편집</h1>
                <button 
                    onClick={onBack} 
                    disabled={!hasChanges}
                    className="px-2 text-base font-bold disabled:text-[#D1D6DB] text-[#F093B0]"
                >
                    완료
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
                        <div className="flex justify-between items-center">
                            <p className="text-base font-medium">연애 경험</p>
                            <p className="text-base font-medium text-[#8B95A1]">{userProfile.experience} <ChevronRightIcon className="inline w-4 h-4" /></p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-base font-medium">학습 목표</p>
                            <p className="text-base font-medium text-[#8B95A1]">{userProfile.difficulty} <ChevronRightIcon className="inline w-4 h-4" /></p>
                        </div>
                         <div className="flex flex-col items-start">
                            <p className="text-base font-medium">관심 분야</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {userProfile.interests.map(interest => (
                                    <span key={interest} className="px-3 py-1.5 bg-[#EBF2FF] text-[#4F7ABA] text-sm font-medium rounded-full">
                                        {interest.replace(/^(?:. )/, '#')}
                                    </span>
                                ))}
                                <button className="px-3 py-1.5 bg-gray-200 text-gray-600 text-sm font-medium rounded-full">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
             <footer className="p-4 bg-white border-t border-[#F2F4F6]">
                <button
                    onClick={onBack}
                    disabled={!hasChanges}
                    className="w-full h-14 text-white text-lg font-bold rounded-xl transition-colors duration-300 disabled:bg-[#D1D6DB]"
                    style={{ backgroundColor: hasChanges ? '#F093B0' : '#D1D6DB' }}
                >
                    완료
                </button>
            </footer>

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
