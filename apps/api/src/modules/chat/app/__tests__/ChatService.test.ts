import { ChatService } from '../ChatService.js';
import { ChatSession } from '../../domain/ChatSession.js';
import { openai } from '../../../../shared/infra/openai.js';
import supabaseAdmin from '../../../../config/supabase.js';

// Mock dependencies
jest.mock('../../../../shared/infra/openai.js');
jest.mock('../../../../config/supabase.js', () => ({
  default: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null }))
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  }
}));

describe('ChatService', () => {
  let chatService: ChatService;

  beforeEach(() => {
    chatService = new ChatService();
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a new chat session', async () => {
      const userId = 'user123';
      const personaId = 'persona456';
      const systemInstruction = 'Be helpful';

      const sessionId = await chatService.createSession(userId, personaId, systemInstruction);

      expect(sessionId).toMatch(/^chat_\d+_[a-z0-9]+$/);
      expect(chatService.getSession(sessionId)).toBeDefined();
    });

    it('should create session with default system instruction', async () => {
      const sessionId = await chatService.createSession('user123', 'persona456');
      
      const session = chatService.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.systemInstruction).toBe('You are a helpful AI assistant.');
    });
  });

  describe('getSession', () => {
    it('should return existing session', async () => {
      const sessionId = await chatService.createSession('user123', 'persona456');
      const session = chatService.getSession(sessionId);

      expect(session).toBeInstanceOf(ChatSession);
      expect(session?.userId).toBe('user123');
      expect(session?.personaId).toBe('persona456');
    });

    it('should return undefined for non-existent session', () => {
      const session = chatService.getSession('non-existent-id');
      expect(session).toBeUndefined();
    });
  });

  describe('sendMessage', () => {
    it('should send message and get AI response', async () => {
      const mockResponse = 'Hello! How can I help you?';
      (openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: mockResponse } }]
      });

      const sessionId = await chatService.createSession('user123', 'persona456');
      const response = await chatService.sendMessage(sessionId, 'Hello');

      expect(response).toEqual({
        userMessage: { sender: 'user', text: 'Hello' },
        aiResponse: { sender: 'ai', text: mockResponse }
      });
    });

    it('should throw error for invalid session', async () => {
      await expect(chatService.sendMessage('invalid-id', 'Hello'))
        .rejects.toThrow();
    });
  });

  describe('getRealtimeFeedback', () => {
    it('should return positive feedback for good messages', async () => {
      const feedback = await chatService.getRealtimeFeedback(
        '상대방의 취미에 대해 궁금해요. 주말에는 보통 뭐하면서 시간을 보내세요?',
        '저는 주말에 운동하는 걸 좋아해요!'
      );

      expect(feedback).toHaveProperty('isGood');
      expect(feedback).toHaveProperty('message');
      expect(feedback).toHaveProperty('category');
    });

    it('should return feedback even without AI message', async () => {
      const feedback = await chatService.getRealtimeFeedback('안녕하세요!');
      
      expect(feedback).toBeDefined();
      expect(feedback.message).toBeTruthy();
    });
  });

  describe('getCoachSuggestion', () => {
    it('should provide coach suggestion based on conversation', async () => {
      const messages = [
        { sender: 'user' as const, text: '안녕하세요' },
        { sender: 'ai' as const, text: '안녕하세요! 반가워요' }
      ];

      const suggestion = await chatService.getCoachSuggestion(messages);

      expect(suggestion).toHaveProperty('reason');
      expect(suggestion).toHaveProperty('suggestion');
      expect(typeof suggestion.reason).toBe('string');
      expect(typeof suggestion.suggestion).toBe('string');
    });

    it('should return empty suggestion for empty conversation', async () => {
      const suggestion = await chatService.getCoachSuggestion([]);

      expect(suggestion.reason).toBe('');
      expect(suggestion.suggestion).toBe('');
    });
  });

  describe('endSession', () => {
    it('should end session successfully', async () => {
      const sessionId = await chatService.createSession('user123', 'persona456');
      
      await expect(chatService.endSession(sessionId))
        .resolves.not.toThrow();
    });

    it('should handle non-existent session gracefully', async () => {
      await expect(chatService.endSession('non-existent'))
        .resolves.not.toThrow();
    });
  });

  describe('analyzeConversationStyle', () => {
    it('should analyze conversation style with sufficient messages', async () => {
      const messages = [
        { sender: 'user' as const, text: '안녕하세요! 오늘 날씨가 좋네요' },
        { sender: 'ai' as const, text: '네, 정말 좋은 날씨예요!' },
        { sender: 'user' as const, text: '주말에 뭐 하실 계획이세요?' },
        { sender: 'ai' as const, text: '친구들과 캠핑 갈 예정이에요' }
      ];

      (openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              currentStyle: {
                type: '친근한',
                characteristics: ['따뜻한', '호기심 많은'],
                strengths: ['질문하기', '대화 이어가기'],
                weaknesses: ['깊이 부족']
              },
              recommendations: [{
                category: '질문하기',
                tips: ['더 구체적으로 물어보세요'],
                examples: ['어떤 캠핑장으로 가시나요?']
              }]
            })
          }
        }]
      });

      const analysis = await chatService.analyzeConversationStyle(messages);

      expect(analysis.currentStyle).toBeDefined();
      expect(analysis.currentStyle.type).toBe('친근한');
      expect(analysis.recommendations).toHaveLength(1);
      expect(analysis.recommendations[0].category).toBe('질문하기');
    });

    it('should return default analysis for insufficient messages', async () => {
      const messages = [
        { sender: 'user' as const, text: '안녕하세요' }
      ];

      const analysis = await chatService.analyzeConversationStyle(messages);

      expect(analysis.currentStyle.type).toBe('분석 중');
      expect(analysis.recommendations).toHaveLength(0);
    });
  });
});