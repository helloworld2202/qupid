import { NotificationService } from '../NotificationService.js';
import supabaseAdmin from '../../../../config/supabase.js';

// Mock Supabase
jest.mock('../../../../config/supabase.js', () => ({
  default: {
    from: jest.fn()
  }
}));

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService();
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      const mockNotification = {
        id: 'notif-123',
        user_id: 'user-123',
        type: 'achievement',
        title: 'New Achievement!',
        message: 'You earned a badge!',
        is_read: false,
        created_at: new Date().toISOString()
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockNotification,
              error: null
            })
          })
        })
      });

      const notificationId = await notificationService.createNotification(
        'user-123',
        'achievement',
        'New Achievement!',
        'You earned a badge!',
        { badgeId: 'badge-123' }
      );

      expect(notificationId).toBe('notif-123');
      expect(supabaseAdmin.from).toHaveBeenCalledWith('notifications');
    });

    it('should handle creation error', async () => {
      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      });

      await expect(notificationService.createNotification(
        'user-123',
        'achievement',
        'Title',
        'Message'
      )).rejects.toThrow();
    });
  });

  describe('getUserNotifications', () => {
    it('should get all user notifications', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          user_id: 'user-123',
          type: 'practice_reminder',
          title: 'Practice Time!',
          message: 'Time to practice',
          is_read: false,
          created_at: new Date().toISOString()
        },
        {
          id: 'notif-2',
          user_id: 'user-123',
          type: 'achievement',
          title: 'Badge Earned!',
          message: 'You got a badge',
          is_read: true,
          created_at: new Date().toISOString()
        }
      ];

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockNotifications,
              error: null
            })
          })
        })
      });

      const notifications = await notificationService.getUserNotifications('user-123');

      expect(notifications).toHaveLength(2);
      expect(notifications[0].type).toBe('practice_reminder');
      expect(notifications[1].isRead).toBe(true);
    });

    it('should get only unread notifications', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          user_id: 'user-123',
          type: 'practice_reminder',
          title: 'Practice Time!',
          message: 'Time to practice',
          is_read: false,
          created_at: new Date().toISOString()
        }
      ];

      const mockFromResult = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockNotifications,
              error: null
            })
          })
        })
      };

      // Mock chain for unread filter
      mockFromResult.select().eq = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockNotifications,
            error: null
          })
        })
      });

      (supabaseAdmin.from as jest.Mock).mockReturnValue(mockFromResult);

      const notifications = await notificationService.getUserNotifications('user-123', true);

      expect(notifications).toHaveLength(1);
      expect(notifications[0].isRead).toBe(false);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null
          })
        })
      });

      await expect(notificationService.markAsRead('notif-123'))
        .resolves.not.toThrow();

      expect(supabaseAdmin.from).toHaveBeenCalledWith('notifications');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for user', async () => {
      const mockFromResult = {
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null
            })
          })
        })
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue(mockFromResult);

      await expect(notificationService.markAllAsRead('user-123'))
        .resolves.not.toThrow();

      expect(supabaseAdmin.from).toHaveBeenCalledWith('notifications');
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null
          })
        })
      });

      await expect(notificationService.deleteNotification('notif-123'))
        .resolves.not.toThrow();
    });
  });

  describe('createPracticeReminder', () => {
    it('should create practice reminder notification', async () => {
      const mockNotification = {
        id: 'notif-123',
        user_id: 'user-123',
        type: 'practice_reminder',
        title: '오늘의 연습 시간이에요! 💪',
        message: '연애 대화 실력을 향상시킬 시간입니다. 지금 바로 연습을 시작해보세요!',
        is_read: false,
        created_at: new Date().toISOString()
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockNotification,
              error: null
            })
          })
        })
      });

      await expect(notificationService.createPracticeReminder('user-123'))
        .resolves.not.toThrow();
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread notification count', async () => {
      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              count: 5,
              error: null
            })
          })
        })
      });

      const count = await notificationService.getUnreadCount('user-123');

      expect(count).toBe(5);
    });

    it('should return 0 on error', async () => {
      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              count: null,
              error: { message: 'Database error' }
            })
          })
        })
      });

      const count = await notificationService.getUnreadCount('user-123');

      expect(count).toBe(0);
    });
  });

  describe('getNotificationSettings', () => {
    it('should get notification settings', async () => {
      const mockSettings = {
        practice_reminder: true,
        achievement_alerts: false,
        coaching_tips: true,
        system_notices: true,
        reminder_time: '21:00'
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSettings,
              error: null
            })
          })
        })
      });

      const settings = await notificationService.getNotificationSettings('user-123');

      expect(settings.practiceReminder).toBe(true);
      expect(settings.achievementAlerts).toBe(false);
      expect(settings.reminderTime).toBe('21:00');
    });

    it('should return default settings if not found', async () => {
      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      });

      const settings = await notificationService.getNotificationSettings('user-123');

      expect(settings.practiceReminder).toBe(true);
      expect(settings.achievementAlerts).toBe(true);
      expect(settings.reminderTime).toBe('20:00');
    });
  });

  describe('updateNotificationSettings', () => {
    it('should update notification settings', async () => {
      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        upsert: jest.fn().mockResolvedValue({
          error: null
        })
      });

      await expect(notificationService.updateNotificationSettings('user-123', {
        practiceReminder: false,
        reminderTime: '22:00'
      })).resolves.not.toThrow();
    });
  });
});