import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Screen } from '@qupid/core';
import { ArrowLeftIcon } from '@qupid/ui';
import SocialLoginButtons from './SocialLoginButtons';
const SignupScreen = ({ onNavigate, onSignupSuccess }) => {
    const [step, setStep] = useState(1); // 1: 기본정보, 2: 성별선택
    // 게스트 데이터가 있으면 가져오기
    const guestGender = localStorage.getItem('guestGender') || '';
    const guestPartnerGender = localStorage.getItem('guestPartnerGender') || '';
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
        name: '',
        user_gender: guestGender || '',
        partner_gender: guestPartnerGender || '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const handleNext = () => {
        if (step === 1) {
            // 기본 정보 검증
            if (!formData.email || !formData.password || !formData.name) {
                setError('모든 필드를 입력해주세요.');
                return;
            }
            if (formData.password !== formData.passwordConfirm) {
                setError('비밀번호가 일치하지 않습니다.');
                return;
            }
            if (formData.password.length < 6) {
                setError('비밀번호는 최소 6자 이상이어야 합니다.');
                return;
            }
            setError('');
            setStep(2);
        }
    };
    const handleSignup = async () => {
        setError('');
        setIsLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    user_gender: formData.user_gender,
                    partner_gender: formData.partner_gender,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || '회원가입에 실패했습니다.');
            }
            // 회원가입 성공
            if (data.data.session) {
                localStorage.setItem('authToken', data.data.session.access_token);
                localStorage.setItem('refreshToken', data.data.session.refresh_token);
                localStorage.setItem('userId', data.data.user.id);
            }
            // 프로필 저장
            if (data.data.profile) {
                localStorage.setItem('userProfile', JSON.stringify(data.data.profile));
                // 게스트 데이터 정리
                localStorage.removeItem('guestId');
                localStorage.removeItem('guestGender');
                localStorage.removeItem('guestPartnerGender');
                localStorage.removeItem('guestExperience');
                localStorage.removeItem('guestConfidence');
                localStorage.removeItem('guestDifficulty');
                localStorage.removeItem('guestInterests');
                localStorage.removeItem('guestTutorialCompleted');
                localStorage.removeItem('guestChatCount');
                localStorage.removeItem('hasCompletedOnboarding');
                // 게스트가 이미 튜토리얼을 완료했다면 홈으로
                const guestTutorialCompleted = localStorage.getItem('guestTutorialCompleted') === 'true';
                if (data.data.profile.is_tutorial_completed || guestTutorialCompleted) {
                    onSignupSuccess(data.data);
                    onNavigate('HOME');
                }
                else {
                    onSignupSuccess(data.data);
                    onNavigate(Screen.TutorialIntro);
                }
            }
            else {
                onSignupSuccess(data.data);
                onNavigate('ONBOARDING'); // 온보딩으로 이동
            }
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsLoading(false);
        }
    };
    const isStep1Valid = formData.email && formData.password && formData.passwordConfirm && formData.name;
    const isStep2Valid = formData.user_gender && formData.partner_gender;
    return (_jsxs("div", { className: "min-h-screen bg-[#F9FAFB] flex flex-col", children: [_jsxs("header", { className: "bg-white px-6 py-4 border-b border-[#E5E8EB] flex items-center", children: [_jsx("button", { onClick: () => step === 2 ? setStep(1) : onNavigate('LOGIN'), className: "mr-4", children: _jsx(ArrowLeftIcon, { className: "w-6 h-6 text-[#8B95A1]" }) }), _jsx("h1", { className: "text-2xl font-bold text-[#191F28]", children: "\uD68C\uC6D0\uAC00\uC785" })] }), _jsxs("div", { className: "px-6 pt-6", children: [_jsxs("div", { className: "flex space-x-2", children: [_jsx("div", { className: `flex-1 h-1 rounded-full ${step >= 1 ? 'bg-[#F093B0]' : 'bg-[#E5E8EB]'}` }), _jsx("div", { className: `flex-1 h-1 rounded-full ${step >= 2 ? 'bg-[#F093B0]' : 'bg-[#E5E8EB]'}` })] }), _jsx("p", { className: "text-sm text-[#8B95A1] mt-2", children: step === 1 ? '기본 정보 입력' : '성별 선택' })] }), _jsxs("main", { className: "flex-1 px-6 py-6", children: [step === 1 ? (
                    // Step 1: 기본 정보
                    _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-[#191F28] mb-2", children: "\uC774\uB984" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "\uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694", className: "w-full h-14 px-4 rounded-xl border border-[#E5E8EB] focus:border-[#F093B0] focus:outline-none text-base" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-[#191F28] mb-2", children: "\uC774\uBA54\uC77C" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), placeholder: "\uC774\uBA54\uC77C\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694", className: "w-full h-14 px-4 rounded-xl border border-[#E5E8EB] focus:border-[#F093B0] focus:outline-none text-base" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-[#191F28] mb-2", children: "\uBE44\uBC00\uBC88\uD638" }), _jsx("input", { type: "password", value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }), placeholder: "6\uC790 \uC774\uC0C1 \uC785\uB825\uD574\uC8FC\uC138\uC694", className: "w-full h-14 px-4 rounded-xl border border-[#E5E8EB] focus:border-[#F093B0] focus:outline-none text-base" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-[#191F28] mb-2", children: "\uBE44\uBC00\uBC88\uD638 \uD655\uC778" }), _jsx("input", { type: "password", value: formData.passwordConfirm, onChange: (e) => setFormData({ ...formData, passwordConfirm: e.target.value }), placeholder: "\uBE44\uBC00\uBC88\uD638\uB97C \uB2E4\uC2DC \uC785\uB825\uD574\uC8FC\uC138\uC694", className: "w-full h-14 px-4 rounded-xl border border-[#E5E8EB] focus:border-[#F093B0] focus:outline-none text-base" })] })] })) : (
                    // Step 2: 성별 선택
                    _jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-[#191F28] mb-4", children: "\uB2F9\uC2E0\uC758 \uC131\uBCC4\uC740?" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("button", { onClick: () => setFormData({ ...formData, user_gender: 'male' }), className: `p-6 rounded-2xl border-2 transition-all ${formData.user_gender === 'male'
                                                    ? 'border-[#F093B0] bg-[#FDF2F8]'
                                                    : 'border-[#E5E8EB] bg-white'}`, children: [_jsx("p", { className: "text-3xl mb-2", children: "\uD83D\uDC68" }), _jsx("p", { className: "font-bold text-[#191F28]", children: "\uB0A8\uC131" })] }), _jsxs("button", { onClick: () => setFormData({ ...formData, user_gender: 'female' }), className: `p-6 rounded-2xl border-2 transition-all ${formData.user_gender === 'female'
                                                    ? 'border-[#F093B0] bg-[#FDF2F8]'
                                                    : 'border-[#E5E8EB] bg-white'}`, children: [_jsx("p", { className: "text-3xl mb-2", children: "\uD83D\uDC69" }), _jsx("p", { className: "font-bold text-[#191F28]", children: "\uC5EC\uC131" })] })] })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-[#191F28] mb-4", children: "\uB300\uD654 \uC5F0\uC2B5\uC744 \uC6D0\uD558\uB294 \uC0C1\uB300 \uC131\uBCC4\uC740?" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("button", { onClick: () => setFormData({ ...formData, partner_gender: 'male' }), className: `p-6 rounded-2xl border-2 transition-all ${formData.partner_gender === 'male'
                                                    ? 'border-[#F093B0] bg-[#FDF2F8]'
                                                    : 'border-[#E5E8EB] bg-white'}`, children: [_jsx("p", { className: "text-3xl mb-2", children: "\uD83D\uDC68" }), _jsx("p", { className: "font-bold text-[#191F28]", children: "\uB0A8\uC131" })] }), _jsxs("button", { onClick: () => setFormData({ ...formData, partner_gender: 'female' }), className: `p-6 rounded-2xl border-2 transition-all ${formData.partner_gender === 'female'
                                                    ? 'border-[#F093B0] bg-[#FDF2F8]'
                                                    : 'border-[#E5E8EB] bg-white'}`, children: [_jsx("p", { className: "text-3xl mb-2", children: "\uD83D\uDC69" }), _jsx("p", { className: "font-bold text-[#191F28]", children: "\uC5EC\uC131" })] })] })] })] })), error && (_jsx("div", { className: "mt-4 p-3 bg-red-50 border border-red-200 rounded-lg", children: _jsx("p", { className: "text-sm text-red-600", children: error }) })), _jsxs("div", { className: "my-8 flex items-center", children: [_jsx("div", { className: "flex-1 h-px bg-[#E5E8EB]" }), _jsx("span", { className: "px-4 text-sm text-[#8B95A1]", children: "\uB610\uB294" }), _jsx("div", { className: "flex-1 h-px bg-[#E5E8EB]" })] }), _jsx(SocialLoginButtons, {})] }), _jsx("div", { className: "px-6 pb-8", children: _jsx("button", { onClick: step === 1 ? handleNext : handleSignup, disabled: (step === 1 ? !isStep1Valid : !isStep2Valid) || isLoading, className: `w-full h-14 rounded-full font-bold text-lg transition-all ${(step === 1 ? isStep1Valid : isStep2Valid) && !isLoading
                        ? 'bg-[#F093B0] text-white'
                        : 'bg-[#E5E8EB] text-[#8B95A1]'}`, children: isLoading ? '처리 중...' : step === 1 ? '다음' : '회원가입 완료' }) })] }));
};
export { SignupScreen };
export default SignupScreen;
