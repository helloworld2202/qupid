import { Router } from 'express';
import { coachingController } from './controller.js';

const router = Router();

// 코치 관련 라우트
router.get('/', coachingController.getAllCoaches);
router.get('/specialty/:specialty', coachingController.getCoachesBySpecialty);
router.get('/:id', coachingController.getCoachById);

export default router;