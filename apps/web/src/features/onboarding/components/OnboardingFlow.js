import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { ArrowLeftIcon, CheckIcon } from '@qupid/ui';
import { useCreateUserProfile } from '../../../shared/hooks/api/useUser';
import { useAppStore } from '../../../shared/stores/useAppStore';
import { useGeneratePersona } from '../../../shared/hooks/usePersonaGeneration';
// import SocialLoginScreen from './SocialLoginScreen'; // 소셜 로그인 기능 임시 비활성화
const TOTAL_ONBOARDING_STEPS = 4;
// --- Reusable Components ---
const ProgressIndicator = ({ current, total }) => (_jsx("div", { className: "flex items-center justify-center space-x-2", children: Array.from({ length: total }).map((_, i) => (_jsx("div", { className: `rounded-full transition-all duration-300 ${i < current ? 'w-2.5 h-2.5 bg-[#F093B0]' : 'w-2 h-2 bg-[#E5E8EB]'}` }, i))) }));
const OnboardingHeader = ({ onBack, progress, title, questionNumber }) => (_jsxs("div", { className: "absolute top-0 left-0 right-0 px-4 pt-4 z-10", children: [_jsxs("div", { className: "h-14 flex items-center justify-between", children: [_jsx("div", { className: "w-10", children: onBack && (_jsx("button", { onClick: onBack, className: "p-2 -ml-2", children: _jsx(ArrowLeftIcon, { className: "w-6 h-6", style: { color: 'var(--text-secondary)' } }) })) }), _jsx(ProgressIndicator, { total: TOTAL_ONBOARDING_STEPS, current: progress }), _jsx("div", { className: "w-10" })] }), title &&
            _jsxs("div", { className: "mt-4", children: [questionNumber && _jsx("p", { className: "text-lg font-bold text-[#F093B0]", children: questionNumber }), _jsx("h1", { className: "text-3xl font-bold leading-tight text-[#191F28]", children: title })] })] }));
