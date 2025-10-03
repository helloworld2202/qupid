import { Router } from 'express';
import { PersonaController } from './controller.js';

const router = Router();
const personaController = new PersonaController();

// 페르소나 관련 라우트
router.post('/generate', personaController.generatePersonaForUser);
router.post('/generate-daily', personaController.generateDailyPersonas);
router.get('/recommended', personaController.getRecommendedPersonas);
router.get('/:id', personaController.getPersonaById);

export default router;