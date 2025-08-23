import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ChatService } from './app/ChatService.js';
import { AuthenticatedRequest } from '../../shared/middleware/authenticate.js';
import { Message } from '@qupid/core';

const chatService = new ChatService();

// Validation schemas
const createSessionSchema = z.object({
  personaId: z.string(),
  systemInstruction: z.string()
});

const sendMessageSchema = z.object({
  message: z.string().min(1).max(1000)
});

const analyzeConversationSchema = z.object({
  messages: z.array(z.object({
    sender: z.enum(['user', 'ai', 'system']),
    text: z.string(),
    timestamp: z.string().optional()
  }))
});

const getRealtimeFeedbackSchema = z.object({
  lastUserMessage: z.string(),
  lastAiMessage: z.string().optional()
});

const getCoachSuggestionSchema = z.object({
  messages: z.array(z.object({
    sender: z.enum(['user', 'ai', 'system']),
    text: z.string(),
    timestamp: z.string().optional()
  }))
});

export const createSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { personaId, systemInstruction } = createSessionSchema.parse(req.body);
    const userId = req.user?.id || 'anonymous';
    
    const sessionId = await chatService.createSession(
      userId,
      personaId,
      systemInstruction
    );
    
    res.json({
      ok: true,
      data: { sessionId }
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    const { message } = sendMessageSchema.parse(req.body);
    
    const response = await chatService.sendMessage(sessionId, message);
    
    res.json({
      ok: true,
      data: { response }
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messages } = analyzeConversationSchema.parse(req.body);
    
    const analysis = await chatService.analyzeConversation(
      messages.map(m => ({
        ...m,
        timestamp: m.timestamp ? new Date(m.timestamp) : undefined
      })) as Message[]
    );
    
    res.json({
      ok: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

export const getRealtimeFeedback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lastUserMessage, lastAiMessage } = getRealtimeFeedbackSchema.parse(req.body);
    
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

export const getCoachSuggestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messages } = getCoachSuggestionSchema.parse(req.body);
    
    const suggestion = await chatService.getCoachSuggestion(
      messages.map(m => ({
        ...m,
        timestamp: m.timestamp ? new Date(m.timestamp) : undefined
      })) as Message[]
    );
    
    res.json({
      ok: true,
      data: suggestion
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    const session = chatService.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        ok: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Session not found'
        }
      });
    }
    
    res.json({
      ok: true,
      data: {
        id: session.id,
        personaId: session.personaId,
        messageCount: session.getMessageCount(),
        messages: session.getMessages()
      }
    });
  } catch (error) {
    next(error);
  }
};