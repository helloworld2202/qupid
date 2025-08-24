import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Screen } from '@qupid/core';
const LoginScreen = ({ onNavigate, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || '로그인에 실패했습니다.');
            }
            // 로그인 성공
            localStorage.setItem('authToken', data.data.session.access_token);
            localStorage.setItem('refreshToken', data.data.session.refresh_token);
            localStorage.setItem('userId', data.data.user.id);
            // 프로필 저장
            if (data.data.profile) {
                localStorage.setItem('userProfile', JSON.stringify(data.data.profile));
                // 튜토리얼 완료 여부 확인
                if (!data.data.profile.is_tutorial_completed) {
                    onLoginSuccess(data.data);
                    onNavigate(Screen.TutorialIntro); // 튜토리얼로 이동
                }
                else {
                    onLoginSuccess(data.data);
                    onNavigate('HOME');
                }
            }
            else {
                onLoginSuccess(data.data);
                onNavigate('HOME');
            }
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsLoading(false);
        }
    };
    const isFormValid = email.length > 0 && password.length >= 6;
    return (_jsxs("div", { className: "min-h-screen bg-[#F9FAFB] flex flex-col", children: [_jsx("header", { className: "bg-white px-6 py-4 border-b border-[#E5E8EB]", children: _jsx("h1", { className: "text-2xl font-bold text-[#191F28]", children: "\uB85C\uADF8\uC778" }) }), _jsxs("main", { className: "flex-1 px-6 py-8", children: [_jsxs("form", { onSubmit: handleLogin, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-[#191F28] mb-2", children: "\uC774\uBA54\uC77C" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "\uC774\uBA54\uC77C\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694", className: "w-full h-14 px-4 rounded-xl border border-[#E5E8EB] focus:border-[#F093B0] focus:outline-none text-base", disabled: isLoading })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-[#191F28] mb-2", children: "\uBE44\uBC00\uBC88\uD638" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694", className: "w-full h-14 px-4 rounded-xl border border-[#E5E8EB] focus:border-[#F093B0] focus:outline-none text-base", disabled: isLoading })] }), error && (_jsx("div", { className: "p-3 bg-red-50 border border-red-200 rounded-lg", children: _jsx("p", { className: "text-sm text-red-600", children: error }) })), _jsx("button", { type: "submit", disabled: !isFormValid || isLoading, className: `w-full h-14 rounded-full font-bold text-lg transition-all ${isFormValid && !isLoading
                                    ? 'bg-[#F093B0] text-white'
                                    : 'bg-[#E5E8EB] text-[#8B95A1]'}`, children: isLoading ? '로그인 중...' : '로그인' })] }), _jsxs("div", { className: "my-8 flex items-center", children: [_jsx("div", { className: "flex-1 h-px bg-[#E5E8EB]" }), _jsx("span", { className: "px-4 text-sm text-[#8B95A1]", children: "\uB610\uB294" }), _jsx("div", { className: "flex-1 h-px bg-[#E5E8EB]" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-[#8B95A1] mb-3", children: "\uC544\uC9C1 \uACC4\uC815\uC774 \uC5C6\uC73C\uC2E0\uAC00\uC694?" }), _jsx("button", { onClick: () => onNavigate('SIGNUP'), className: "text-[#4F7ABA] font-bold", disabled: isLoading, children: "\uD68C\uC6D0\uAC00\uC785\uD558\uAE30" })] }), _jsx("div", { className: "mt-6 text-center", children: _jsx("button", { onClick: () => onNavigate('RESET_PASSWORD'), className: "text-sm text-[#8B95A1] underline", disabled: isLoading, children: "\uBE44\uBC00\uBC88\uD638\uB97C \uC78A\uC73C\uC168\uB098\uC694?" }) })] })] }));
};
export { LoginScreen };
export default LoginScreen;
