import { ConversationAnalyzer } from '../ConversationAnalyzer.js';
import { Message } from '@qupid/core';
import { openai } from '../../../../shared/infra/openai.js';

// Mock dependencies
jest.mock('../../../../shared/infra/openai.js');
jest.mock('../../../../config/supabase.js', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          single: jest.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } }))
        }))
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

jest.mock('../../../notification/app/NotificationService.js', () => ({
  NotificationService: jest.fn().mockImplementation(() => ({
    createAchievementNotification: jest.fn().mockResolvedValue(undefined)
  }))
}));

describe('ConversationAnalyzer', () => {
  let analyzer: ConversationAnalyzer;

  beforeEach(() => {
    analyzer = new ConversationAnalyzer();
    jest.clearAllMocks();
  });

  describe('analyze', () => {
    it('should return default analysis for insufficient messages', async () => {
      const messages: Message[] = [
        { sender: 'user', text: '안녕하세요' }
      ];

      const analysis = await analyzer.analyze(messages);

      expect(analysis.totalScore).toBe(75);
      expect(analysis.friendliness.score).toBe(80);
      expect(analysis.curiosity.score).toBe(75);
      expect(analysis.empathy.score).toBe(70);
      expect(analysis.feedback).toContain('좋은 대화였어요');
    });

    it('should analyze conversation with OpenAI', async () => {
      const messages: Message[] = [
        { sender: 'user', text: '안녕하세요! 오늘 어떠세요?' },
        { sender: 'ai', text: '안녕하세요! 저는 좋아요, 당신은요?' },
        { sender: 'user', text: '저도 좋아요! 주말 계획 있으세요?' }
      ];

      const mockAnalysis = {
        totalScore: 85,
        friendliness: { score: 90, feedback: '매우 친근한 대화예요!' },
        curiosity: { score: 85, feedback: '좋은 질문을 하셨어요!' },
        empathy: { score: 80, feedback: '상대를 배려하는 모습이 좋아요!' },
        feedback: '훌륭한 대화였어요! 계속 이렇게 대화해보세요.',
        strengths: ['친근한 인사', '적절한 질문'],
        improvements: ['더 깊은 대화', '감정 표현 추가']
      };

      (openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{
          message: { content: JSON.stringify(mockAnalysis) }
        }]
      });

      const analysis = await analyzer.analyze(messages);

      expect(analysis.totalScore).toBe(85);
      expect(analysis.friendliness.score).toBe(90);
      expect(analysis.positivePoints).toEqual(['친근한 인사', '적절한 질문']);
      expect(analysis.pointsToImprove).toHaveLength(2);
      expect(analysis.pointsToImprove[0]).toHaveProperty('topic');
      expect(analysis.pointsToImprove[0]).toHaveProperty('suggestion');
    });

    it('should handle OpenAI error gracefully', async () => {
      const messages: Message[] = [
        { sender: 'user', text: '안녕하세요' },
        { sender: 'ai', text: '안녕하세요!' },
        { sender: 'user', text: '반가워요' }
      ];

      (openai.chat.completions.create as jest.Mock).mockRejectedValue(
        new Error('OpenAI API error')
      );

      const analysis = await analyzer.analyze(messages);

      // Should return default analysis on error
      expect(analysis.totalScore).toBe(75);
      expect(analysis.feedback).toContain('좋은 대화였어요');
    });
  });

  describe('pointsToImprove mapping', () => {
    it('should correctly map string array to object array', async () => {
      const messages: Message[] = [
        { sender: 'user', text: '안녕' },
        { sender: 'ai', text: '안녕하세요' },
        { sender: 'user', text: '뭐해?' }
      ];

      const mockAnalysis = {
        totalScore: 70,
        friendliness: { score: 75, feedback: '친근해요' },
        curiosity: { score: 70, feedback: '질문이 좋아요' },
        empathy: { score: 65, feedback: '공감이 필요해요' },
        feedback: '더 노력해보세요',
        strengths: ['간단명료'],
        improvements: ['더 정중한 표현', '구체적인 질문']
      };

      (openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{
          message: { content: JSON.stringify(mockAnalysis) }
        }]
      });

      const analysis = await analyzer.analyze(messages);

      expect(analysis.pointsToImprove).toHaveLength(2);
      expect(analysis.pointsToImprove[0]).toEqual({
        topic: '더 정중한 표현',
        suggestion: '더 정중한 표현'
      });
      expect(analysis.pointsToImprove[1]).toEqual({
        topic: '구체적인 질문',
        suggestion: '구체적인 질문'
      });
    });
  });
});