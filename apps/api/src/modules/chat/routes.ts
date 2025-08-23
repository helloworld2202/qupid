import { Router } from 'express';
import * as controller from './controller.js';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { requestValidator } from '../../shared/middleware/requestValidator.js';
import { z } from 'zod';

const router = Router();

// Create a new chat session (requires authentication)
router.post(
  '/sessions',
  authenticate,
  controller.createSession
);

// Send a message to a chat session
router.post(
  '/sessions/:sessionId/messages',
  requestValidator({
    params: z.object({
      sessionId: z.string()
    })
  }),
  controller.sendMessage
);

// Get session information
router.get(
  '/sessions/:sessionId',
  requestValidator({
    params: z.object({
      sessionId: z.string()
    })
  }),
  controller.getSessionInfo
);

// Analyze conversation
router.post(
  '/analyze',
  controller.analyzeConversation
);

// Get realtime feedback
router.post(
  '/feedback',
  controller.getRealtimeFeedback
);

// Get coach suggestion
router.post(
  '/coach-suggestion',
  controller.getCoachSuggestion
);

export default router;