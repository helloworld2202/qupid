import { Router } from 'express';
import { coachingController } from './controller.js';

const router = Router();

// 코치 관련 라우트
router.get('/', coachingController.getAllCoaches);
router.get('/specialty/:specialty', coachingController.getCoachesBySpecialty);
router.get('/:id', coachingController.getCoachById);

// 코칭 세션 관련 라우트
router.post('/sessions', coachingController.createCoachingSession);
router.post('/sessions/:sessionId/messages', coachingController.sendCoachingMessage);
router.get('/sessions/:sessionId/stream', coachingController.streamCoachingMessage);
router.post('/sessions/:sessionId/end', coachingController.endCoachingSession);

export default router;