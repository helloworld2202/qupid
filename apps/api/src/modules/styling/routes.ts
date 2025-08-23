import { Router } from 'express';
import * as controller from './controller.js';

const router = Router();

// Get styling advice with AI-generated image
router.post(
  '/advice',
  controller.getStylingAdvice
);

export default router;