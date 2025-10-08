import { Router } from 'express';
import { PersonaController } from './controller.js';

const router = Router();
const personaController = new PersonaController();

// 페르소나 관련 라우트
router.get('/', personaController.getAllPersonas); // 모든 페르소나 조회 추가
router.post('/generate', personaController.generatePersonaForUser);
router.post('/generate-daily', personaController.generateDailyPersonas);
router.post('/generate-dynamic', personaController.generateDynamicPersonas); // 🚀 새로운 동적 페르소나 생성
router.get('/recommended', personaController.getRecommendedPersonas);
router.get('/:id', personaController.getPersonaById);

export default router;