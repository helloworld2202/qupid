import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ArrowLeftIcon } from '@qupid/ui';
const BadgeCard = ({ badge }) => {
    const isLocked = !badge.acquired;
    return (_jsxs("div", { className: `p-4 rounded-2xl flex flex-col items-center text-center transition-opacity ${isLocked ? 'bg-gray-100 opacity-60' : 'bg-white border border-[#F2F4F6]'}`, children: [_jsx("p", { className: "text-5xl", children: isLocked ? '🔒' : badge.icon }), _jsx("p", { className: "mt-2 font-bold text-[#191F28]", children: badge.name }), _jsx("p", { className: "text-xs text-[#8B95A1] mt-1 flex-grow", children: badge.description }), badge.progress && (_jsxs("div", { className: "w-full mt-2", children: [_jsx("div", { className: "w-full bg-[#E5E8EB] h-1.5 rounded-full", children: _jsx("div", { className: "bg-[#F093B0] h-1.5 rounded-full", style: { width: `${(badge.progress.current / badge.progress.total) * 100}%` } }) }), _jsxs("p", { className: "text-xs font-semibold mt-1 text-[#F093B0]", children: [badge.progress.current, "/", badge.progress.total] })] }))] }));
};
const BadgesScreen = ({ badges, onBack }) => {
    const [activeTab, setActiveTab] = useState('전체');
    const tabs = ['전체', '대화', '성장', '특별'];
    const featuredBadge = badges && badges.length > 0
        ? badges.find(b => b.featured && b.acquired)
        : undefined;
    const filteredBadges = badges && badges.length > 0
        ? (activeTab === '전체' ? badges : badges.filter(b => b.category === activeTab))
        : [];
    return (_jsxs("div", { className: "flex flex-col h-full w-full bg-[#F9FAFB]", children: [_jsxs("header", { className: "flex-shrink-0 flex items-center justify-between p-3 border-b border-[#F2F4F6] bg-white", children: [_jsx("div", { className: "w-10", children: _jsx("button", { onClick: onBack, className: "p-2 rounded-full hover:bg-gray-100", children: _jsx(ArrowLeftIcon, { className: "w-6 h-6 text-[#8B95A1]" }) }) }), _jsx("h2", { className: "text-center text-lg font-bold text-[#191F28]", children: "\uD68D\uB4DD\uD55C \uBC30\uC9C0" }), _jsx("div", { className: "w-10" })] }), _jsxs("main", { className: "flex-1 overflow-y-auto p-5 space-y-4", children: [featuredBadge && (_jsx("section", { className: "p-5 rounded-2xl bg-gradient-to-br from-[#F093B0] to-[#B794F6] text-white", children: _jsxs("div", { className: "flex items-center", children: [_jsx("p", { className: "text-5xl", children: featuredBadge.icon }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "font-bold text-lg", children: featuredBadge.name }), _jsx("p", { className: "text-sm opacity-90", children: featuredBadge.description })] })] }) })), _jsx("nav", { className: "flex bg-[#F2F4F6] p-1 rounded-full", children: tabs.map(tab => (_jsx("button", { onClick: () => setActiveTab(tab), className: `flex-1 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === tab ? 'bg-white text-[#F093B0] shadow-sm' : 'text-[#8B95A1]'}`, children: tab }, tab))) }), _jsx("section", { className: "grid grid-cols-2 gap-3", children: filteredBadges.map(badge => (_jsx(BadgeCard, { badge: badge }, badge.id))) })] })] }));
};
export { BadgesScreen };
export default BadgesScreen;
