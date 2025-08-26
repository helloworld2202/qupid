import { NotificationService } from '../NotificationService';

// Mock Supabase before importing
jest.mock('../../../../config/supabase');

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockFrom: jest.Mock;

  beforeEach(() => {
    // Create mock functions
    mockFrom = jest.fn();
    
    // Set up the mock
    require('../../../../config/supabase').default = {
      from: mockFrom
    };
    
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

      mockFrom.mockReturnValue({
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
      expect(mockFrom).toHaveBeenCalledWith('notifications');
    });

    it('should handle creation error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockFrom.mockReturnValue({
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
        'Test',
        'Test message'
      )).rejects.toMatchObject({ message: 'Database error' });
      
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getUserNotifications', () => {
    it('should get all user notifications', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          user_id: 'user-123',
          type: 'achievement',
          title: 'Test 1',
          message: 'Message 1',
          is_read: false,
          created_at: new Date().toISOString()
        },
        {
          id: 'notif-2',
          user_id: 'user-123',
          type: 'system',
          title: 'Test 2',
          message: 'Message 2',
          is_read: true,
          created_at: new Date().toISOString()
        }
      ];

      mockFrom.mockReturnValue({
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
      expect(notifications[0].id).toBe('notif-1');
      expect(notifications[0].userId).toBe('user-123');
      expect(mockFrom).toHaveBeenCalledWith('notifications');
    });

    it('should get only unread notifications', async () => {
      const mockUnreadNotifications = [
        {
          id: 'notif-1',
          user_id: 'user-123',
          type: 'achievement',
          title: 'Unread',
          message: 'Unread message',
          is_read: false,
          created_at: new Date().toISOString()
        }
      ];

      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockUnreadNotifications,
          error: null
        })
      };

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: mockUnreadNotifications,
                error: null
              })
            })
          })
        })
      });

      const notifications = await notificationService.getUserNotifications('user-123', true);

      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toBe('Unread');
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'notif-123', is_read: true },
              error: null
            })
          })
        })
      });

      await notificationService.markAsRead('notif-123');

      expect(mockFrom).toHaveBeenCalledWith('notifications');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for user', async () => {
      mockFrom.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      });

      await notificationService.markAllAsRead('user-123');

      expect(mockFrom).toHaveBeenCalledWith('notifications');
    });
  });

  // checkAchievements method doesn't exist in current implementation
});