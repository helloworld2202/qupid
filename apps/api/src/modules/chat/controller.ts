import { Request, Response, NextFunction } from 'express';
import { ChatService } from './app/ChatService.js';
import { ConversationAnalyzer } from './app/ConversationAnalyzer.js';
import { AppError } from '../../shared/errors/AppError.js';

const chatService = new ChatService();
const sessionService = chatService; // ChatService를 세션 서비스로도 사용
const analyzer = new ConversationAnalyzer();

/**
 * POST /api/v1/chat/sessions
 * Create a new chat session
 */
export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, personaId, systemInstruction } = req.body;
    
    if (!personaId) {
      throw AppError.badRequest('Persona ID is required');
    }

    const sessionId = await chatService.createSession(
      userId || 'guest_' + Date.now(), 
      personaId, 
      systemInstruction || ''
    );
    
    res.json({
      ok: true,
      data: {
        sessionId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/chat/sessions/:sessionId/messages
 * Send a message in a chat session
 */
export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    
    if (!message) {
      throw AppError.badRequest('Message is required');
    }

    const response = await sessionService.sendMessage(sessionId, message);
    
    res.json({
      ok: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/chat/sessions/:sessionId/stream
 * Stream a message response
 */
export const streamMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    
    if (!message) {
      throw AppError.badRequest('Message is required');
    }

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Stream the response
    await chatService.streamMessage(
      sessionId,
      message,
      (chunk: string) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
    );

    // Send completion signal
    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/chat/sessions/:sessionId
 * Get session information
 */
export const getSessionInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    
    const session = await sessionService.getSession(sessionId);
    
    if (!session) {
      throw AppError.notFound('Session');
    }

    res.json({
      ok: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/chat/analyze
 * Analyze conversation
 */
export const analyzeConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      throw AppError.badRequest('Messages array is required');
    }

    const analysis = await analyzer.analyze(messages);
    
    res.json({
      ok: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/chat/feedback
 * Get realtime feedback for a user message
 */
export const getRealtimeFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lastUserMessage, lastAiMessage } = req.body;
    
    if (!lastUserMessage) {
      throw AppError.badRequest('Last user message is required');
    }

    const feedback = await chatService.getRealtimeFeedback(
      lastUserMessage,
      lastAiMessage
    );
    
    res.json({
      ok: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/chat/coach-suggestion
 * Get AI coach suggestion for the conversation
 */
export const getCoachSuggestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      throw AppError.badRequest('Messages array is required');
    }

    const suggestion = await chatService.getCoachSuggestion(messages);
    
    res.json({
      ok: true,
      data: suggestion
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/chat/sessions/:sessionId/end
 * End conversation and trigger analysis
 */
export const endConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    
    // End the session
    await chatService.endSession(sessionId);
    
    res.json({
      ok: true,
      data: {
        message: 'Conversation ended'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/chat/sessions/:sessionId/analyze
 * Analyze and save conversation to database
 */
export const analyzeAndSave = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    
    // Trigger automatic analysis
    await analyzer.analyzeAndSave(sessionId);
    
    // Get the analysis result
    const analysis = await chatService.getConversationAnalysis(sessionId);
    
    res.json({
      ok: true,
      data: {
        message: 'Conversation ended and analyzed',
        analysis
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/chat/history/:userId
 * 사용자의 대화 히스토리 조회
 */
export const getConversationHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, filter } = req.query;
    
    const history = await chatService.getUserConversationHistory(
      userId,
      Number(page),
      Number(limit),
      filter as string
    );
    
    res.json({
      ok: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/chat/history/:userId/conversation/:conversationId
 * 특정 대화 상세 조회
 */
export const getConversationDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, conversationId } = req.params;
    
    const detail = await chatService.getConversationDetail(
      userId,
      conversationId
    );
    
    res.json({
      ok: true,
      data: detail
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/chat/history/:userId/stats
 * 사용자의 대화 통계 조회
 */
export const getConversationStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    
    const stats = await chatService.getConversationStats(userId);
    
    res.json({
      ok: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};