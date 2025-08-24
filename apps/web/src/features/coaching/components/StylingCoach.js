import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { apiClient } from '@/services/apiClient';
import { ArrowLeftIcon, SparklesIcon } from '@qupid/ui';
const StylingCoach = ({ onBack }) => {
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading)
            return;
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const response = await apiClient.getStylingAdvice(prompt);
            if (response.text && response.imageUrl) {
                setResult(response);
            }
            else {
                setError('스타일 추천을 생성하지 못했습니다. 다시 시도해주세요.');
            }
        }
        catch (err) {
            setError('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            console.error(err);
        }
        finally {
            setIsLoading(false);
        }
    }, [prompt, isLoading]);
    return (_jsxs("div", { className: "flex flex-col h-full animate-back-out", style: { backgroundColor: 'var(--surface)' }, children: [_jsxs("header", { className: "flex-shrink-0 flex items-center p-3 border-b", style: { borderColor: 'var(--border)' }, children: [_jsx("button", { onClick: onBack, className: "p-2 rounded-full hover:bg-gray-100 mr-2", children: _jsx(ArrowLeftIcon, { className: "w-6 h-6", style: { color: 'var(--text-secondary)' } }) }), _jsx("h2", { className: "text-xl font-bold", style: { color: 'var(--text-primary)' }, children: "AI \uC2A4\uD0C0\uC77C\uB9C1 \uCF54\uCE58" })] }), _jsxs("div", { className: "flex-1 overflow-y-auto p-6", children: [_jsxs("p", { className: "mb-4", style: { color: 'var(--text-secondary)' }, children: ["\uC5B4\uB5A4 \uC0C1\uD669\uC5D0 \uC5B4\uC6B8\uB9AC\uB294 \uC2A4\uD0C0\uC77C\uC774 \uAD81\uAE08\uD558\uC2E0\uAC00\uC694? \uAD6C\uCCB4\uC801\uC73C\uB85C \uC9C8\uBB38\uD574\uBCF4\uC138\uC694.", _jsx("br", {}), _jsx("span", { className: "text-sm", children: "(\uC608: 20\uB300 \uD6C4\uBC18 \uB0A8\uC131, \uCCAB \uC18C\uAC1C\uD305\uC744 \uC704\uD55C \uAE54\uB054\uD55C \uCE90\uC8FC\uC5BC\uB8E9)" })] }), _jsx("form", { onSubmit: handleSubmit, className: "mb-6", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-2", children: [_jsx("input", { type: "text", value: prompt, onChange: (e) => setPrompt(e.target.value), placeholder: "\uAD81\uAE08\uD55C \uC2A4\uD0C0\uC77C\uC744 \uC785\uB825\uD558\uC138\uC694...", className: "flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2", style: {
                                        borderColor: 'var(--border)',
                                        backgroundColor: 'var(--background)',
                                        color: 'var(--text-primary)',
                                        '--tw-ring-color': 'var(--secondary-blue-main)'
                                    }, disabled: isLoading }), _jsx("button", { type: "submit", disabled: isLoading || !prompt.trim(), className: "text-white font-semibold py-3 px-6 rounded-lg transition-opacity disabled:opacity-50 flex items-center justify-center", style: { backgroundColor: 'var(--primary-pink-main)' }, children: isLoading ? (_jsx("div", { className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx(SparklesIcon, { className: "w-5 h-5 mr-2" }), " \uC2A4\uD0C0\uC77C \uCD94\uCC9C\uBC1B\uAE30"] })) })] }) }), error && _jsx("div", { className: "text-center p-4 rounded-lg", style: { backgroundColor: 'var(--error-red-light)', color: 'var(--error-red)' }, children: error }), result && (_jsxs("div", { className: "mt-6 space-y-6 animate-fade-in-down", children: [_jsxs("div", { className: "p-4 rounded-xl", style: { backgroundColor: 'var(--background)' }, children: [_jsx("h3", { className: "text-xl font-semibold mb-3", style: { color: 'var(--text-primary)' }, children: "AI \uCD94\uCC9C \uC774\uBBF8\uC9C0" }), result.imageUrl ? (_jsx("img", { src: result.imageUrl, alt: "AI generated style", className: "w-full rounded-lg shadow-md" })) : (_jsx("div", { className: "w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center", children: _jsx("p", { style: { color: 'var(--text-tertiary)' }, children: "\uC774\uBBF8\uC9C0\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." }) }))] }), _jsxs("div", { className: "p-4 rounded-xl", style: { backgroundColor: 'var(--background)' }, children: [_jsx("h3", { className: "text-xl font-semibold mb-3", style: { color: 'var(--text-primary)' }, children: "\uC2A4\uD0C0\uC77C\uB9C1 \uC870\uC5B8" }), _jsx("p", { className: "whitespace-pre-wrap", style: { color: 'var(--text-primary)', lineHeight: 1.6 }, children: result.text })] })] }))] })] }));
};
export { StylingCoach };
export default StylingCoach;
