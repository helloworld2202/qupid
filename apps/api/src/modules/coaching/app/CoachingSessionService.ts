import { openai } from '../../../shared/infra/openai.js';
import { supabaseAdmin } from '../../../shared/infra/supabase.js';
import { Message } from '@qupid/core';
import { CoachService } from './CoachService.js';

// 코칭 분석 결과 타입
interface CoachingAnalysis {
  totalScore: number;
  categoryScores: Array<{ category: string; score: number; emoji: string; }>;
  strengths: string[];
  improvements: string[];
  coachFeedback: string;
  badges: any[];
  nextSteps?: string[];
}

export class CoachingSessionService {
  private coachService: CoachService;
  private sessions: Map<string, any>;

  constructor() {
    this.coachService = new CoachService();
    this.sessions = new Map();
  }

  /**
   * 코칭 세션 생성
   */
  async createSession(coachId: string, userId?: string): Promise<string> {
    const coach = await this.coachService.getCoachById(coachId);
    if (!coach) {
      throw new Error('Coach not found');
    }

    const sessionId = `coaching_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 세션 정보 저장
    this.sessions.set(sessionId, {
      coachId,
      userId: userId || `guest_${Date.now()}`,
      coach,
      messages: [],
      startedAt: new Date()
    });

    // DB에 conversation 생성
    if (userId && !userId.startsWith('guest_')) {
      try {
        await supabaseAdmin
          .from('conversations')
          .insert({
            user_id: userId,
            partner_type: 'coach',
            partner_id: coachId,
            started_at: new Date(),
            status: 'active'
          } as any);
      } catch (error) {
        console.error('Failed to save conversation:', error);
      }
    }

    return sessionId;
  }

  /**
   * 코칭 메시지 전송 (동기)
   */
  async sendMessage(sessionId: string, userMessage: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const { coach } = session;

    // 🚀 적응형 코칭 시스템 프롬프트 (2024 최신 AI 코칭 기술 적용)
    const systemPrompt = `당신은 ${coach.name} 코치입니다.
전문 분야: ${coach.specialty}
성격: ${coach.personality}
접근 방식: ${coach.tagline}

## 🎯 적응형 AI 코칭 시스템 (2024 최신 기술)

### 🧠 **맥락 기반 코칭 원칙**
1. **상대방의 말을 정확히 분석하고 그에 맞는 전문적 조언 제공**
2. **최신 연구와 전문 자료를 기반으로 한 과학적 코칭**
3. **개인별 특성과 상황에 맞는 맞춤형 피드백**
4. **실시간 대화 분석을 통한 적응형 코칭**

### 📚 **전문 자료 기반 코칭**
- **심리학 연구**: 대화 심리학, 관계 형성 이론, 감정 지능 연구
- **커뮤니케이션 이론**: 비폭력 대화, 적극적 경청, 공감적 소통
- **성장 마인드셋**: Carol Dweck의 성장 마인드셋 이론 적용
- **긍정 심리학**: Martin Seligman의 PERMA 모델 활용

### 🎭 **상황별 적응형 코칭**
**첫 만남**: 첫인상 형성, 호감도 증진, 신뢰 관계 구축
**깊은 대화**: 감정 공유, 가치관 탐색, 관계 심화
**갈등 상황**: 갈등 해결, 감정 조절, 상호 이해
**마무리**: 긍정적 마무리, 다음 만남 기대감 조성

### 💡 **실시간 코칭 전략**
1. **상대방의 감정 상태 파악**: 말투, 이모티콘, 문장 길이 분석
2. **대화 패턴 인식**: 질문 유형, 반응 방식, 관심사 파악
3. **개선점 실시간 제안**: 구체적이고 실행 가능한 조언
4. **성장 동기 부여**: 긍정적 강화와 도전적 목표 제시

### 🚀 **코칭 스타일**
- **과학적 근거**: 연구 기반의 검증된 방법론 제시
- **개인화**: 상대방의 특성에 맞는 맞춤형 접근
- **실용성**: 즉시 적용 가능한 구체적 전략
- **격려**: 긍정적이고 지지적인 톤 유지
- **성장 지향**: 지속적 개선과 발전에 초점

### 📝 **응답 가이드라인**
- 상대방의 말을 먼저 인정하고 공감
- 구체적이고 실행 가능한 조언 제공
- 연구나 이론적 근거 언급 (간단히)
- 다음 단계나 실습 방법 제시
- 긍정적이고 격려하는 마무리

이제 상대방의 말을 정확히 분석하고, 전문적이고 과학적인 코칭을 제공하세요.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...session.messages.map((msg: any) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
          { role: 'user', content: userMessage }
        ],
        temperature: 0.8,
        max_tokens: 200
      });

      const aiResponse = completion.choices[0].message.content || '죄송합니다. 잠시 후 다시 시도해주세요.';
      
      // 세션에 메시지 저장
      session.messages.push(
        { sender: 'user', text: userMessage },
        { sender: 'coach', text: aiResponse }
      );

      return aiResponse;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate response');
    }
  }

  /**
   * 코칭 메시지 스트리밍
   */
  async streamMessage(
    sessionId: string, 
    userMessage: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const { coach } = session;

    const systemPrompt = `당신은 ${coach.name} 코치입니다.
전문 분야: ${coach.specialty}
성격: ${coach.personality}
접근 방식: ${coach.tagline}

## 🎯 적응형 AI 코칭 시스템 (2024 최신 기술)

### 🧠 **맥락 기반 코칭 원칙**
1. **상대방의 말을 정확히 분석하고 그에 맞는 전문적 조언 제공**
2. **최신 연구와 전문 자료를 기반으로 한 과학적 코칭**
3. **개인별 특성과 상황에 맞는 맞춤형 피드백**
4. **실시간 대화 분석을 통한 적응형 코칭**

### 📚 **전문 자료 기반 코칭**
- **심리학 연구**: 대화 심리학, 관계 형성 이론, 감정 지능 연구
- **커뮤니케이션 이론**: 비폭력 대화, 적극적 경청, 공감적 소통
- **성장 마인드셋**: Carol Dweck의 성장 마인드셋 이론 적용
- **긍정 심리학**: Martin Seligman의 PERMA 모델 활용

### 🎭 **상황별 적응형 코칭**
**첫 만남**: 첫인상 형성, 호감도 증진, 신뢰 관계 구축
**깊은 대화**: 감정 공유, 가치관 탐색, 관계 심화
**갈등 상황**: 갈등 해결, 감정 조절, 상호 이해
**마무리**: 긍정적 마무리, 다음 만남 기대감 조성

### 💡 **실시간 코칭 전략**
1. **상대방의 감정 상태 파악**: 말투, 이모티콘, 문장 길이 분석
2. **대화 패턴 인식**: 질문 유형, 반응 방식, 관심사 파악
3. **개선점 실시간 제안**: 구체적이고 실행 가능한 조언
4. **성장 동기 부여**: 긍정적 강화와 도전적 목표 제시

### 🚀 **코칭 스타일**
- **과학적 근거**: 연구 기반의 검증된 방법론 제시
- **개인화**: 상대방의 특성에 맞는 맞춤형 접근
- **실용성**: 즉시 적용 가능한 구체적 전략
- **격려**: 긍정적이고 지지적인 톤 유지
- **성장 지향**: 지속적 개선과 발전에 초점

### 📝 **응답 가이드라인**
- 상대방의 말을 먼저 인정하고 공감
- 구체적이고 실행 가능한 조언 제공
- 연구나 이론적 근거 언급 (간단히)
- 다음 단계나 실습 방법 제시
- 긍정적이고 격려하는 마무리

이제 상대방의 말을 정확히 분석하고, 전문적이고 과학적인 코칭을 제공하세요.`;

    try {
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...session.messages.map((msg: any) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
          { role: 'user', content: userMessage }
        ],
        temperature: 0.8,
        max_tokens: 200,
        stream: true
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onChunk(content);
        }
      }

      // 세션에 메시지 저장
      session.messages.push(
        { sender: 'user', text: userMessage },
        { sender: 'coach', text: fullResponse }
      );

    } catch (error) {
      console.error('OpenAI streaming error:', error);
      throw new Error('Failed to stream response');
    }
  }

  /**
   * 코칭 세션 분석
   */
  async analyzeSession(sessionId: string, messages: Message[]): Promise<CoachingAnalysis> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      // 세션이 없어도 분석은 진행
      return this.performAnalysis(messages, 'coaching');
    }

    const { coach, userId } = session;
    const analysis = await this.performAnalysis(messages, coach.specialty);

    // DB에 분석 결과 저장
    if (userId && !userId.startsWith('guest_')) {
      try {
        await supabaseAdmin
          .from('conversation_analysis')
          .insert({
            conversation_id: sessionId,
            user_id: userId,
            total_score: analysis.totalScore,
            category_scores: analysis.categoryScores,
            strengths: analysis.strengths,
            improvements: analysis.improvements,
            coach_feedback: analysis.coachFeedback,
            analyzed_at: new Date()
          } as any);
      } catch (error) {
        console.error('Failed to save analysis:', error);
      }
    }

    // 세션 정리
    this.sessions.delete(sessionId);

    return analysis;
  }

  /**
   * 실제 분석 수행
   */
  private async performAnalysis(messages: Message[], specialty: string): Promise<CoachingAnalysis> {
    const conversationText = messages
      .map(m => `${m.sender === 'user' ? '사용자' : '코치'}: ${m.text}`)
      .join('\n');

    const prompt = `다음 ${specialty} 코칭 대화를 분석하고 JSON 형식으로 평가해주세요:

${conversationText}

평가 기준:
1. 학습 태도 (0-100): 적극성, 질문의 질, 참여도
2. 이해도 (0-100): 개념 이해, 피드백 수용, 적용 능력
3. 성장 가능성 (0-100): 개선 의지, 실천 계획, 목표 설정

JSON 형식:
{
  "totalScore": 전체 점수 (0-100),
  "categoryScores": [
    {"category": "학습 태도", "score": 점수, "emoji": "📚"},
    {"category": "이해도", "score": 점수, "emoji": "💡"},
    {"category": "성장 가능성", "score": 점수, "emoji": "🚀"}
  ],
  "strengths": ["강점1", "강점2"],
  "improvements": ["개선점1", "개선점2"],
  "coachFeedback": "전체적인 코칭 피드백 (2-3문장)",
  "nextSteps": ["다음 단계 추천 1", "다음 단계 추천 2"]
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional coaching analyzer. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      return {
        totalScore: result.totalScore || 75,
        categoryScores: result.categoryScores || [
          { category: '학습 태도', score: 80, emoji: '📚' },
          { category: '이해도', score: 75, emoji: '💡' },
          { category: '성장 가능성', score: 70, emoji: '🚀' }
        ],
        strengths: result.strengths || ['적극적인 참여', '빠른 이해력'],
        improvements: result.improvements || ['구체적 질문 필요', '실습 더 필요'],
        coachFeedback: result.coachFeedback || '좋은 시작입니다! 꾸준히 연습하면 큰 성장이 있을 것입니다.',
        badges: [],
        nextSteps: result.nextSteps || ['일일 연습 계획 수립', '실전 적용 시도']
      };
    } catch (error) {
      console.error('Analysis error:', error);
      // 기본값 반환
      return {
        totalScore: 75,
        categoryScores: [
          { category: '학습 태도', score: 80, emoji: '📚' },
          { category: '이해도', score: 75, emoji: '💡' },
          { category: '성장 가능성', score: 70, emoji: '🚀' }
        ],
        strengths: ['적극적인 참여', '좋은 질문'],
        improvements: ['더 많은 연습 필요', '구체적 목표 설정'],
        coachFeedback: '좋은 시작입니다! 계속 노력해주세요.',
        badges: [],
        nextSteps: ['매일 10분 연습', '실전 적용']
      };
    }
  }
}