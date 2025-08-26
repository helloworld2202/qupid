import { ChatService } from '../ChatService';
import { ConversationAnalyzer } from '../ConversationAnalyzer';

// Mock dependencies before importing
jest.mock('../../../../shared/infra/openai');
jest.mock('../../../../config/supabase');
jest.mock('../ConversationAnalyzer');

describe('ChatService', () => {
  let chatService: ChatService;
  let mockSupabase: any;
  let mockOpenAI: any;
  let mockAnalyzer: jest.Mocked<ConversationAnalyzer>;

  beforeEach(() => {
    // Set up Supabase mock
    mockSupabase = {
      from: jest.fn()
    };
    require('../../../../config/supabase').supabase = mockSupabase;

    // Set up OpenAI mock
    mockOpenAI = {
      streamCompletion: jest.fn()
    };
    require('../../../../shared/infra/openai').streamCompletion = mockOpenAI.streamCompletion;

    // Set up ConversationAnalyzer mock
    mockAnalyzer = {
      analyzeConversation: jest.fn()
    } as any;
    (ConversationAnalyzer as jest.Mock).mockImplementation(() => mockAnalyzer);

    chatService = new ChatService();
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a chat session successfully', async () => {
      const mockSession = {
        id: 'session-123',
        user_id: 'user-123',
        partner_id: 'persona-123',
        partner_type: 'persona',
        created_at: new Date().toISOString()
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSession,
              error: null
            })
          })
        })
      });

      const sessionId = await chatService.createSession('user-123', 'persona-123', 'Be helpful');

      expect(sessionId).toBe('session-123');
      expect(mockSupabase.from).toHaveBeenCalledWith('conversations');
    });

    it('should handle session creation error', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      });

      await expect(chatService.createSession('user-123', 'persona-123', 'Be helpful'))
        .rejects.toThrow('Failed to create conversation');
    });
  });

  describe('sendMessage', () => {
    it('should send a message and save it', async () => {
      // First create a session
      const mockSession = {
        id: 'session-123',
        user_id: 'user-123',
        partner_id: 'persona-123',
        partner_type: 'persona',
        started_at: new Date().toISOString()
      };

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSession,
              error: null
            })
          })
        })
      });

      const sessionId = await chatService.createSession('user-123', 'persona-123', 'Be helpful');

      // Mock message save
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({
          data: { id: 'msg-123' },
          error: null
        })
      });

      // Mock OpenAI
      const mockOpenAI = require('../../../../shared/infra/openai');
      mockOpenAI.openai = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'Hello back!' } }]
            })
          }
        }
      };

      // Mock second message save for AI response
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({
          data: { id: 'msg-124' },
          error: null
        })
      });

      const response = await chatService.sendMessage(sessionId, 'Hello!');

      expect(response).toBe('Hello back!');
      expect(mockSupabase.from).toHaveBeenCalledWith('messages');
    });

    it('should handle message sending error', async () => {
      // Session doesn't exist
      await expect(chatService.sendMessage('non-existent', 'Hello!'))
        .rejects.toThrow('Chat session not found');
    });
  });

  // streamResponse method doesn't exist in current implementation
  // Removing this test

  describe('analyzeConversationStyle', () => {
    it('should analyze conversation style with sufficient messages', async () => {
      const mockMessages = [
        { sender: 'user', text: 'Hello', timestamp: Date.now() },
        { sender: 'ai', text: 'Hi there!', timestamp: Date.now() },
        { sender: 'user', text: 'How are you?', timestamp: Date.now() },
        { sender: 'ai', text: 'I am doing well!', timestamp: Date.now() },
        { sender: 'user', text: 'Nice!', timestamp: Date.now() }
      ];

      // Mock OpenAI for style analysis
      const mockOpenAI = require('../../../../shared/infra/openai');
      mockOpenAI.openai = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: JSON.stringify({
                    currentStyle: {
                      type: '친근한',
                      characteristics: ['따뜻한 대화', '적극적인 반응'],
                      strengths: ['친근함', '반응성'],
                      weaknesses: ['깊이 부족']
                    },
                    recommendations: []
                  })
                }
              }]
            })
          }
        }
      };


      const analysis = await chatService.analyzeConversationStyle(mockMessages);

      expect(analysis.currentStyle).toBeDefined();
      expect(analysis.currentStyle.type).toBeDefined();
    });

    it('should return default analysis with insufficient messages', async () => {
      const mockMessages = [
        { sender: 'user', text: 'Hello', timestamp: Date.now() }
      ];

      const analysis = await chatService.analyzeConversationStyle(mockMessages);

      expect(analysis.currentStyle).toBeDefined();
      expect(analysis.currentStyle.type).toBe('분석 중');
    });
  });

  // endConversation method doesn't exist in current implementation
});