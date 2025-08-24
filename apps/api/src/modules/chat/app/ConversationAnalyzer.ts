import { supabase } from '../../../config/supabase.js';
import { openai } from '../../../shared/infra/openai.js';
import { Message, ConversationAnalysis } from '@qupid/core';

export class ConversationAnalyzer {
  /**
   * 대화 분석 (메모리에서만)
   */
  async analyze(messages: Message[]): Promise<ConversationAnalysis> {
    if (messages.length < 2) {
      return this.getDefaultAnalysis();
    }

    const conversationText = messages
      .map(m => `${m.sender === 'user' ? '사용자' : 'AI'}: ${m.text}`)
      .join('\n');

    const prompt = `다음 연애 대화를 분석하고 JSON 형식으로 평가해주세요:

${conversationText}

평가 기준:
1. 친근함 (0-100): 따뜻하고 편안한 대화 분위기
2. 호기심 (0-100): 질문의 양과 질, 상대에 대한 관심
3. 공감력 (0-100): 상대의 감정 이해와 반응

JSON 형식:
{
  "totalScore": 전체 점수 (0-100),
  "friendliness": { "score": 점수, "feedback": "피드백" },
  "curiosity": { "score": 점수, "feedback": "피드백" },
  "empathy": { "score": 점수, "feedback": "피드백" },
  "strengths": ["강점1", "강점2"],
  "improvements": ["개선점1", "개선점2"],
  "feedback": "전체적인 피드백 (2-3문장)",
  "badges": []
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional conversation analyzer. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      return {
        totalScore: result.totalScore || 75,
        friendliness: result.friendliness || { score: 80, feedback: '친근한 대화였어요!' },
        curiosity: result.curiosity || { score: 75, feedback: '호기심을 보여주셨어요!' },
        empathy: result.empathy || { score: 70, feedback: '공감 능력을 보여주셨어요!' },
        strengths: result.strengths || ['친근한 태도', '적극적인 참여'],
        improvements: result.improvements || ['더 많은 질문하기', '감정 표현 더하기'],
        feedback: result.feedback || '좋은 대화였어요! 계속 연습하면 더 좋아질 거예요.',
        badges: result.badges || []
      };
    } catch (error) {
      console.error('Analysis error:', error);
      return this.getDefaultAnalysis();
    }
  }

  private getDefaultAnalysis(): ConversationAnalysis {
    return {
      totalScore: 75,
      friendliness: { score: 80, feedback: '친근한 대화였어요!' },
      curiosity: { score: 75, feedback: '호기심을 보여주셨어요!' },
      empathy: { score: 70, feedback: '공감 능력을 보여주셨어요!' },
      strengths: ['친근한 태도', '적극적인 참여'],
      improvements: ['더 많은 질문하기', '감정 표현 더하기'],
      feedback: '좋은 대화였어요! 계속 연습하면 더 좋아질 거예요.',
      badges: []
    };
  }

  /**
   * 대화 분석 및 DB 저장
   */
  async analyzeAndSave(conversationId: string): Promise<void> {
    try {
      // Get all messages from the conversation
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true });

      if (error || !messages || messages.length < 2) {
        console.log('Not enough messages to analyze');
        return;
      }

      // Calculate basic metrics
      const userMessages = messages.filter(m => m.sender === 'user');
      const aiMessages = messages.filter(m => m.sender === 'ai');
      
      const totalUserWords = userMessages.reduce((sum, m) => 
        sum + m.content.split(' ').length, 0);
      const avgUserMessageLength = totalUserWords / userMessages.length;
      
      // Calculate scores based on simple heuristics
      const questionCount = userMessages.filter(m => 
        m.content.includes('?')).length;
      const curiosityScore = Math.min(100, (questionCount / userMessages.length) * 150);
      
      const empathyKeywords = ['이해', '공감', '맞아', '그렇', '알아', '느낌'];
      const empathyCount = userMessages.filter(m => 
        empathyKeywords.some(k => m.content.includes(k))).length;
      const empathyScore = Math.min(100, (empathyCount / userMessages.length) * 120);
      
      const friendlinessScore = Math.min(100, 
        avgUserMessageLength > 5 ? 70 + Math.random() * 30 : 40 + Math.random() * 30);
      
      const totalScore = Math.round((curiosityScore + empathyScore + friendlinessScore) / 3);

      // Update conversation with end time
      await supabase
        .from('conversations')
        .update({ 
          ended_at: new Date().toISOString() 
        })
        .eq('id', conversationId);

      // Save analysis
      const { error: analysisError } = await supabase
        .from('conversation_analysis')
        .insert({
          conversation_id: conversationId,
          overall_score: totalScore,
          affinity_score: Math.round((friendlinessScore + empathyScore) / 2),
          improvements: totalScore < 70 ? ['더 많은 질문하기', '공감 표현 늘리기'] : [],
          achievements: totalScore > 70 ? ['좋은 대화 진행', '적절한 질문'] : [],
          tips: ['상대방의 관심사에 대해 질문해보세요', '자신의 경험을 공유해보세요'],
          analyzed_at: new Date().toISOString()
        });

      if (analysisError) {
        console.error('Failed to save analysis:', analysisError);
      }

      // Update user stats
      await this.updateUserStats(conversationId, totalScore);
    } catch (error) {
      console.error('Failed to analyze conversation:', error);
    }
  }

  private async updateUserStats(conversationId: string, score: number): Promise<void> {
    try {
      // Get user ID from conversation
      const { data: conversation } = await supabase
        .from('conversations')
        .select('user_id')
        .eq('id', conversationId)
        .single();

      if (!conversation) return;

      // Get current user stats
      const { data: user } = await supabase
        .from('users')
        .select('total_conversations, average_score')
        .eq('id', conversation.user_id)
        .single();

      if (!user) return;

      // Calculate new average
      const newTotal = (user.total_conversations || 0) + 1;
      const currentAvg = user.average_score || 0;
      const newAvg = ((currentAvg * (newTotal - 1)) + score) / newTotal;

      // Update user stats
      await supabase
        .from('users')
        .update({
          total_conversations: newTotal,
          average_score: Math.round(newAvg)
        })
        .eq('id', conversation.user_id);

      // Check for badge achievements
      await this.checkBadgeAchievements(conversation.user_id, newTotal, newAvg);
    } catch (error) {
      console.error('Failed to update user stats:', error);
    }
  }

  private async checkBadgeAchievements(
    userId: string, 
    totalConversations: number, 
    avgScore: number
  ): Promise<void> {
    try {
      // Check conversation count badges
      if (totalConversations === 1) {
        await this.awardBadge(userId, 'first-chat'); // 첫 대화
      } else if (totalConversations === 10) {
        await this.awardBadge(userId, 'conversation-10'); // 대화 10회
      }

      // Check score badges
      if (avgScore >= 80 && totalConversations >= 5) {
        await this.awardBadge(userId, 'high-scorer'); // 고득점자
      }
    } catch (error) {
      console.error('Failed to check badges:', error);
    }
  }

  private async awardBadge(userId: string, badgeSlug: string): Promise<void> {
    try {
      // Get badge ID
      const { data: badge } = await supabase
        .from('badges')
        .select('id')
        .eq('slug', badgeSlug)
        .single();

      if (!badge) return;

      // Check if already has badge
      const { data: existing } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', badge.id)
        .single();

      if (existing) return;

      // Award badge
      await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badge.id,
          acquired_at: new Date().toISOString()
        });

      console.log(`Badge '${badgeSlug}' awarded to user ${userId}`);
    } catch (error) {
      console.error('Failed to award badge:', error);
    }
  }
}