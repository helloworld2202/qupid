import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useUnreadCount, useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
export const NotificationBell = ({ userId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: unreadCount = 0 } = useUnreadCount(userId);
    const { data: notifications = [] } = useNotifications(userId);
    const markAsRead = useMarkAsRead();
    const markAllAsRead = useMarkAllAsRead();
    const handleNotificationClick = async (notificationId, isRead) => {
        if (!isRead) {
            await markAsRead.mutateAsync(notificationId);
        }
    };
    const handleMarkAllAsRead = async () => {
        await markAllAsRead.mutateAsync(userId);
    };
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'practice_reminder':
                return '💪';
            case 'achievement':
                return '🎉';
            case 'coaching':
                return '💡';
            default:
                return '📢';
        }
    };
    return (_jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setIsOpen(!isOpen), className: "relative p-2 hover:bg-gray-100 rounded-lg transition-colors", children: [_jsx("span", { className: "text-xl", children: "\uD83D\uDD14" }), unreadCount > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 w-5 h-5 bg-[#F093B0] text-white text-xs rounded-full flex items-center justify-center", children: unreadCount > 9 ? '9+' : unreadCount }))] }), isOpen && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-40", onClick: () => setIsOpen(false) }), _jsxs("div", { className: "absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-50 max-h-96 overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b flex items-center justify-between", children: [_jsx("h3", { className: "font-bold text-lg", children: "\uC54C\uB9BC" }), unreadCount > 0 && (_jsx("button", { onClick: handleMarkAllAsRead, className: "text-sm text-[#F093B0] hover:underline", children: "\uBAA8\uB450 \uC77D\uC74C" }))] }), _jsx("div", { className: "overflow-y-auto max-h-80", children: notifications.length > 0 ? (notifications.map((notification) => (_jsx("div", { onClick: () => handleNotificationClick(notification.id, notification.isRead), className: `p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-pink-50' : ''}`, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("span", { className: "text-2xl", children: getNotificationIcon(notification.type) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-sm text-gray-900", children: notification.title }), _jsx("p", { className: "text-xs text-gray-600 mt-1", children: notification.message }), _jsx("p", { className: "text-xs text-gray-400 mt-2", children: formatDistanceToNow(new Date(notification.createdAt), {
                                                            addSuffix: true,
                                                            locale: ko
                                                        }) })] }), !notification.isRead && (_jsx("div", { className: "w-2 h-2 bg-[#F093B0] rounded-full mt-2" }))] }) }, notification.id)))) : (_jsxs("div", { className: "p-8 text-center text-gray-500", children: [_jsx("span", { className: "text-5xl block mb-3", children: "\uD83D\uDD14" }), _jsx("p", { children: "\uC0C8\uB85C\uC6B4 \uC54C\uB9BC\uC774 \uC5C6\uC2B5\uB2C8\uB2E4" })] })) }), notifications.length > 0 && (_jsx("div", { className: "p-3 border-t", children: _jsx("button", { onClick: () => {
                                        setIsOpen(false);
                                        // Navigate to notifications page if needed
                                    }, className: "w-full text-center text-sm text-[#F093B0] font-medium hover:underline", children: "\uBAA8\uB4E0 \uC54C\uB9BC \uBCF4\uAE30" }) }))] })] }))] }));
};
