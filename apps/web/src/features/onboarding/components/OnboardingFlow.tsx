

import React, { useState, useCallback } from 'react';
import { ArrowLeftIcon, CheckIcon } from '@qupid/ui';
import { UserProfile } from '@qupid/core';
import { useCreateUserProfile } from '../../../shared/hooks/api/useUser';
import { useAppStore } from '../../../shared/stores/useAppStore';
import SocialLoginScreen from './SocialLoginScreen';

const TOTAL_ONBOARDING_STEPS = 5;

// --- Reusable Components ---
const ProgressIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="flex items-center justify-center space-x-2">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`rounded-full transition-all duration-300 ${i < current ? 'w-2.5 h-2.5 bg-[#F093B0]' : 'w-2 h-2 bg-[#E5E8EB]'}`}
      />
    ))}
  </div>
);

const OnboardingHeader: React.FC<{ onBack?: () => void; progress: number; title?: string; questionNumber?: string }> = ({ onBack, progress, title, questionNumber }) => (
    <div className="absolute top-0 left-0 right-0 px-4 pt-4 z-10">
        <div className="h-14 flex items-center justify-between">
            <div className="w-10">
                {onBack && (
                <button onClick={onBack} className="p-2 -ml-2">
                    <ArrowLeftIcon className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
                </button>
                )}
            </div>
            <ProgressIndicator total={TOTAL_ONBOARDING_STEPS} current={progress} />
            <div className="w-10"></div>
        </div>
        {title && 
            <div className="mt-4">
                {questionNumber && <p className="text-lg font-bold text-[#F093B0]">{questionNumber}</p>}
                <h1 className="text-3xl font-bold leading-tight text-[#191F28]">{title}</h1>
            </div>
        }
    </div>
);


const FixedBottomButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode }> = ({ onClick, disabled, children }) => (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white" style={{boxShadow: '0 -10px 30px -10px rgba(0,0,0,0.05)'}}>
        <button
            onClick={onClick}
            disabled={disabled}
            className="w-full h-14 text-white text-lg font-bold rounded-xl transition-colors duration-300 disabled:bg-[#F2F4F6] disabled:text-[#8B95A1]"
            style={{ backgroundColor: disabled ? undefined : 'var(--primary-pink-main)' }}
        >
            {children}
        </button>
    </div>
);

