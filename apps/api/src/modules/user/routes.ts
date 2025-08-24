import { Router } from 'express';
import { userController } from './controller.js';

const router = Router();

// 사용자 관련 라우트
router.get('/:id', userController.getUserProfile);
router.post('/', userController.createUserProfile);
router.put('/:id', userController.updateUserProfile);
router.post('/:id/tutorial/complete', userController.completeTutorial);
router.get('/:id/favorites', userController.getFavorites);
router.post('/:id/favorites/:personaId', userController.toggleFavorite);

export default router;