import { Router } from 'express';
import { analyticsController } from './controller.js';

const router = Router();

// 성과 데이터 조회
router.get('/performance/:userId', analyticsController.getPerformanceData);

// 주간 통계
router.get('/weekly/:userId', analyticsController.getWeeklyStats);

// 월간 통계
router.get('/monthly/:userId', analyticsController.getMonthlyStats);

export default router;