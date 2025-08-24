import { Router } from 'express';
import * as controller from './controller.js';
import { requestValidator } from '../../shared/middleware/requestValidator.js';
import { z } from 'zod';

const router = Router();

// 사용자 알림 목록 조회
router.get(
  '/:userId',
  requestValidator({
    params: z.object({
      userId: z.string()
    })
  }),
  controller.getUserNotifications
);

// 읽지 않은 알림 개수 조회
router.get(
  '/:userId/unread-count',
  requestValidator({
    params: z.object({
      userId: z.string()
    })
  }),
  controller.getUnreadCount
);

// 알림 설정 조회
router.get(
  '/:userId/settings',
  requestValidator({
    params: z.object({
      userId: z.string()
    })
  }),
  controller.getNotificationSettings
);

// 알림 읽음 처리
router.put(
  '/:notificationId/read',
  requestValidator({
    params: z.object({
      notificationId: z.string()
    })
  }),
  controller.markAsRead
);

// 모든 알림 읽음 처리
router.put(
  '/:userId/read-all',
  requestValidator({
    params: z.object({
      userId: z.string()
    })
  }),
  controller.markAllAsRead
);

// 알림 설정 업데이트
router.put(
  '/:userId/settings',
  requestValidator({
    params: z.object({
      userId: z.string()
    }),
    body: z.object({
      practiceReminder: z.boolean().optional(),
      achievementAlerts: z.boolean().optional(),
      coachingTips: z.boolean().optional(),
      systemNotices: z.boolean().optional(),
      reminderTime: z.string().optional()
    })
  }),
  controller.updateNotificationSettings
);

// 알림 삭제
router.delete(
  '/:notificationId',
  requestValidator({
    params: z.object({
      notificationId: z.string()
    })
  }),
  controller.deleteNotification
);

// 테스트 알림 발송
router.post(
  '/test',
  requestValidator({
    body: z.object({
      userId: z.string(),
      type: z.enum(['practice_reminder', 'achievement', 'coaching', 'system']).optional()
    })
  }),
  controller.sendTestNotification
);

export default router;