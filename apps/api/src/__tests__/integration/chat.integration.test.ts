import request from 'supertest';
import express from 'express';
import chatRoutes from '../../modules/chat/routes.js';
import { errorHandler } from '../../shared/middleware/errorHandler.js';

// Mock dependencies
jest.mock('../../modules/chat/app/ChatService', () => ({
  ChatService: jest.fn().mockImplementation(() => ({
    createSession: jest.fn().mockResolvedValue('session-123'),
    sendMessage: jest.fn().mockResolvedValue({
      userMessage: { sender: 'user', text: 'Hello' },
      aiResponse: { sender: 'ai', text: 'Hi there!' }
    }),
    getSession: jest.fn().mockReturnValue({
      id: 'session-123',
      userId: 'user-123',
      personaId: 'persona-456'
    }),
    endSession: jest.fn().mockResolvedValue(undefined),
    getRealtimeFeedback: jest.fn().mockResolvedValue({
      isGood: true,
      message: 'Great job!',
      category: 'question'
    }),
    getCoachSuggestion: jest.fn().mockResolvedValue({
      reason: 'You could ask more questions',
      suggestion: 'Try asking about their hobbies'
    }),
    analyzeConversationStyle: jest.fn().mockResolvedValue({
      currentStyle: {
        type: 'Friendly',
        characteristics: ['warm', 'curious'],
        strengths: ['good questions'],
        weaknesses: []
      },
      recommendations: []
    })
  }))
}));

jest.mock('../../modules/chat/app/ConversationAnalyzer.js', () => ({
  ConversationAnalyzer: jest.fn().mockImplementation(() => ({
    analyze: jest.fn().mockResolvedValue({
      totalScore: 85,
      feedback: 'Great conversation!',
      friendliness: { score: 90, feedback: 'Very friendly!' },
      curiosity: { score: 85, feedback: 'Good questions!' },
      empathy: { score: 80, feedback: 'Shows empathy!' },
      positivePoints: ['Friendly', 'Curious'],
      pointsToImprove: [
        { topic: 'depth', suggestion: 'Ask deeper questions' }
      ]
    })
  }))
}));

describe('Chat API Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/chat', chatRoutes);
    app.use(errorHandler);
  });

  describe('POST /api/v1/chat/sessions', () => {
    it('should create a new chat session', async () => {
      const response = await request(app)
        .post('/api/v1/chat/sessions')
        .send({
          userId: 'user-123',
          personaId: 'persona-456',
          systemInstruction: 'Be helpful'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ok', true);
      expect(response.body.data).toHaveProperty('sessionId', 'session-123');
    });

    it('should return error if personaId is missing', async () => {
      const response = await request(app)
        .post('/api/v1/chat/sessions')
        .send({
          userId: 'user-123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('ok', false);
      expect(response.body.error.message).toContain('Persona ID is required');
    });
  });

  describe('POST /api/v1/chat/sessions/:sessionId/messages', () => {
    it('should send a message and get response', async () => {
      const response = await request(app)
        .post('/api/v1/chat/sessions/session-123/messages')
        .send({
          message: 'Hello'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ok', true);
      expect(response.body.data).toHaveProperty('userMessage');
      expect(response.body.data).toHaveProperty('aiResponse');
      expect(response.body.data.aiResponse.text).toBe('Hi there!');
    });

    it('should return error if message is missing', async () => {
      const response = await request(app)
        .post('/api/v1/chat/sessions/session-123/messages')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('ok', false);
      expect(response.body.error.message).toContain('Message is required');
    });
  });

  describe('GET /api/v1/chat/sessions/:sessionId', () => {
    it('should get session information', async () => {
      const response = await request(app)
        .get('/api/v1/chat/sessions/session-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ok', true);
      expect(response.body.data).toHaveProperty('id', 'session-123');
      expect(response.body.data).toHaveProperty('userId', 'user-123');
    });
  });

  describe('POST /api/v1/chat/sessions/:sessionId/end', () => {
    it('should end a chat session', async () => {
      const response = await request(app)
        .post('/api/v1/chat/sessions/session-123/end');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ok', true);
      expect(response.body.data.message).toContain('Conversation ended');
    });
  });

  describe('POST /api/v1/chat/analyze', () => {
    it('should analyze conversation', async () => {
      const response = await request(app)
        .post('/api/v1/chat/analyze')
        .send({
          messages: [
            { sender: 'user', text: 'Hello' },
            { sender: 'ai', text: 'Hi there!' },
            { sender: 'user', text: 'How are you?' }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ok', true);
      expect(response.body.data).toHaveProperty('totalScore');
      expect(response.body.data).toHaveProperty('feedback');
      expect(response.body.data.totalScore).toBe(85);
    });

    it('should return error for invalid messages', async () => {
      const response = await request(app)
        .post('/api/v1/chat/analyze')
        .send({
          messages: 'not an array'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('ok', false);
    });
  });

  describe('POST /api/v1/chat/feedback', () => {
    it('should get realtime feedback', async () => {
      const response = await request(app)
        .post('/api/v1/chat/feedback')
        .send({
          lastUserMessage: 'What are your hobbies?',
          lastAiMessage: 'I enjoy reading and hiking!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ok', true);
      expect(response.body.data).toHaveProperty('isGood', true);
      expect(response.body.data).toHaveProperty('message', 'Great job!');
    });
  });

  describe('POST /api/v1/chat/coach-suggestion', () => {
    it('should get coach suggestion', async () => {
      const response = await request(app)
        .post('/api/v1/chat/coach-suggestion')
        .send({
          messages: [
            { sender: 'user', text: 'Hello' },
            { sender: 'ai', text: 'Hi!' }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ok', true);
      expect(response.body.data).toHaveProperty('reason');
      expect(response.body.data).toHaveProperty('suggestion');
    });
  });

  describe('POST /api/v1/chat/style-analysis', () => {
    it('should analyze conversation style', async () => {
      const response = await request(app)
        .post('/api/v1/chat/style-analysis')
        .send({
          messages: [
            { sender: 'user', text: 'Hello, how are you?' },
            { sender: 'ai', text: 'I am doing well, thank you!' },
            { sender: 'user', text: 'What do you like to do?' },
            { sender: 'ai', text: 'I enjoy many things!' }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ok', true);
      expect(response.body.data).toHaveProperty('currentStyle');
      expect(response.body.data.currentStyle).toHaveProperty('type', 'Friendly');
      expect(response.body.data).toHaveProperty('recommendations');
    });
  });
});