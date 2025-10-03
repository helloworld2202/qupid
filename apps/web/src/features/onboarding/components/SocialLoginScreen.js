import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@qupid/ui';
const SocialLoginScreen = ({ onBack, onSuccess, progress }) => {
    const [socialUrls, setSocialUrls] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        fetchSocialLoginUrls();
    }, []);
    const fetchSocialLoginUrls = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
            const response = await fetch(`${API_URL}/auth/social/urls`);
            const data = await response.json();
            if (data.success) {
                setSocialUrls(data.data);
            }
        }
        catch (error) {
            console.error('Failed to fetch social login URLs:', error);
        }
    };
    const handleSocialLogin = (provider, url) => {
        setLoading(true);
        // 온보딩 플로우임을 표시
        localStorage.setItem('isOnboardingFlow', 'true');
        window.location.href = url;
    };
    return (_jsxs("div", { className: "flex flex-col h-full w-full animate-fade-in p-6", children: [_jsxs("header", { className: "absolute top-4 left-6 right-6 h-14 flex items-center justify-between z-10", children: [_jsx("button", { onClick: onBack, className: "p-2 -ml-2", children: _jsx(ArrowLeftIcon, { className: "w-6 h-6 text-[#8B95A1]" }) }), _jsx("div", { className: "flex items-center space-x-2", children: Array.from({ length: 5 }).map((_, i) => (_jsx("div", { className: `rounded-full transition-all duration-300 ${i < progress ? 'w-2.5 h-2.5 bg-[#F093B0]' : 'w-2 h-2 bg-[#E5E8EB]'}` }, i))) }), _jsx("div", { className: "w-10" })] }), _jsxs("main", { className: "flex-1 flex flex-col justify-center -mt-14", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsxs("h1", { className: "text-3xl font-bold leading-tight text-[#191F28] mb-4", children: ["\uAC04\uD3B8\uD558\uAC8C", _jsx("br", {}), _jsx("span", { className: "text-[#F093B0]", children: "\uC2DC\uC791\uD558\uAE30" })] }), _jsxs("p", { className: "text-lg text-[#8B95A1]", children: ["\uC18C\uC15C \uACC4\uC815\uC73C\uB85C \uBE60\uB974\uAC8C \uAC00\uC785\uD558\uACE0", _jsx("br", {}), "\uC5F0\uC560 \uCF54\uCE6D\uC744 \uC2DC\uC791\uD574\uBCF4\uC138\uC694"] })] }), _jsx("div", { className: "space-y-4", children: !socialUrls ? (
                        // 로딩 상태
                        _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "h-16 bg-gray-200 rounded-xl animate-pulse" }), _jsx("div", { className: "h-16 bg-gray-200 rounded-xl animate-pulse" }), _jsx("div", { className: "h-16 bg-gray-200 rounded-xl animate-pulse" })] })) : (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => handleSocialLogin('kakao', socialUrls.kakao), disabled: loading, className: "w-full h-16 bg-[#FEE500] hover:bg-[#FDD835] disabled:bg-[#F5F5F5] rounded-xl flex items-center justify-center space-x-4 transition-all shadow-sm", children: [_jsx("div", { className: "w-8 h-8 bg-black rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-white text-lg font-bold", children: "K" }) }), _jsx("span", { className: "text-black font-bold text-lg", children: loading ? '연결 중...' : '카카오로 계속하기' })] }), _jsxs("button", { onClick: () => handleSocialLogin('naver', socialUrls.naver), disabled: loading, className: "w-full h-16 bg-[#03C75A] hover:bg-[#02B351] disabled:bg-[#F5F5F5] rounded-xl flex items-center justify-center space-x-4 transition-all shadow-sm", children: [_jsx("div", { className: "w-8 h-8 bg-white rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-[#03C75A] text-lg font-bold", children: "N" }) }), _jsx("span", { className: "text-white font-bold text-lg", children: loading ? '연결 중...' : '네이버로 계속하기' })] }), _jsxs("button", { onClick: () => handleSocialLogin('google', socialUrls.google), disabled: loading, className: "w-full h-16 bg-white hover:bg-gray-50 disabled:bg-[#F5F5F5] border-2 border-[#E5E8EB] rounded-xl flex items-center justify-center space-x-4 transition-all shadow-sm", children: [_jsx("div", { className: "w-8 h-8", children: _jsxs("svg", { viewBox: "0 0 24 24", className: "w-8 h-8", children: [_jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), _jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), _jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), _jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })] }) }), _jsx("span", { className: "text-[#191F28] font-bold text-lg", children: loading ? '연결 중...' : '구글로 계속하기' })] })] })) }), _jsx("div", { className: "mt-8 text-center", children: _jsxs("p", { className: "text-sm text-[#8B95A1]", children: ["\uB85C\uADF8\uC778 \uC2DC ", _jsx("span", { className: "underline", children: "\uC774\uC6A9\uC57D\uAD00" }), " \uBC0F ", _jsx("span", { className: "underline", children: "\uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68" }), "\uC5D0 \uB3D9\uC758\uD558\uAC8C \uB429\uB2C8\uB2E4."] }) })] })] }));
};
export default SocialLoginScreen;
