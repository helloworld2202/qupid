import { Router } from 'express';
import * as controller from './controller.js';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { requestValidator } from '../../shared/middleware/requestValidator.js';
import { z } from 'zod';

const router = Router();

// Create a new chat session (requires authentication)
router.post(
  '/sessions',
  // authenticate, // 임시로 인증 비활성화
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

// Stream a message response (SSE)
router.post(
  '/sessions/:sessionId/stream',
  requestValidator({
    params: z.object({
      sessionId: z.string()
    })
  }),
  controller.streamMessage
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

// End conversation and trigger analysis
router.post(
  '/sessions/:sessionId/end',
  requestValidator({
    params: z.object({
      sessionId: z.string()
    })
  }),
  controller.endConversation
);

// Analyze conversation
router.post(
  '/analyze',
  controller.analyzeConversation
);

// Analyze conversation with session ID (saves to database)
router.post(
  '/sessions/:sessionId/analyze',
  requestValidator({
    params: z.object({
      sessionId: z.string()
    })
  }),
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

// 대화 히스토리 조회
router.get(
  '/history/:userId',
  requestValidator({
    params: z.object({
      userId: z.string()
    })
  }),
  controller.getConversationHistory
);

// 특정 대화 상세 조회
router.get(
  '/history/:userId/conversation/:conversationId',
  requestValidator({
    params: z.object({
      userId: z.string(),
      conversationId: z.string()
    })
  }),
  controller.getConversationDetail
);

// 대화 통계 조회
router.get(
  '/history/:userId/stats',
  requestValidator({
    params: z.object({
      userId: z.string()
    })
  }),
  controller.getConversationStats
);

// 대화 스타일 분석 및 추천
router.post(
  '/style-analysis',
  controller.analyzeConversationStyle
);

export default router;