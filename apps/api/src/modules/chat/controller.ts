import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ChatService } from './app/ChatService.js';
import { ChatServiceStreaming } from './app/ChatServiceStreaming.js';
import { ConversationAnalyzer } from './app/ConversationAnalyzer.js';
import { AuthenticatedRequest } from '../../shared/middleware/authenticate.js';
import { Message } from '@qupid/core';

const chatService = new ChatService();
const streamingService = new ChatServiceStreaming();
const analyzer = new ConversationAnalyzer();

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
    // 테스트용 사용자 ID (실제로는 인증된 사용자 ID 사용)
    const userId = req.user?.id || 'a6d4ac3f-b8cf-41eb-b744-0279b12ea192';
    
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
    const { sessionId } = req.params;
    const { messages } = analyzeConversationSchema.parse(req.body);
    
    const analysis = await chatService.analyzeConversation(
      messages.map(m => ({
        ...m,
        timestamp: m.timestamp ? new Date(m.timestamp) : undefined
      })) as Message[]
    );
    
    // Save analysis to database if sessionId is provided
    if (sessionId) {
      await chatService.saveConversationAnalysis(sessionId, analysis);
    }
    
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

// Streaming message endpoint
const streamMessageSchema = z.object({
  message: z.string().min(1).max(1000),
  systemInstruction: z.string(),
  previousMessages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional().default([])
});

export const streamMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    const { message, systemInstruction, previousMessages } = streamMessageSchema.parse(req.body);
    
    // Stream response
    await streamingService.streamMessage(
      sessionId,
      message,
      systemInstruction,
      previousMessages,
      res
    );
  } catch (error) {
    // Error handling is done inside streamMessage
    if (!res.headersSent) {
      next(error);
    }
  }
};

// End conversation and trigger analysis
export const endConversation = async (
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