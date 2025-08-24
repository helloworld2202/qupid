import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ArrowLeftIcon } from '@qupid/ui';
const TossToggle = ({ value, onToggle, size = 'normal' }) => {
    const isLarge = size === 'large';
    const width = isLarge ? 60 : 50;
    const height = isLarge ? 34 : 30;
    const thumbSize = isLarge ? 30 : 26;
    const padding = 2;
    const translateX = value ? width - thumbSize - padding : padding;
    return (_jsx("button", { onClick: onToggle, className: `relative inline-flex items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none`, style: { width, height, backgroundColor: value ? '#F093B0' : '#E5E8EB' }, children: _jsx("span", { className: `inline-block transform bg-white rounded-full transition-transform duration-300 ease-in-out shadow-sm`, style: { width: thumbSize, height: thumbSize, transform: `translateX(${translateX}px)` } }) }));
};
const Section = ({ title, children }) => (_jsxs("section", { children: [_jsx("h2", { className: "font-bold text-lg px-2 text-[#191F28]", children: title }), _jsx("div", { className: "mt-2 bg-white rounded-2xl border border-[#F2F4F6] divide-y divide-[#F2F4F6]", children: children })] }));
const SettingRow = ({ title, description, rightContent }) => (_jsxs("div", { className: "p-4 flex items-center", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-[#191F28]", children: title }), description && _jsx("p", { className: "text-sm text-[#8B95A1] mt-0.5", children: description })] }), rightContent] }));
const NotificationSettingsScreen = ({ onBack }) => {
    const [allNotifications, setAllNotifications] = useState(true);
    // Individual states
    const [practiceAlert, setPracticeAlert] = useState(true);
    const [goalAlert, setGoalAlert] = useState(true);
    const [summaryAlert, setSummaryAlert] = useState(true);
    const [aiRecAlert, setAiRecAlert] = useState(true);
    const [badgeAlert, setBadgeAlert] = useState(true);
    const [matchAlert, setMatchAlert] = useState(false);
    const [updateAlert, setUpdateAlert] = useState(true);
    const handleToggleAll = () => {
        const newState = !allNotifications;
        setAllNotifications(newState);
        setPracticeAlert(newState);
        setGoalAlert(newState);
        setSummaryAlert(newState);
        setAiRecAlert(newState);
        setBadgeAlert(newState);
        setMatchAlert(newState);
        setUpdateAlert(newState);
    };
    return (_jsxs("div", { className: "flex flex-col h-full w-full bg-[#F9FAFB]", children: [_jsxs("header", { className: "flex-shrink-0 flex items-center p-3 bg-white border-b border-[#F2F4F6]", children: [_jsx("button", { onClick: onBack, className: "p-2 rounded-full hover:bg-gray-100", children: _jsx(ArrowLeftIcon, { className: "w-6 h-6 text-[#191F28]" }) }), _jsx("h1", { className: "flex-1 text-center text-xl font-bold text-[#191F28]", children: "\uC54C\uB9BC \uC124\uC815" }), _jsx("div", { className: "w-10" })] }), _jsxs("main", { className: "flex-1 overflow-y-auto p-4 space-y-6", children: [_jsxs("div", { className: "p-4 flex items-center bg-white rounded-2xl border border-[#F2F4F6] h-20", children: [_jsx("span", { className: "text-3xl mr-4", children: "\uD83D\uDD14" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-bold text-lg", children: "\uC804\uCCB4 \uC54C\uB9BC" }), _jsx("p", { className: "text-sm text-[#8B95A1]", children: "\uBAA8\uB4E0 \uC54C\uB9BC\uC744 \uD55C\uBC88\uC5D0 \uCF1C\uAC70\uB098 \uAEBC\uC694" })] }), _jsx(TossToggle, { value: allNotifications, onToggle: handleToggleAll, size: "large" })] }), _jsxs(Section, { title: "\uD559\uC2B5 \uC54C\uB9BC", children: [_jsx(SettingRow, { title: "\uD83D\uDCDA \uC5F0\uC2B5 \uC2DC\uAC04 \uC54C\uB9BC", description: "\uC124\uC815\uD55C \uC2DC\uAC04\uC5D0 \uB300\uD654 \uC5F0\uC2B5 \uC54C\uB9BC", rightContent: _jsx(TossToggle, { value: practiceAlert, onToggle: () => setPracticeAlert(v => !v) }) }), _jsx(SettingRow, { title: "\uD83C\uDFAF \uBAA9\uD45C \uB2EC\uC131 \uC54C\uB9BC", description: "\uC77C\uC77C/\uC8FC\uAC04 \uBAA9\uD45C \uB2EC\uC131 \uC2DC", rightContent: _jsx(TossToggle, { value: goalAlert, onToggle: () => setGoalAlert(v => !v) }) }), _jsx(SettingRow, { title: "\uD83D\uDCCA \uC131\uACFC \uC694\uC57D \uC54C\uB9BC", description: "\uC8FC\uAC04/\uC6D4\uAC04 \uC131\uACFC \uC694\uC57D", rightContent: _jsx(TossToggle, { value: summaryAlert, onToggle: () => setSummaryAlert(v => !v) }) })] }), _jsxs(Section, { title: "\uC18C\uC15C \uC54C\uB9BC", children: [_jsx(SettingRow, { title: "\uD83D\uDC95 \uC0C8\uB85C\uC6B4 AI \uCD94\uCC9C", description: "\uB9DE\uCDA4 AI \uCD94\uCC9C \uC2DC", rightContent: _jsx(TossToggle, { value: aiRecAlert, onToggle: () => setAiRecAlert(v => !v) }) }), _jsx(SettingRow, { title: "\uD83C\uDFC6 \uBC30\uC9C0 \uD68D\uB4DD \uC54C\uB9BC", description: "\uC0C8\uB85C\uC6B4 \uC131\uCDE8 \uB2EC\uC131 \uC2DC", rightContent: _jsx(TossToggle, { value: badgeAlert, onToggle: () => setBadgeAlert(v => !v) }) }), _jsx(SettingRow, { title: "\uD83D\uDCAC \uB9E4\uCE6D \uC54C\uB9BC", description: "\uC2E4\uC81C \uB9E4\uCE6D \uAD00\uB828 \uC54C\uB9BC", rightContent: _jsx(TossToggle, { value: matchAlert, onToggle: () => setMatchAlert(v => !v) }) })] }), _jsxs(Section, { title: "\uC2DC\uC2A4\uD15C \uC54C\uB9BC", children: [_jsx(SettingRow, { title: "\uD83C\uDD99 \uC571 \uC5C5\uB370\uC774\uD2B8 \uC54C\uB9BC", rightContent: _jsx(TossToggle, { value: updateAlert, onToggle: () => setUpdateAlert(v => !v) }) }), _jsx(SettingRow, { title: "\uD83D\uDD10 \uBCF4\uC548 \uC54C\uB9BC", rightContent: _jsx("span", { className: "text-sm font-medium text-gray-400", children: "\uD56D\uC0C1 ON" }) })] }), _jsxs(Section, { title: "\uC54C\uB9BC \uC2DC\uAC04", children: [_jsx(SettingRow, { title: "\uC5F0\uC2B5 \uC54C\uB9BC \uC2DC\uAC04", rightContent: _jsx("p", { className: "font-bold text-lg text-[#F093B0]", children: "\uC624\uD6C4 7:00" }) }), _jsx(SettingRow, { title: "\uBC29\uD574 \uAE08\uC9C0 \uC2DC\uAC04", rightContent: _jsx("p", { className: "font-bold text-base text-gray-500", children: "\uC624\uD6C4 10\uC2DC ~ \uC624\uC804 8\uC2DC" }) })] })] })] }));
};
export { NotificationSettingsScreen };
export default NotificationSettingsScreen;
