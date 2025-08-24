import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/apiClient';

export interface Notification {
  id: string;
  userId: string;
  type: 'practice_reminder' | 'achievement' | 'coaching' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

export interface NotificationSettings {
  practiceReminder: boolean;
  achievementAlerts: boolean;
  coachingTips: boolean;
  systemNotices: boolean;
  reminderTime?: string;
}

// 알림 목록 조회
export const useNotifications = (userId: string, unreadOnly = false) => {
  return useQuery({
    queryKey: ['notifications', userId, unreadOnly],
    queryFn: async () => {
      const response = await apiClient.get<{ ok: boolean; data: Notification[] }>(
        `/api/v1/notifications/${userId}?unreadOnly=${unreadOnly}`
      );
      return response.data.data;
    },
    enabled: !!userId
  });
};

// 읽지 않은 알림 개수
export const useUnreadCount = (userId: string) => {
  return useQuery({
    queryKey: ['notifications', 'unread-count', userId],
    queryFn: async () => {
      const response = await apiClient.get<{ ok: boolean; data: { count: number } }>(
        `/api/v1/notifications/${userId}/unread-count`
      );
      return response.data.data.count;
    },
    enabled: !!userId,
    refetchInterval: 30000 // 30초마다 자동 새로고침
  });
};

// 알림 읽음 처리
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await apiClient.put(`/api/v1/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

// 모든 알림 읽음 처리
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.put(`/api/v1/notifications/${userId}/read-all`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

// 알림 삭제
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await apiClient.delete(`/api/v1/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

// 알림 설정 조회
export const useNotificationSettings = (userId: string) => {
  return useQuery({
    queryKey: ['notification-settings', userId],
    queryFn: async () => {
      const response = await apiClient.get<{ ok: boolean; data: NotificationSettings }>(
        `/api/v1/notifications/${userId}/settings`
      );
      return response.data.data;
    },
    enabled: !!userId
  });
};

// 알림 설정 업데이트
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, settings }: { userId: string; settings: Partial<NotificationSettings> }) => {
      await apiClient.put(`/api/v1/notifications/${userId}/settings`, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    }
  });
};

// 테스트 알림 발송
export const useSendTestNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, type }: { userId: string; type?: string }) => {
      await apiClient.post('/api/v1/notifications/test', { userId, type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};