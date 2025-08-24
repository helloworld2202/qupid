import { Router } from 'express';
import { BadgeController } from './controller.js';

const router = Router();
const controller = new BadgeController();

// Get all badges
router.get('/badges', controller.getAllBadges);

// Get user badges
router.get('/users/:userId/badges', controller.getUserBadges);

// Award badge to user
router.post('/users/:userId/badges', controller.awardBadge);

export default router;