import React, { useState } from 'react';
import { useUnreadCount, useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface NotificationBellProps {
  userId: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount(userId);
  const { data: notifications = [] } = useNotifications(userId);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead.mutateAsync(notificationId);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync(userId);
  };

  const getNotificationIcon = (type: string) => {
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

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F093B0] text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">알림</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-[#F093B0] hover:underline"
                >
                  모두 읽음
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-80">
              {notifications.length > 0 ? (
                notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-pink-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ko
                          })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-[#F093B0] rounded-full mt-2" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <span className="text-5xl block mb-3">🔔</span>
                  <p>새로운 알림이 없습니다</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to notifications page if needed
                  }}
                  className="w-full text-center text-sm text-[#F093B0] font-medium hover:underline"
                >
                  모든 알림 보기
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};