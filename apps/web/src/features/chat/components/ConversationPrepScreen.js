import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowLeftIcon } from '@qupid/ui';
const ConversationPrepScreen = ({ partner, onStart, onBack }) => {
    // partner가 없으면 기본 persona 사용
    if (!partner) {
        return (_jsxs("div", { className: "flex flex-col h-full w-full bg-white items-center justify-center", children: [_jsx("p", { className: "text-[#8B95A1]", children: "\uD30C\uD2B8\uB108\uB97C \uC120\uD0DD\uD574\uC8FC\uC138\uC694." }), _jsx("button", { onClick: onBack, className: "mt-4 px-6 py-3 bg-[#0AC5A8] text-white rounded-full", children: "\uB3CC\uC544\uAC00\uAE30" })] }));
    }
    const persona = partner;
    const checklist = [
        "편안한 마음가짐 준비",
        "15-20분 정도 시간 확보",
        "방해받지 않는 환경",
        "솔직하고 자연스럽게 대화"
    ];
    const tips = [
        "자기소개로 시작해보세요",
        `공통 관심사(${persona.tags?.join(', ') || '영화, 음악'})를 물어보세요`,
        "상대방 이야기에 관심을 보여주세요",
        "긴장하지 마세요, 연습이니까요!",
    ];
    return (_jsxs("div", { className: "flex flex-col h-full w-full bg-white animate-fade-in", children: [_jsx("header", { className: "flex-shrink-0 flex items-center p-3", children: _jsx("button", { onClick: onBack, className: "p-2 rounded-full hover:bg-gray-100", children: _jsx(ArrowLeftIcon, { className: "w-6 h-6 text-[#8B95A1]" }) }) }), _jsxs("main", { className: "flex-1 px-6", children: [_jsx("h1", { className: "text-[32px] font-bold text-[#191F28]", children: "\uB300\uD654 \uC900\uBE44 \uC644\uB8CC!" }), _jsxs("p", { className: "text-base text-[#8B95A1] mt-2", children: [persona.name, "\uB2D8\uACFC\uC758 \uCCAB \uB9CC\uB0A8\uC774\uC5D0\uC694"] }), _jsxs("div", { className: "mt-8 p-6 bg-white border border-[#E5E8EB] rounded-2xl", children: [_jsx("h2", { className: "text-lg font-bold text-[#191F28]", children: "\uB300\uD654 \uC804 \uD655\uC778\uD574\uC8FC\uC138\uC694" }), _jsx("ul", { className: "mt-4 space-y-3", children: checklist.map((item, i) => (_jsxs("li", { className: "flex items-center", children: [_jsx("span", { className: "text-lg mr-3 text-[#0AC5A8]", children: "\u2713" }), _jsx("p", { className: "text-base text-[#191F28] font-medium", children: item })] }, i))) })] }), _jsxs("div", { className: "mt-4 p-5 bg-[#FDF2F8] rounded-2xl", children: [_jsx("h2", { className: "text-lg font-bold text-[#191F28]", children: "\uD83D\uDCA1 \uCCAB \uB300\uD654 \uD301" }), _jsx("ul", { className: "mt-3 list-disc list-inside space-y-1.5", children: tips.map((tip, i) => (_jsx("li", { className: "text-sm text-[#DB7093] font-medium", children: tip }, i))) })] }), _jsxs("div", { className: "mt-4 p-5 bg-[#EBF2FF] rounded-2xl", children: [_jsx("h2", { className: "text-lg font-bold text-[#191F28]", children: "\uD83D\uDCCA \uC2E4\uC2DC\uAC04 \uBD84\uC11D \uAE30\uB2A5" }), _jsx("p", { className: "mt-2 text-sm text-[#4F7ABA] leading-relaxed font-medium", children: "\uB300\uD654 \uC911\uC5D0 AI\uAC00 \uC2E4\uC2DC\uAC04\uC73C\uB85C \uBD84\uC11D\uD574\uC11C \uC88B\uC740 \uB300\uD654\uC77C \uB54C \uACA9\uB824\uD574\uB4DC\uB824\uC694. \uAC1C\uC120\uC810\uC774 \uC788\uC73C\uBA74 \uD78C\uD2B8\uB97C \uC8FC\uACE0, \uB300\uD654 \uD6C4 \uC0C1\uC138\uD55C \uD53C\uB4DC\uBC31\uC744 \uC81C\uACF5\uD574\uC694." })] })] }), _jsx("footer", { className: "flex-shrink-0 p-4", children: _jsx("button", { onClick: onStart, className: "w-full h-14 bg-[#F093B0] text-white text-lg font-bold rounded-xl", children: "\uC9C0\uAE08 \uB300\uD654 \uC2DC\uC791\uD558\uAE30" }) })] }));
};
export { ConversationPrepScreen };
export default ConversationPrepScreen;
