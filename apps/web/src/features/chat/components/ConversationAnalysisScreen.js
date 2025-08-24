import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
const ScoreDonut = ({ score }) => {
    const [displayScore, setDisplayScore] = useState(0);
    const size = 120;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    useEffect(() => {
        let start = 0;
        const end = score;
        if (start === end) {
            setDisplayScore(end);
            return;
        }
        ;
        const timer = setInterval(() => {
            start += 1;
            setDisplayScore(start);
            if (start >= end)
                clearInterval(timer);
        }, 15);
        return () => clearInterval(timer);
    }, [score]);
    const offset = circumference - (displayScore / 100) * circumference;
    return (_jsxs("div", { className: "relative", style: { width: size, height: size }, children: [_jsxs("svg", { className: "w-full h-full", viewBox: `0 0 ${size} ${size}`, children: [_jsx("circle", { className: "text-[#F2F4F6]", strokeWidth: strokeWidth, stroke: "currentColor", fill: "transparent", r: radius, cx: size / 2, cy: size / 2 }), _jsx("circle", { className: "text-[#F093B0] transition-all duration-500 ease-out", strokeWidth: strokeWidth, strokeDasharray: circumference, strokeDashoffset: offset, strokeLinecap: "round", stroke: "currentColor", fill: "transparent", r: radius, cx: size / 2, cy: size / 2, style: { transform: 'rotate(-90deg)', transformOrigin: 'center' } })] }), _jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [_jsx("span", { className: "text-4xl font-black", style: { color: 'var(--primary-pink-main)' }, children: displayScore }), _jsx("span", { className: "text-sm font-bold", style: { color: 'var(--text-secondary)' }, children: "/100\uC810" })] })] }));
};
const AnalysisCategory = ({ emoji, title, score, feedback }) => {
    const scoreColorClass = score >= 80 ? 'text-[#0AC5A8]' : score >= 60 ? 'text-yellow-500' : 'text-[#FF8A00]';
    const bgColorClass = score >= 80 ? 'bg-[#0AC5A8]' : score >= 60 ? 'bg-yellow-500' : 'bg-[#FF8A00]';
    return (_jsxs("div", { className: "p-4 bg-[#F9FAFB] rounded-xl", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("h3", { className: "text-base font-bold text-[#191F28]", children: [emoji, " ", title] }), _jsxs("p", { className: `text-xl font-bold ${scoreColorClass}`, children: [score, "\uC810"] })] }), _jsx("div", { className: "w-full bg-[#E5E8EB] h-1.5 rounded-full mt-2", children: _jsx("div", { className: `${bgColorClass} h-1.5 rounded-full`, style: { width: `${score}%` } }) }), _jsx("p", { className: "mt-2 text-sm text-[#8B95A1]", children: feedback })] }));
};
const ConversationAnalysisScreen = ({ analysis, tutorialJustCompleted, onHome, onBack }) => {
    // analysis가 없으면 기본 화면 표시
    if (!analysis) {
        return (_jsxs("div", { className: "flex flex-col h-full w-full bg-white items-center justify-center", children: [_jsx("p", { className: "text-[#8B95A1]", children: "\uBD84\uC11D \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." }), _jsx("button", { onClick: onBack, className: "mt-4 px-6 py-3 bg-[#0AC5A8] text-white rounded-full", children: "\uB3CC\uC544\uAC00\uAE30" })] }));
    }
    return (_jsxs("div", { className: "flex flex-col h-full w-full bg-gradient-to-b from-[#FDF2F8] to-white", children: [_jsxs("header", { className: "flex-shrink-0 pt-12 pb-6 text-center relative", children: [_jsx("h1", { className: "text-2xl font-bold text-[#191F28]", children: "\uB300\uD654 \uC644\uB8CC!" }), _jsx("p", { className: "text-base text-gray-500 mt-1", children: "15\uBD84 \uB3D9\uC548 \uB300\uD654\uD588\uC5B4\uC694." })] }), _jsxs("main", { className: "flex-1 overflow-y-auto px-5 pb-28", children: [_jsxs("section", { className: "p-6 flex flex-col items-center bg-white rounded-2xl border border-[#F2F4F6] shadow-lg animate-scale-in", children: [_jsx(ScoreDonut, { score: analysis.totalScore }), _jsx("div", { className: "mt-2 text-center", children: _jsx("span", { className: "px-3 py-1 bg-[#0AC5A8] text-white rounded-full font-bold text-sm", children: "Good!" }) }), _jsx("p", { className: "mt-4 text-xl font-bold text-center text-[#191F28]", children: analysis.feedback })] }), _jsxs("section", { className: "mt-6 bg-white rounded-2xl p-5 border border-[#F2F4F6] space-y-3 animate-fade-in-up delay-100", children: [_jsx(AnalysisCategory, { emoji: "\uD83D\uDE0A", title: "\uCE5C\uADFC\uD568", score: analysis.friendliness.score, feedback: analysis.friendliness.feedback }), _jsx(AnalysisCategory, { emoji: "\uD83E\uDD14", title: "\uD638\uAE30\uC2EC", score: analysis.curiosity.score, feedback: analysis.curiosity.feedback }), _jsx(AnalysisCategory, { emoji: "\uD83D\uDCAC", title: "\uACF5\uAC10\uB825", score: analysis.empathy.score, feedback: analysis.empathy.feedback })] }), _jsxs("section", { className: "mt-4 p-5 bg-white rounded-2xl border border-[#F2F4F6] animate-fade-in-up delay-200", children: [_jsx("h3", { className: "text-lg font-bold text-[#191F28]", children: "\uD83C\uDFAF \uB2E4\uC74C\uC5D4 \uC774\uB807\uAC8C \uD574\uBCF4\uC138\uC694" }), _jsx("div", { className: "mt-3 space-y-3", children: analysis.pointsToImprove.map((point, i) => (_jsxs("div", { className: "p-3 bg-[#F9FAFB] rounded-lg", children: [_jsx("p", { className: "font-bold", children: point.topic }), _jsx("p", { className: "text-sm text-[#8B95A1]", children: point.suggestion })] }, i))) })] }), _jsxs("section", { className: "mt-4 p-5 bg-white rounded-2xl border border-[#F2F4F6] animate-fade-in-up delay-300", children: [_jsx("h3", { className: "text-lg font-bold text-[#191F28]", children: "\uD83D\uDCC8 \uC2E4\uB825 \uBCC0\uD654" }), _jsx("div", { className: "mt-3 text-lg font-bold text-[#0AC5A8]", children: "+12.7\uC810 \uD5A5\uC0C1" })] })] }), _jsx("footer", { className: "absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-[#F2F4F6]", children: _jsx("button", { onClick: tutorialJustCompleted ? onHome : onBack, className: "w-full h-14 bg-[#F093B0] text-white text-lg font-bold rounded-xl", children: tutorialJustCompleted ? '홈으로' : '다른 AI와 대화해보기' }) })] }));
};
export { ConversationAnalysisScreen };
export default ConversationAnalysisScreen;
