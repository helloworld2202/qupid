import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './app/NotificationService.js';
import { AppError } from '../../shared/errors/AppError.js';

const notificationService = new NotificationService();

/**
 * GET /api/v1/notifications/:userId
 * 사용자 알림 목록 조회
 */
export const getUserNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { unreadOnly } = req.query;
    
    const notifications = await notificationService.getUserNotifications(
      userId,
      unreadOnly === 'true'
    );
    
    res.json({
      ok: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/notifications/:userId/unread-count
 * 읽지 않은 알림 개수 조회
 */
export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    
    const count = await notificationService.getUnreadCount(userId);
    
    res.json({
      ok: true,
      data: { count }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/notifications/:notificationId/read
 * 알림 읽음 처리
 */
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { notificationId } = req.params;
    
    await notificationService.markAsRead(notificationId);
    
    res.json({
      ok: true,
      data: { message: 'Notification marked as read' }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/notifications/:userId/read-all
 * 모든 알림 읽음 처리
 */
export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    
    await notificationService.markAllAsRead(userId);
    
    res.json({
      ok: true,
      data: { message: 'All notifications marked as read' }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/notifications/:notificationId
 * 알림 삭제
 */
export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { notificationId } = req.params;
    
    await notificationService.deleteNotification(notificationId);
    
    res.json({
      ok: true,
      data: { message: 'Notification deleted' }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/notifications/:userId/settings
 * 알림 설정 조회
 */
export const getNotificationSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    
    const settings = await notificationService.getNotificationSettings(userId);
    
    res.json({
      ok: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/notifications/:userId/settings
 * 알림 설정 업데이트
 */
export const updateNotificationSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const settings = req.body;
    
    await notificationService.updateNotificationSettings(userId, settings);
    
    res.json({
      ok: true,
      data: { message: 'Settings updated successfully' }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/notifications/test
 * 테스트 알림 발송
 */
export const sendTestNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, type = 'system' } = req.body;
    
    if (!userId) {
      throw AppError.badRequest('User ID is required');
    }

    let notificationId;
    
    switch (type) {
      case 'practice_reminder':
        await notificationService.createPracticeReminder(userId);
        break;
      case 'achievement':
        await notificationService.createAchievementNotification(
          userId,
          '테스트 성과: 첫 대화를 완료했습니다!'
        );
        break;
      case 'coaching':
        await notificationService.createCoachingNotification(
          userId,
          '상대방의 관심사에 대해 더 많은 질문을 해보세요!'
        );
        break;
      default:
        notificationId = await notificationService.createNotification(
          userId,
          'system',
          '시스템 알림',
          '이것은 테스트 알림입니다.'
        );
    }
    
    res.json({
      ok: true,
      data: { 
        message: 'Test notification sent',
        notificationId 
      }
    });
  } catch (error) {
    next(error);
  }
};