const CheckableCard: React.FC<{icon?: string; title: string; subtitle?: string; checked: boolean; onClick: () => void;}> = ({icon, title, subtitle, checked, onClick}) => (
     <button onClick={onClick}
        className={`w-full p-5 flex items-center border-2 rounded-2xl transition-all duration-200 text-left ${checked ? 'border-[#F093B0] bg-[#FDF2F8] scale-[1.01]' : 'border-[#E5E8EB] bg-white'}`}>
        {icon && <div className="text-3xl mr-4">{icon}</div>}
        <div className="flex-1">
            <p className="text-xl font-bold" style={{color: '#191F28'}}>{title}</p>
            {subtitle && <p className="text-base mt-1" style={{color: '#8B95A1'}}>{subtitle}</p>}
        </div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${checked ? 'bg-[#F093B0] border-[#F093B0]' : 'border-[#E5E8EB]'}`}>
            {checked && <CheckIcon className="w-4 h-4 text-white" />}
        </div>
    </button>
)

type NewUserProfile = Omit<UserProfile, 'id' | 'created_at' | 'isTutorialCompleted'>;
const initialProfile: NewUserProfile = { name: '준호', user_gender: 'male', experience: '없음', confidence: 3, difficulty: 2, interests: [] };

// --- Onboarding Screens ---
const IntroScreen: React.FC<{ onNext: () => void; progress: number }> = ({ onNext, progress }) => {
    console.log('IntroScreen rendered with progress:', progress);
    return (
      <div className="flex flex-col h-full w-full animate-fade-in p-6">
        <header className="absolute top-4 left-6 right-6 h-14 flex items-center justify-center z-10">
             <ProgressIndicator total={TOTAL_ONBOARDING_STEPS} current={progress} />
        </header>
        <main className="flex-1 flex flex-col justify-center -mt-14">
          <h1 className="text-3xl font-bold leading-tight animate-scale-in text-[#191F28]">
            <span className="text-[#F093B0]">3개월 후,</span><br/>
            자신 있게 대화하는<br/>
            당신을 만나보세요
          </h1>
          <div className="mt-10 space-y-4">
            {['AI와 무제한 대화 연습', '실시간 대화 실력 분석', '실제 이성과 안전한 매칭'].map((text, i) => (
                 <div key={text} className="flex items-center opacity-0 animate-fade-in-up" style={{animationDelay: `${i*100 + 200}ms`, animationFillMode: 'forwards'}}>
                    <span className="text-lg mr-3 text-[#0AC5A8]">✓</span>
                    <p className="text-lg font-medium text-[#191F28]">{text}</p>
                </div>
            ))}
          </div>
        </main>
        <FixedBottomButton onClick={() => {
            console.log('무료로 시작하기 버튼 클릭됨!');
            onNext();
        }}>
            🚀 테스트 버튼 🚀
        </FixedBottomButton>
      </div>
    );
}

const GenderSelectionScreen: React.FC<{ onNext: (gender: 'male' | 'female') => void; onBack: () => void; progress: number; }> = ({ onNext, onBack, progress }) => {
    const [selected, setSelected] = useState<'male' | 'female' | null>(null);
    return (
        <div className="flex flex-col h-full w-full animate-fade-in p-6">
            <OnboardingHeader onBack={onBack} progress={progress} />
            <main className="flex-1 flex flex-col pt-24">
                <h1 className="text-[28px] font-bold" style={{color: '#191F28'}}>어떤 이성과 대화 연습할까요?</h1>
                <p className="text-base mt-2" style={{color: '#8B95A1'}}>선택하신 성별에 따라 맞춤 AI를 추천해드려요</p>
                <div className="mt-10 space-y-4">
                     <CheckableCard icon="👨" title="남성" subtitle="여성 AI와 대화 연습을 해요" checked={selected === 'male'} onClick={() => setSelected('male')} />
                     <CheckableCard icon="👩" title="여성" subtitle="남성 AI와 대화 연습을 해요" checked={selected === 'female'} onClick={() => setSelected('female')} />
                </div>
            </main>
            <FixedBottomButton onClick={() => selected && onNext(selected)} disabled={!selected}>
                {selected ? "다음 단계로" : "성별을 선택해주세요"}
            </FixedBottomButton>
        </div>
    );
};

const SurveyScreen: React.FC<{
  onComplete: (field: keyof NewUserProfile, value: string) => void;
  onBack: () => void;
  question: string;
  description: string;
  options: { icon?: string, title: string, subtitle: string }[];
  field: keyof NewUserProfile;
  progress: number;
}> = ({ onComplete, onBack, question, description, options, field, progress }) => {
    const handleSelect = (value: string) => {
        setTimeout(() => onComplete(field, value), 300);
    };
    return (
        <div className="flex flex-col h-full w-full animate-fade-in p-6">
             <OnboardingHeader onBack={onBack} progress={progress} />
             <main className="flex-1 flex flex-col pt-24">
                <h1 className="text-3xl font-bold leading-tight text-[#191F28]">{question}</h1>
                <p className="text-base mt-2 text-[#8B95A1]">{description}</p>
                <div className="mt-8 space-y-3">
                    {options.map(opt => (
                        <CheckableCard 
                          key={opt.title} 
                          {...(opt.icon ? { icon: opt.icon } : {})}
                          title={opt.title} 
                          {...(opt.subtitle ? { subtitle: opt.subtitle } : {})}
                          checked={false} 
                          onClick={() => handleSelect(opt.title)} 
                        />
                    ))}
                </div>
             </main>
        </div>
    );
};


const InterestsScreen: React.FC<{ onComplete: (interests: string[]) => void; onBack: () => void; progress: number; }> = ({ onComplete, onBack, progress }) => {
    const INTERESTS = [ "🎮 게임", "🎬 영화/드라마", "💪 운동/헬스", "✈️ 여행", "🍕 맛집/요리", "📚 독서", "🎵 음악", "🎨 예술/문화", "📱 IT/테크", "🐕 반려동물", "☕ 카페투어", "📷 사진" ];
    const [selected, setSelected] = useState<string[]>([]);

    const toggleInterest = (interest: string) => {
        setSelected(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : prev.length < 5 ? [...prev, interest] : prev);
    };
    
    return (
        <div className="flex flex-col h-full w-full animate-fade-in p-6">
            <OnboardingHeader onBack={onBack} progress={progress} />
            <main className="flex-1 flex flex-col pt-24">
                <h1 className="text-3xl font-bold leading-tight text-[#191F28]">평소 관심 있는<br/>분야를 선택해주세요</h1>
                <p className="text-base mt-2 text-[#8B95A1]">공통 관심사로 대화 주제를 추천해드려요 (최소 1개, 최대 5개)</p>
                <div className="mt-8 flex flex-wrap gap-x-2 gap-y-3">
                    {INTERESTS.map(interest => {
                        const isSelected = selected.includes(interest);
                        return (
                            <button key={interest} onClick={() => toggleInterest(interest)} className={`h-12 px-4 flex items-center justify-center rounded-full transition-all duration-200 border text-base font-medium ${isSelected ? 'bg-[#FDF2F8] border-2 border-[#F093B0] text-[#DB7093]' : 'bg-[#F9FAFB] border-[#E5E8EB] text-[#191F28]'}`}>
                                {isSelected && <span className="mr-1.5">✓</span>}
                                {interest}
                            </button>
                        )
                    })}
                </div>
            </main>
            <FixedBottomButton onClick={() => onComplete(selected)} disabled={selected.length === 0}>
                {selected.length > 0 ? "설문 완료하기" : "관심사를 1개 이상 선택해주세요"}
            </FixedBottomButton>
        </div>
    );
};

const CompletionScreen: React.FC<{ onComplete: () => void; profile: NewUserProfile; progress: number; }> = ({ onComplete, profile, progress }) => {
    const partnerGender = profile.user_gender === 'male' ? '여성 AI' : '남성 AI';
    return (
        <div className="flex flex-col h-full w-full animate-fade-in p-6">
             <OnboardingHeader progress={progress} />
             <main className="flex-1 flex flex-col justify-center -mt-14">
                <div className="w-32 h-32 rounded-full bg-[#F093B0] flex items-center justify-center animate-scale-in self-center">
                    <CheckIcon className="w-16 h-16 text-white" />
                </div>
                <h1 className="mt-8 text-[28px] font-bold text-center" style={{color: '#191F28'}}>당신의 프로필이<br/>완성됐어요!</h1>
                <div className="mt-6 p-6 bg-[#F9FAFB] rounded-2xl border border-[#E5E8EB]">
                    <ul className="space-y-3">
                        <li className="flex justify-between"><span className="font-bold">성별</span><span>{profile.user_gender === 'male' ? '남성' : '여성'} ({partnerGender}와 연습)</span></li>
                        <li className="flex justify-between"><span className="font-bold">경험</span><span>{profile.experience}</span></li>
                        <li className="flex justify-between"><span className="font-bold">관심사</span><span className="truncate ml-4">{profile.interests.map((i: string) => i.split(' ')[1]).join(', ')}</span></li>
                    </ul>
                </div>
             </main>
             <FixedBottomButton onClick={onComplete}>첫 대화 시작하기</FixedBottomButton>
        </div>
    );
}

export const OnboardingFlow: React.FC<{ onComplete: (profile: NewUserProfile) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<NewUserProfile>(initialProfile);
  const createUser = useCreateUserProfile();
  const { setCurrentUserId } = useAppStore();

  // 디버깅을 위한 로그
  console.log('OnboardingFlow rendered, current step:', step);

  // 소셜 로그인으로 온 경우 성별 선택 화면부터 시작
  React.useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken && step === 0) {
      // 소셜 로그인으로 온 경우 사용자 정보 가져오기
      fetchUserProfile();
      setStep(2); // 소셜 로그인 화면을 건너뛰고 성별 선택으로
    }
  }, [step]);

  const fetchUserProfile = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return;

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
      const response = await fetch(`${API_URL}/auth/session`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.user) {
          // 소셜 로그인 사용자 정보로 프로필 업데이트
          const socialProfile = {
            name: data.data.user.user_metadata?.name || data.data.user.email?.split('@')[0] || '사용자',
            user_gender: 'male' as 'male' | 'female', // 기본값, 사용자가 선택할 수 있도록
            experience: '없음',
            confidence: 3,
            difficulty: 2,
            interests: []
          };
          setProfile(socialProfile);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const nextStep = useCallback(() => {
    console.log('nextStep 호출됨, 현재 step:', step);
    setStep(s => {
      console.log('step 변경:', s, '->', s + 1);
      return s + 1;
    });
  }, [step]);
  const prevStep = useCallback(() => setStep(s => s > 0 ? s - 1 : 0), []);
  
  const handleFinalComplete = useCallback(async () => {
    try {
      // Create user in database
      const userProfile: Partial<UserProfile> = {
        name: '사용자',
        user_gender: profile.user_gender,
        partner_gender: profile.user_gender === 'male' ? 'female' : 'male',
        experience: profile.experience,
        confidence: profile.experience === '전혈 없어요' ? 2 : 
                    profile.experience === '1-2번 정도' ? 3 :
                    profile.experience === '몇 번 있어요' ? 4 : 5,
        difficulty: profile.experience === '전혈 없어요' ? 1 : 
                   profile.experience === '1-2번 정도' ? 2 :
                   profile.experience === '몇 번 있어요' ? 3 : 4,
        interests: profile.interests.map((i: string) => i.split(' ')[1] || i),
        isTutorialCompleted: false
      };
      
      const result = await createUser.mutateAsync(userProfile);
      if (result?.id) {
        setCurrentUserId(result.id);
      }
    } catch (error) {
      console.error('Failed to create user profile:', error);
    }
    
    onComplete(profile);
  }, [createUser, onComplete, profile, setCurrentUserId]);

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setProfile(p => ({ ...p, user_gender: gender }));
    nextStep();
  };

  const handleSurveyComplete = (field: keyof NewUserProfile, value: string) => {
    setProfile(p => ({...p, [field]: value}));
    nextStep();
  };
  
  const handleInterestComplete = (interests: string[]) => {
      setProfile(p => ({...p, interests}));
      nextStep();
  }

  const renderStep = () => {
    const currentProgress = step + 1;
    console.log('renderStep 호출됨, step:', step, 'currentProgress:', currentProgress);
    switch (step) {
      case 0: return <IntroScreen onNext={nextStep} progress={currentProgress} />;
      case 1: return <SocialLoginScreen onBack={prevStep} onSuccess={nextStep} progress={currentProgress} />;
      case 2: return <GenderSelectionScreen onNext={handleGenderSelect} onBack={prevStep} progress={currentProgress} />;
      case 3: return <SurveyScreen 
                        onComplete={handleSurveyComplete} 
                        onBack={prevStep} 
                        progress={currentProgress}
                        question={"이성과의 연애 경험이\n어느 정도인가요?"}
                        description="경험에 맞는 적절한 난이도로 시작해드려요"
                        options={[
                            {icon: '😅', title: '전혀 없어요', subtitle: '처음이라 긴장돼요'},
                            {icon: '🤷‍♂️', title: '1-2번 정도', subtitle: '경험은 있지만 어색해요'},
                            {icon: '😊', title: '몇 번 있어요', subtitle: '기본은 할 수 있어요'},
                            {icon: '😎', title: '많은 편이에요', subtitle: '더 나은 소통을 원해요'}
                        ]}
                        field="experience"
                    />;
       case 4: return <InterestsScreen onComplete={handleInterestComplete} onBack={prevStep} progress={currentProgress} />;
       case 5: 
          // Completion screen
          return <CompletionScreen onComplete={handleFinalComplete} profile={profile} progress={TOTAL_ONBOARDING_STEPS} />;
      default: return <IntroScreen onNext={nextStep} progress={1} />;
    }
  };
  
  // The flow now completes after the Interests screen (step 3)
  if (step === TOTAL_ONBOARDING_STEPS) {
      return (
        <div className="h-full w-full flex items-center justify-center relative bg-white">
          <CompletionScreen onComplete={handleFinalComplete} profile={profile} progress={TOTAL_ONBOARDING_STEPS} />
        </div>
      );
  }

  return (
    <div className="h-full w-full flex items-center justify-center relative bg-white">
      {renderStep()}
    </div>
  );
};