const FixedBottomButton = ({ onClick, disabled, children }) => (_jsx("div", { className: "absolute bottom-0 left-0 right-0 p-4 bg-white", style: { boxShadow: '0 -10px 30px -10px rgba(0,0,0,0.05)' }, children: _jsx("button", { onClick: onClick, disabled: disabled, className: "w-full h-14 text-white text-lg font-bold rounded-xl transition-colors duration-300 disabled:bg-[#F2F4F6] disabled:text-[#8B95A1]", style: { backgroundColor: disabled ? undefined : 'var(--primary-pink-main)' }, children: children }) }));
const CheckableCard = ({ icon, title, subtitle, checked, onClick }) => (_jsxs("button", { onClick: onClick, className: `w-full p-5 flex items-center border-2 rounded-2xl transition-all duration-200 text-left ${checked ? 'border-[#F093B0] bg-[#FDF2F8] scale-[1.01]' : 'border-[#E5E8EB] bg-white'}`, children: [icon && _jsx("div", { className: "text-3xl mr-4", children: icon }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xl font-bold", style: { color: '#191F28' }, children: title }), subtitle && _jsx("p", { className: "text-base mt-1", style: { color: '#8B95A1' }, children: subtitle })] }), _jsx("div", { className: `w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${checked ? 'bg-[#F093B0] border-[#F093B0]' : 'border-[#E5E8EB]'}`, children: checked && _jsx(CheckIcon, { className: "w-4 h-4 text-white" }) })] }));
const initialProfile = { name: '준호', user_gender: 'male', experience: '없음', confidence: 3, difficulty: 2, interests: [] };
// --- Onboarding Screens ---
const IntroScreen = ({ onNext, progress }) => {
    console.log('IntroScreen rendered with progress:', progress);
    return (_jsxs("div", { className: "flex flex-col h-full w-full animate-fade-in p-6", children: [_jsx("header", { className: "absolute top-4 left-6 right-6 h-14 flex items-center justify-center z-10", children: _jsx(ProgressIndicator, { total: TOTAL_ONBOARDING_STEPS, current: progress }) }), _jsxs("main", { className: "flex-1 flex flex-col justify-center -mt-14", children: [_jsxs("h1", { className: "text-3xl font-bold leading-tight animate-scale-in text-[#191F28]", children: [_jsx("span", { className: "text-[#F093B0]", children: "3\uAC1C\uC6D4 \uD6C4," }), _jsx("br", {}), "\uC790\uC2E0 \uC788\uAC8C \uB300\uD654\uD558\uB294", _jsx("br", {}), "\uB2F9\uC2E0\uC744 \uB9CC\uB098\uBCF4\uC138\uC694"] }), _jsx("div", { className: "mt-10 space-y-4", children: ['AI와 무제한 대화 연습', '실시간 대화 실력 분석', '실제 이성과 안전한 매칭'].map((text, i) => (_jsxs("div", { className: "flex items-center opacity-0 animate-fade-in-up", style: { animationDelay: `${i * 100 + 200}ms`, animationFillMode: 'forwards' }, children: [_jsx("span", { className: "text-lg mr-3 text-[#0AC5A8]", children: "\u2713" }), _jsx("p", { className: "text-lg font-medium text-[#191F28]", children: text })] }, text))) })] }), _jsx(FixedBottomButton, { onClick: () => {
                    console.log('무료로 시작하기 버튼 클릭됨!');
                    onNext();
                }, children: "\uBB34\uB8CC\uB85C \uC2DC\uC791\uD558\uAE30" })] }));
};
const GenderSelectionScreen = ({ onNext, onBack, progress }) => {
    const [selected, setSelected] = useState(null);
    return (_jsxs("div", { className: "flex flex-col h-full w-full animate-fade-in p-6", children: [_jsx(OnboardingHeader, { onBack: onBack, progress: progress }), _jsxs("main", { className: "flex-1 flex flex-col pt-24", children: [_jsx("h1", { className: "text-[28px] font-bold", style: { color: '#191F28' }, children: "\uBCF8\uC778\uC758 \uC131\uBCC4\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694" }), _jsx("p", { className: "text-base mt-2", style: { color: '#8B95A1' }, children: "\uC131\uBCC4\uC5D0 \uB530\uB77C \uB9DE\uCDA4 AI\uB97C \uCD94\uCC9C\uD574\uB4DC\uB824\uC694" }), _jsxs("div", { className: "mt-10 space-y-4", children: [_jsx(CheckableCard, { icon: "\uD83D\uDC68", title: "\uB0A8\uC131", subtitle: "\uB0A8\uC131\uC73C\uB85C \uC120\uD0DD\uD558\uC2DC\uBA74 \uC5EC\uC131 AI\uC640 \uB300\uD654 \uC5F0\uC2B5\uD574\uC694", checked: selected === 'male', onClick: () => setSelected('male') }), _jsx(CheckableCard, { icon: "\uD83D\uDC69", title: "\uC5EC\uC131", subtitle: "\uC5EC\uC131\uC73C\uB85C \uC120\uD0DD\uD558\uC2DC\uBA74 \uB0A8\uC131 AI\uC640 \uB300\uD654 \uC5F0\uC2B5\uD574\uC694", checked: selected === 'female', onClick: () => setSelected('female') })] })] }), _jsx(FixedBottomButton, { onClick: () => selected && onNext(selected), disabled: !selected, children: selected ? "다음 단계로" : "성별을 선택해주세요" })] }));
};
const SurveyScreen = ({ onComplete, onBack, question, description, options, field, progress }) => {
    const [selectedValue, setSelectedValue] = useState('');
    const handleSelect = (value) => {
        setSelectedValue(value);
        setTimeout(() => onComplete(field, value), 300);
    };
    return (_jsxs("div", { className: "flex flex-col h-full w-full animate-fade-in p-6", children: [_jsx(OnboardingHeader, { onBack: onBack, progress: progress }), _jsxs("main", { className: "flex-1 flex flex-col pt-24", children: [_jsx("h1", { className: "text-3xl font-bold leading-tight text-[#191F28]", children: question }), _jsx("p", { className: "text-base mt-2 text-[#8B95A1]", children: description }), _jsx("div", { className: "mt-8 space-y-3", children: options.map(opt => (_jsx(CheckableCard, { ...(opt.icon ? { icon: opt.icon } : {}), title: opt.title, ...(opt.subtitle ? { subtitle: opt.subtitle } : {}), checked: selectedValue === opt.title, onClick: () => handleSelect(opt.title) }, opt.title))) })] })] }));
};
const InterestsScreen = ({ onComplete, onBack, progress }) => {
    const INTERESTS = ["🎮 게임", "🎬 영화/드라마", "💪 운동/헬스", "✈️ 여행", "🍕 맛집/요리", "📚 독서", "🎵 음악", "🎨 예술/문화", "📱 IT/테크", "🐕 반려동물", "☕ 카페투어", "📷 사진"];
    const [selected, setSelected] = useState([]);
    const toggleInterest = (interest) => {
        setSelected(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : prev.length < 5 ? [...prev, interest] : prev);
    };
    return (_jsxs("div", { className: "flex flex-col h-full w-full animate-fade-in p-6", children: [_jsx(OnboardingHeader, { onBack: onBack, progress: progress }), _jsxs("main", { className: "flex-1 flex flex-col pt-24", children: [_jsxs("h1", { className: "text-3xl font-bold leading-tight text-[#191F28]", children: ["\uD3C9\uC18C \uAD00\uC2EC \uC788\uB294", _jsx("br", {}), "\uBD84\uC57C\uB97C \uC120\uD0DD\uD574\uC8FC\uC138\uC694"] }), _jsx("p", { className: "text-base mt-2 text-[#8B95A1]", children: "\uACF5\uD1B5 \uAD00\uC2EC\uC0AC\uB85C \uB300\uD654 \uC8FC\uC81C\uB97C \uCD94\uCC9C\uD574\uB4DC\uB824\uC694 (\uCD5C\uC18C 1\uAC1C, \uCD5C\uB300 5\uAC1C)" }), _jsx("div", { className: "mt-8 flex flex-wrap gap-x-2 gap-y-3", children: INTERESTS.map(interest => {
                            const isSelected = selected.includes(interest);
                            return (_jsxs("button", { onClick: () => toggleInterest(interest), className: `h-12 px-4 flex items-center justify-center rounded-full transition-all duration-200 border text-base font-medium ${isSelected ? 'bg-[#FDF2F8] border-2 border-[#F093B0] text-[#DB7093]' : 'bg-[#F9FAFB] border-[#E5E8EB] text-[#191F28]'}`, children: [isSelected && _jsx("span", { className: "mr-1.5", children: "\u2713" }), interest] }, interest));
                        }) })] }), _jsx(FixedBottomButton, { onClick: () => onComplete(selected), disabled: selected.length === 0, children: selected.length > 0 ? "설문 완료하기" : "관심사를 1개 이상 선택해주세요" })] }));
};
const CompletionScreen = ({ onComplete, profile, progress }) => {
    const partnerGender = profile.user_gender === 'male' ? '여성 AI' : '남성 AI';
    return (_jsxs("div", { className: "flex flex-col h-full w-full animate-fade-in p-6", children: [_jsx(OnboardingHeader, { progress: progress }), _jsxs("main", { className: "flex-1 flex flex-col justify-center -mt-14", children: [_jsx("div", { className: "w-32 h-32 rounded-full bg-[#F093B0] flex items-center justify-center animate-scale-in self-center", children: _jsx(CheckIcon, { className: "w-16 h-16 text-white" }) }), _jsxs("h1", { className: "mt-8 text-[28px] font-bold text-center", style: { color: '#191F28' }, children: ["\uB2F9\uC2E0\uC758 \uD504\uB85C\uD544\uC774", _jsx("br", {}), "\uC644\uC131\uB410\uC5B4\uC694!"] }), _jsx("div", { className: "mt-6 p-6 bg-[#F9FAFB] rounded-2xl border border-[#E5E8EB]", children: _jsxs("ul", { className: "space-y-3", children: [_jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "font-bold", children: "\uC131\uBCC4" }), _jsxs("span", { children: [profile.user_gender === 'male' ? '남성' : '여성', " (", partnerGender, "\uC640 \uC5F0\uC2B5)"] })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "font-bold", children: "\uACBD\uD5D8" }), _jsx("span", { children: profile.experience })] }), _jsxs("li", { className: "flex justify-between", children: [_jsx("span", { className: "font-bold", children: "\uAD00\uC2EC\uC0AC" }), _jsx("span", { className: "truncate ml-4", children: profile.interests.map((i) => i.split(' ')[1]).join(', ') })] })] }) })] }), _jsx(FixedBottomButton, { onClick: onComplete, children: "\uCCAB \uB300\uD654 \uC2DC\uC791\uD558\uAE30" })] }));
};
export const OnboardingFlow = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [profile, setProfile] = useState(initialProfile);
    const createUser = useCreateUserProfile();
    const generatePersona = useGeneratePersona();
    const { setCurrentUserId } = useAppStore();
    // 디버깅을 위한 로그
    console.log('OnboardingFlow rendered, current step:', step);
    // 소셜 로그인 관련 코드 제거됨
    // fetchUserProfile 함수 제거됨 (소셜 로그인 관련)
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
            const userProfile = {
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
                interests: profile.interests.map((i) => i.split(' ')[1] || i),
                isTutorialCompleted: false
            };
            let tutorialPersona = null;
            const result = await createUser.mutateAsync(userProfile);
            if (result?.id) {
                setCurrentUserId(result.id);
                // 관심사 기반 자동 AI 프로필 생성 (API 사용)
                tutorialPersona = await generateTutorialPersona(profile);
            }
            // API 생성 실패하거나 DB가 없으면, constants에서 첫 번째 페르소나 사용
            if (!tutorialPersona) {
                const { PREDEFINED_PERSONAS } = await import('@qupid/core');
                const partnerGender = profile.user_gender === 'male' ? 'female' : 'male';
                tutorialPersona = PREDEFINED_PERSONAS.find(p => p.gender === partnerGender) || PREDEFINED_PERSONAS[0];
            }
            // 튜토리얼 페르소나와 함께 onComplete 호출
            onComplete(profile, tutorialPersona);
        }
        catch (error) {
            console.error('Failed to create user profile:', error);
            // 완전 실패 시에도 constants에서 페르소나 가져와서 진행
            const { PREDEFINED_PERSONAS } = await import('@qupid/core');
            const partnerGender = profile.user_gender === 'male' ? 'female' : 'male';
            const fallbackPersona = PREDEFINED_PERSONAS.find(p => p.gender === partnerGender) || PREDEFINED_PERSONAS[0];
            onComplete(profile, fallbackPersona);
        }
    }, [createUser, onComplete, profile, setCurrentUserId, generatePersona]);
    // 관심사 기반 튜토리얼 페르소나 생성 함수 (API 사용)
    const generateTutorialPersona = async (profile) => {
        try {
            const interests = profile.interests.map((i) => i.split(' ')[1] || i);
            const persona = await generatePersona.mutateAsync({
                userGender: profile.user_gender,
                userInterests: interests,
                isTutorial: true
            });
            return persona;
        }
        catch (error) {
            console.error('페르소나 생성 실패, 기본 페르소나 사용:', error);
            // API 실패 시 기본 페르소나 반환
            const partnerGender = profile.user_gender === 'male' ? 'female' : 'male';
            const interests = profile.interests.map((i) => i.split(' ')[1] || i);
            return {
                id: 'tutorial-persona-1',
                name: partnerGender === 'female' ? '김서현' : '박지훈',
                age: 25,
                gender: partnerGender,
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                personality: partnerGender === 'female' ? 'ENFP' : 'ISFJ',
                occupation: partnerGender === 'female' ? '초등학교 교사' : '소프트웨어 개발자',
                education: '대학 졸업',
                location: '서울 강남구',
                height: partnerGender === 'female' ? '160-165cm' : '175-180cm',
                bodyType: '보통',
                interests: interests.slice(0, 3),
                values: ['가정 지향', '성장 지향'],
                communicationStyle: partnerGender === 'female' ? '감성적, 공감적' : '논리적, 신중함',
                datingStyle: partnerGender === 'female' ? '로맨틱' : '현실적',
                appearanceStyle: partnerGender === 'female' ? '내추럴' : '캐주얼',
                speechPattern: partnerGender === 'female' ? '따뜻한 말투, 이모티콘 자주 사용' : '친근한 말투, 신중함',
                lifestyle: partnerGender === 'female' ? '밖돌이, 사교적' : '집순이, 독립적',
                specialNotes: ['커피 좋아함', '음악 특기'],
                bigFiveScores: {
                    openness: 7,
                    conscientiousness: 6,
                    extraversion: partnerGender === 'female' ? 8 : 4,
                    agreeableness: 8,
                    neuroticism: 3
                },
                conversationStyle: partnerGender === 'female'
                    ? '따뜻하고 격려하는 말투로 대화하는 교사입니다. 공감 능력이 높고 자연스러운 대화를 좋아해요.'
                    : '신중하고 배려심 깊은 개발자입니다. 진지한 대화를 선호하며 상대방을 잘 들어주는 편이에요.',
                isTutorial: true
            };
        }
    };
    const handleGenderSelect = (gender) => {
        setProfile(p => ({ ...p, user_gender: gender }));
        nextStep();
    };
    const handleSurveyComplete = (field, value) => {
        setProfile(p => ({ ...p, [field]: value }));
        nextStep();
    };
    const handleInterestComplete = (interests) => {
        setProfile(p => ({ ...p, interests }));
        nextStep();
    };
    const renderStep = () => {
        const currentProgress = step + 1;
        console.log('renderStep 호출됨, step:', step, 'currentProgress:', currentProgress);
        switch (step) {
            case 0: return _jsx(IntroScreen, { onNext: nextStep, progress: currentProgress });
            case 1: return _jsx(GenderSelectionScreen, { onNext: handleGenderSelect, onBack: prevStep, progress: currentProgress });
            case 2: return _jsx(SurveyScreen, { onComplete: handleSurveyComplete, onBack: prevStep, progress: currentProgress, question: "이성과의 연애 경험이\n어느 정도인가요?", description: "\uACBD\uD5D8\uC5D0 \uB9DE\uB294 \uC801\uC808\uD55C \uB09C\uC774\uB3C4\uB85C \uC2DC\uC791\uD574\uB4DC\uB824\uC694", options: [
                    { icon: '😅', title: '전혀 없어요', subtitle: '처음이라 긴장돼요' },
                    { icon: '🤷‍♂️', title: '1-2번 정도', subtitle: '경험은 있지만 어색해요' },
                    { icon: '😊', title: '몇 번 있어요', subtitle: '기본은 할 수 있어요' },
                    { icon: '😎', title: '많은 편이에요', subtitle: '더 나은 소통을 원해요' }
                ], field: "experience" });
            case 3: return _jsx(InterestsScreen, { onComplete: handleInterestComplete, onBack: prevStep, progress: currentProgress });
            case 4:
                // Completion screen
                return _jsx(CompletionScreen, { onComplete: handleFinalComplete, profile: profile, progress: TOTAL_ONBOARDING_STEPS });
            default: return _jsx(IntroScreen, { onNext: nextStep, progress: 1 });
        }
    };
    // The flow now completes after the Interests screen (step 3)
    if (step === TOTAL_ONBOARDING_STEPS) {
        return (_jsx("div", { className: "h-full w-full flex items-center justify-center relative bg-white", children: _jsx(CompletionScreen, { onComplete: handleFinalComplete, profile: profile, progress: TOTAL_ONBOARDING_STEPS }) }));
    }
    return (_jsx("div", { className: "h-full w-full flex items-center justify-center relative bg-white", children: renderStep() }));
};
