import { Router } from 'express';
import { personaController } from './controller.js';

const router = Router();

// 페르소나 관련 라우트
router.get('/', personaController.getAllPersonas);
router.get('/recommended', personaController.getRecommendedPersonas);
router.get('/gender/:gender', personaController.getPersonasByGender);
router.get('/:id', personaController.getPersonaById);

export default router;