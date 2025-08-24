import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const NavItem = ({ label, icon, isActive, hasNotification, onClick }) => {
    const activeColor = 'var(--primary-pink-main)';
    const inactiveColor = 'var(--text-secondary)';
    return (_jsxs("button", { onClick: onClick, className: "flex-1 flex flex-col items-center justify-center p-2 transition-opacity duration-200 ease-out hover:opacity-80", children: [_jsxs("div", { className: "relative", children: [_jsx("span", { className: "text-2xl", style: { color: isActive ? activeColor : inactiveColor }, children: icon }), hasNotification && (_jsx("div", { className: "absolute top-0 right-[-4px] w-2 h-2 bg-red-500 rounded-full border border-white" }))] }), _jsx("span", { className: `text-xs font-bold mt-1`, style: { color: isActive ? activeColor : inactiveColor }, children: label })] }));
};
const BottomNavBar = ({ activeTab, onTabChange, notifications = {} }) => {
    const tabs = [
        { id: 'HOME', label: '홈', icon: '🏠' },
        { id: 'CHAT_TAB', label: '대화', icon: '💬', notification: notifications.chat },
        { id: 'COACHING_TAB', label: '코칭', icon: '📚', notification: notifications.coaching },
        { id: 'MY_TAB', label: 'MY', icon: '👤', notification: notifications.my },
    ];
    return (_jsx("div", { className: "flex-shrink-0 h-[80px] w-full bg-white border-t", style: { borderColor: 'var(--divider)' }, children: _jsx("div", { className: "flex h-full w-full", children: tabs.map(tab => (_jsx(NavItem, { label: tab.label, icon: tab.icon, isActive: activeTab === tab.id, ...(tab.notification !== undefined ? { hasNotification: tab.notification } : {}), onClick: () => onTabChange(tab.id) }, tab.id))) }) }));
};
export { BottomNavBar };
export default BottomNavBar;
