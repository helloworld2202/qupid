import { openai, defaultModel } from '../../../shared/infra/openai.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { ChatSession } from '../domain/ChatSession.js';
import { Message, ConversationAnalysis, RealtimeFeedback } from '@qupid/core';
import type { ChatCompletionMessageParam } from 'openai/resources/index.js';
import { supabase } from '../../../config/supabase.js';
import { supabaseAdmin } from '../../../shared/infra/supabase.js';

export class ChatService {
  private sessions = new Map<string, ChatSession>();

  private checkMessageSafety(message: string): { isSafe: boolean; reason?: string } {
    const lowerMessage = message.toLowerCase();
    
    // 성적인 내용 감지
    const sexualKeywords = ['섹스', '성관계', '야한', '음란', '19금', '야동', '포르노', '자위', '성기', '가슴', '엉덩이'];
    if (sexualKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { isSafe: false, reason: '성적인 내용이 포함되어 있습니다.' };
    }
    
    // 혐오 발언 감지
    const hateKeywords = ['죽어', '꺼져', '병신', '미친', '씨발', '개새끼', '년', '놈', '장애', '한남', '김치녀', '맘충'];
    if (hateKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { isSafe: false, reason: '혐오 발언이나 욕설이 포함되어 있습니다.' };
    }
    
    // 개인정보 요구 감지
    const personalInfoKeywords = ['전화번호', '핸드폰', '주소', '계좌번호', '카드번호', '비밀번호', '주민등록번호'];
    if (personalInfoKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { isSafe: false, reason: '개인정보 요구는 허용되지 않습니다.' };
    }
    
    // 불법 행위 감지
    const illegalKeywords = ['마약', '대마초', '필로폰', '도박', '불법', '사기', '해킹'];
    if (illegalKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { isSafe: false, reason: '불법적인 내용이 포함되어 있습니다.' };
    }
    
    return { isSafe: true };
  }

  private buildEnhancedSystemPrompt(baseInstruction: string, conversationMode: 'normal' | 'romantic' = 'normal', conversationHistory?: string): string {
    const modeGuidelines = conversationMode === 'romantic' 
      ? this.getRomanticModeGuidelines()
      : this.getNormalModeGuidelines();

    return `# 🎭 AI 롤플레이 시스템

당신은 아래 페르소나 정보를 읽고, **그 사람이 되어** 자연스럽게 대화하는 AI입니다.

${baseInstruction}

## 🎯 롤플레이 원칙

1. **페르소나 속성을 완전히 내재화**
   - 위에 제시된 이름, 나이, 직업, 성격, MBTI, 관심사를 당신의 것으로 받아들이세요
   - "나는 [이름]이고, [나이]살이며, [직업]을 하고 있어" 같은 자기소개가 아니라, 그냥 그 사람으로서 행동하세요

2. **자연스러운 롤플레이**
   - 페르소나의 성격과 나이에 맞는 말투와 표현 사용
   - 페르소나의 직업과 관심사에 맞는 경험과 지식 공유
   - 페르소나의 MBTI 특성에 맞는 반응과 태도

3. **진짜 사람처럼 대화**
   - 짧고 간결한 문장으로 자연스럽게
   - 감정을 솔직하게 표현 ("와!", "진짜?", "어머", "헉")
   - 개인적 경험을 구체적으로 공유
   - 상대방에게 진심으로 관심 가지기

${conversationHistory ? `
## 💬 이전 대화 맥락
${conversationHistory}

**이전 대화를 자연스럽게 활용하세요:**
- 앞서 나눈 이야기를 기억하고 언급
- 상대방의 관심사나 상황을 파악하고 반응
- 관계가 발전하는 것처럼 자연스럽게 대화
` : ''}

${modeGuidelines}

## ⚡ 중요
- **규칙이나 가이드라인에 얽매이지 마세요**
- **페르소나 그 자체가 되어 자유롭게 대화하세요**
- **상대방과 진심으로 소통하세요**

이제 당신은 위의 페르소나입니다. 그 사람으로서 자연스럽게 대화를 시작하세요.`;
  }

  private getNormalModeGuidelines(): string {
    return `## 💬 일반 모드
친구처럼 편안하고 자연스러운 대화를 나누세요. 공통 관심사와 일상 이야기를 중심으로 대화하세요.`;
  }

  private getRomanticModeGuidelines(): string {
    return `## 💕 연인 모드
연인처럼 따뜻하고 애정 어린 대화를 나누세요. 자연스러운 애정 표현과 관심을 보여주세요.`;
  }

  private generateConversationContext(messages: any[]): string {
    if (messages.length <= 2) return '';
    
    // 최근 6개 메시지만 맥락으로 사용 (너무 길어지지 않도록)
    const recentMessages = messages.slice(-6);
    const context = recentMessages
      .map(msg => `${msg.sender === 'user' ? '사용자' : 'AI'}: ${msg.text}`)
      .join('\n');
    
    return context;
  }

  async createSession(
    userId: string,
    personaId: string,
    systemInstruction: string
  ): Promise<string> {
    try {
      // Create conversation in database
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          partner_type: 'persona',
          partner_id: personaId,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create conversation:', error);
        throw AppError.internal(`Failed to create conversation: ${error.message}`);
      }
      
      if (!conversation) {
        throw AppError.internal('Failed to create conversation: No data returned');
      }

      const sessionId = conversation.id;
      const session = new ChatSession(
        sessionId,
        userId,
        personaId,
        systemInstruction
      );
      
      this.sessions.set(sessionId, session);
      return sessionId;
    } catch (error) {
      console.error('🚨 Supabase connection failed, using fallback session creation:', error);
      
      // 🚀 Fallback: Supabase 연결 실패 시 메모리 기반 세션 생성
      const fallbackSessionId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const session = new ChatSession(
        fallbackSessionId,
        userId,
        personaId,
        systemInstruction
      );
      
      this.sessions.set(fallbackSessionId, session);
      console.log('✅ Fallback session created:', fallbackSessionId);
      return fallbackSessionId;
    }
  }

  async sendMessage(
    sessionId: string,
    message: string
  ): Promise<string> {
    // 메시지 안전성 검사
    const safetyCheck = this.checkMessageSafety(message);
    if (!safetyCheck.isSafe) {
      console.warn(`Unsafe message detected: ${safetyCheck.reason}`);
      return `죄송해요, 그런 대화는 할 수 없어요. 😊 ${safetyCheck.reason} 다른 주제로 이야기해볼까요?`;
    }
    
    let session = this.sessions.get(sessionId);
    
    // If session not in memory, try to load from DB
    if (!session) {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !conversation) {
        throw AppError.notFound('Chat session');
      }

      // Recreate session from DB (system_instruction은 세션 재생성 시 페르소나에서 가져옴)
      const { data: persona } = await supabase
        .from('personas')
        .select('system_instruction, personality, name, age, gender, job, mbti')
        .eq('id', conversation.partner_id)
        .single();
      
      // 🚀 페르소나 정보를 기반으로 시스템 프롬프트 생성
      const systemInstruction = persona?.system_instruction || 
        `당신은 ${persona?.age || 25}세 ${persona?.job || '일반인'}인 ${persona?.name || 'AI 친구'}입니다. ${persona?.mbti || 'ENFP'} 성격을 가지고 있으며, 자연스럽고 친근한 대화를 나누세요.`;
      session = new ChatSession(
        sessionId,
        conversation.user_id,
        conversation.partner_id,
        systemInstruction
      );
      
      // Load previous messages
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', sessionId)
        .order('timestamp', { ascending: true });

      if (messages) {
        messages.forEach(msg => {
          session!.addMessage({
            sender: msg.sender_type as 'user' | 'ai',
            text: msg.content,
            timestamp: new Date(msg.timestamp).getTime()
          });
        });
      }

      this.sessions.set(sessionId, session);
    }

    // Add user message to session
    const userMessage = {
      sender: 'user' as const,
      text: message,
      timestamp: Date.now()
    };
    session.addMessage(userMessage);

    // Save user message to database
    await this.saveMessageToDb(sessionId, userMessage);

    // 🚀 대화 맥락 생성
    const conversationContext = this.generateConversationContext(session.getMessages());
    
    // Prepare messages for OpenAI
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: this.buildEnhancedSystemPrompt(session.systemInstruction, 'normal', conversationContext)
      },
      ...session.getMessages().map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }))
    ];

    try {
      const response = await openai.chat.completions.create({
        model: defaultModel,
        messages,
        temperature: 0.9, // 더 자연스럽고 창의적인 응답
        max_tokens: 200, // 충분한 길이로 자연스러운 대화
        frequency_penalty: 0.3, // 적당한 반복 방지
        presence_penalty: 0.1, // 자연스러운 다양성
        top_p: 0.95 // 더 다양한 표현
      });

      let aiResponse = response.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';
      
      // AI 응답도 안전성 검사
      const aiSafetyCheck = this.checkMessageSafety(aiResponse);
      if (!aiSafetyCheck.isSafe) {
        console.warn(`Unsafe AI response detected: ${aiSafetyCheck.reason}`);
        aiResponse = '죄송해요, 적절하지 않은 답변이 생성되었어요. 😊 다른 주제로 이야기해볼까요?';
      }
      
      // Add AI response to session
      const aiMessage = {
        sender: 'ai' as const,
        text: aiResponse,
        timestamp: Date.now()
      };
      session.addMessage(aiMessage);

      // Save AI message to database
      await this.saveMessageToDb(sessionId, aiMessage);

      return aiResponse;
    } catch (error) {
      throw AppError.internal('Failed to generate AI response', error);
    }
  }

  async streamMessage(
    sessionId: string,
    userMessage: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw AppError.notFound('Session');
    }

    try {
      // 🚀 대화 맥락 생성
      const conversationContext = this.generateConversationContext(session.getMessages());
      
      const messages = [
        { role: 'system', content: this.buildEnhancedSystemPrompt(session.systemInstruction || '', 'normal', conversationContext) },
        ...session.getMessages().map((msg: Message) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: userMessage }
      ] as ChatCompletionMessageParam[];

      const stream = await openai.chat.completions.create({
        model: defaultModel,
        messages,
        temperature: 0.9, // 더 자연스럽고 창의적인 응답
        max_tokens: 200, // 충분한 길이로 자연스러운 대화
        frequency_penalty: 0.3, // 적당한 반복 방지
        presence_penalty: 0.1, // 자연스러운 다양성
        top_p: 0.95 // 더 다양한 표현
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

      // 메시지 저장
      const userMsg: Message = { sender: 'user', text: userMessage };
      const aiMsg: Message = { sender: 'ai', text: fullResponse };
      
      session.addMessage(userMsg);
      session.addMessage(aiMsg);
      
      // DB에 저장
      await this.saveMessageToDb(sessionId, userMsg);
      await this.saveMessageToDb(sessionId, aiMsg);
    } catch (error) {
      throw AppError.internal('Failed to stream message', error);
    }
  }

  async analyzeConversation(
    messages: Message[]
  ): Promise<ConversationAnalysis> {
    const conversationText = messages
      .map((msg) => `${msg.sender === 'user' ? '나' : '상대'}: ${msg.text}`)
      .join('\n');

    const prompt = `
    다음은 사용자와 AI 페르소나 간의 소개팅 대화입니다. 사용자의 대화 스킬을 '친근함', '호기심(질문)', '공감' 세 가지 기준으로 분석하고, 종합 점수와 함께 구체적인 피드백을 JSON 형식으로 제공해주세요. 결과는 친절하고 격려하는 톤으로 작성해주세요.

    --- 대화 내용 ---
    ${conversationText}
    --- 분석 시작 ---
    
    다음 JSON 형식으로 정확히 응답해주세요:
    {
      "totalScore": 대화 전체에 대한 100점 만점의 종합 점수 (정수),
      "feedback": "대화 전체에 대한 한 줄 요약 피드백",
      "friendliness": {
        "score": 친근함 항목 점수 (1-100, 정수),
        "feedback": "친근함에 대한 구체적인 피드백"
      },
      "curiosity": {
        "score": 호기심(질문) 항목 점수 (1-100, 정수),
        "feedback": "호기심(질문)에 대한 구체적인 피드백"
      },
      "empathy": {
        "score": 공감 능력 항목 점수 (1-100, 정수),
        "feedback": "공감 능력에 대한 구체적인 피드백"
      },
      "positivePoints": ["대화에서 잘한 점 1", "대화에서 잘한 점 2"],
      "pointsToImprove": [
        {
          "topic": "개선할 점의 주제",
          "suggestion": "구체적인 개선 방안"
        }
      ]
    }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: defaultModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert dating coach analyzing conversation skills. Always respond in valid JSON format.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const jsonText = response.choices[0]?.message?.content || '{}';
      return JSON.parse(jsonText) as ConversationAnalysis;
    } catch (error) {
      throw AppError.internal('Failed to analyze conversation', error);
    }
  }

  async getRealtimeFeedback(
    lastUserMessage: string,
    lastAiMessage?: string
  ): Promise<RealtimeFeedback | null> {
    // Only provide feedback occasionally
    if (Math.random() > 0.4) {
      return null;
    }

    const prompt = `
    A user is in a dating conversation. Analyze their last message.
    AI's last message: "${lastAiMessage || '대화 시작'}"
    User's message: "${lastUserMessage}"
    
    Return JSON:
    {
      "isGood": true/false,
      "message": "Korean feedback max 15 chars"
    }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: defaultModel,
        messages: [
          {
            role: 'system',
            content: 'Provide quick dating conversation feedback in Korean.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 100,
        response_format: { type: 'json_object' }
      });

      const jsonText = response.choices[0]?.message?.content || '{}';
      return JSON.parse(jsonText) as RealtimeFeedback;
    } catch {
      return null; // Fail silently
    }
  }

  async getCoachSuggestion(
    messages: Message[],
    persona?: any
  ): Promise<{ reason: string; suggestion: string }> {
    const conversationText = messages
      .filter((msg) => msg.sender !== 'system')
      .map((msg) => `${msg.sender === 'user' ? '나' : '상대'}: ${msg.text}`)
      .join('\n');

    // 페르소나 정보를 활용한 맞춤형 프롬프트 생성
    const personaInfo = persona ? `
    상대방 페르소나 정보:
    - 이름: ${persona.name}
    - 나이: ${persona.age}세
    - 직업: ${persona.job}
    - 성격: ${persona.mbti}
    - 관심사: ${persona.tags?.join(', ') || '일반적인 관심사'}
    - 소개: ${persona.intro || ''}
    - 대화 스타일: ${persona.conversationStyle || ''}
    ` : '';

    const prompt = `
    사용자가 대화를 이어가는데 도움이 필요합니다.
    ${personaInfo}
    
    대화:
    ${conversationText}
    
    위 페르소나 정보를 바탕으로 상대방의 성격, 관심사, 대화 스타일에 맞는 구체적인 메시지를 제안해주세요.
    
    JSON 응답:
    {
      "reason": "왜 이 제안이 좋은지 (페르소나 특성을 고려한 이유)",
      "suggestion": "상대방의 관심사와 성격에 맞는 구체적인 메시지 제안"
    }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: defaultModel,
        messages: [
          {
            role: 'system',
            content: 'You are a dating coach. Respond in Korean with JSON format.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' }
      });

      const jsonText = response.choices[0]?.message?.content || '{}';
      return JSON.parse(jsonText);
    } catch (error) {
      throw AppError.internal('Failed to get coach suggestion', error);
    }
  }

  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Save message to database
  private async saveMessageToDb(conversationId: string, message: Message): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_type: message.sender === 'user' ? 'user' : 'ai',
        content: message.text,
        timestamp: (message as any).timestamp ? new Date((message as any).timestamp).toISOString() : new Date().toISOString()
      });

    if (error) {
      console.error('Failed to save message:', error);
      // Don't throw - continue chat even if save fails
    }
  }

  // Get conversation messages from database
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Failed to load conversation history:', error);
      return [];
    }

    return data?.map(msg => ({
      sender: msg.sender_type as 'user' | 'ai',
      text: msg.content,
      timestamp: typeof msg.timestamp === 'number' ? msg.timestamp : Date.now()
    })) || [];
  }

  // Save conversation analysis to database
  async saveConversationAnalysis(
    conversationId: string,
    analysis: ConversationAnalysis
  ): Promise<void> {
    const { error } = await supabase
      .from('conversation_analysis')
      .insert({
        conversation_id: conversationId,
        total_score: analysis.totalScore,
        friendliness_score: analysis.friendliness.score,
        curiosity_score: analysis.curiosity.score,
        empathy_score: analysis.empathy.score,
        feedback: analysis.feedback,
        analyzed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to save analysis:', error);
    }
  }

  /**
   * 사용자의 대화 목록 조회
   */
  async getUserConversationHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filter?: string
  ) {
    try {
      const offset = (page - 1) * limit;
      
      let query = supabaseAdmin
        .from('conversations')
        .select(`
          *,
          messages(count),
          conversation_analysis(
            total_score,
            analyzed_at
          ),
          personas(
            name,
            avatar
          ),
          coaches(
            name,
            avatar,
            specialty
          )
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // 필터 적용
      if (filter === 'persona') {
        query = query.eq('partner_type', 'persona');
      } else if (filter === 'coach') {
        query = query.eq('partner_type', 'coach');
      } else if (filter === 'analyzed') {
        query = query.not('conversation_analysis', 'is', null);
      }

      const { data: conversations, error } = await query as any;

      if (error) throw error;

      // 데이터 포맷팅
      const formattedHistory = conversations?.map((conv: any) => ({
        id: conv.id,
        startedAt: conv.started_at,
        endedAt: conv.ended_at,
        status: conv.status,
        messageCount: conv.messages?.[0]?.count || 0,
        score: conv.conversation_analysis?.[0]?.total_score || null,
        partner: {
          type: conv.partner_type,
          id: conv.partner_id,
          name: conv.partner_type === 'persona' 
            ? conv.personas?.name 
            : conv.coaches?.name,
          avatar: conv.partner_type === 'persona'
            ? conv.personas?.avatar
            : conv.coaches?.avatar,
          specialty: conv.coaches?.specialty
        },
        duration: conv.ended_at 
          ? Math.round((new Date(conv.ended_at).getTime() - new Date(conv.started_at).getTime()) / 60000)
          : null
      })) || [];

      // 전체 개수 조회
      const { count } = await supabaseAdmin
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return {
        conversations: formattedHistory,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      throw AppError.internal('대화 히스토리를 가져오는데 실패했습니다');
    }
  }

  /**
   * 특정 대화 상세 조회
   */
  async getConversationDetail(
    userId: string,
    conversationId: string
  ) {
    try {
      // 대화 정보 조회
      const { data: conversation, error: convError } = await (supabaseAdmin as any)
        .from('conversations')
        .select(`
          *,
          messages(
            id,
            sender_type,
            content,
            timestamp
          ),
          conversation_analysis(
            *
          ),
          personas(
            name,
            avatar,
            personality
          ),
          coaches(
            name,
            avatar,
            specialty
          )
        `)
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();

      if (convError) throw convError;
      if (!conversation) throw AppError.notFound('대화를 찾을 수 없습니다');

      // 메시지 정렬
      const messages = conversation.messages
        ?.sort((a: any, b: any) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        .map((msg: any) => ({
          id: msg.id,
          sender: msg.sender_type,
          text: msg.content,
          timestamp: msg.timestamp
        })) || [];

      return {
        id: conversation.id,
        startedAt: conversation.started_at,
        endedAt: conversation.ended_at,
        status: conversation.status,
        partner: {
          type: conversation.partner_type,
          id: conversation.partner_id,
          name: conversation.partner_type === 'persona' 
            ? conversation.personas?.name 
            : conversation.coaches?.name,
          avatar: conversation.partner_type === 'persona'
            ? conversation.personas?.avatar
            : conversation.coaches?.avatar,
          specialty: conversation.coaches?.specialty
        },
        messages,
        analysis: conversation.conversation_analysis?.[0] || null,
        duration: conversation.ended_at 
          ? Math.round((new Date(conversation.ended_at).getTime() - new Date(conversation.started_at).getTime()) / 60000)
          : null
      };
    } catch (error) {
      console.error('Error fetching conversation detail:', error);
      if (error instanceof AppError) throw error;
      throw AppError.internal('대화 상세를 가져오는데 실패했습니다');
    }
  }

  /**
   * 사용자의 대화 통계 조회
   */
  async getConversationStats(userId: string) {
    try {
      // 전체 대화 수
      const { count: totalConversations } = await supabaseAdmin
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // 오늘 대화 수
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: todayConversations } = await supabaseAdmin
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('started_at', today.toISOString());

      // 이번 주 대화 수
      const weekStart = new Date();
      const dayOfWeek = weekStart.getDay();
      const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);
      
      const { count: weekConversations } = await supabaseAdmin
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('started_at', weekStart.toISOString());

      // 평균 점수
      const { data: analysisData } = await (supabaseAdmin as any)
        .from('conversation_analysis')
        .select('total_score')
        .eq('user_id', userId);

      const averageScore = analysisData && analysisData.length > 0
        ? Math.round(analysisData.reduce((sum: number, a: any) => sum + (a.total_score || 0), 0) / analysisData.length)
        : 0;

      // 가장 많이 대화한 파트너 타입
      const { data: partnerTypes } = await (supabaseAdmin as any)
        .from('conversations')
        .select('partner_type')
        .eq('user_id', userId);

      const typeCounts: Record<string, number> = {};
      partnerTypes?.forEach((conv: any) => {
        typeCounts[conv.partner_type] = (typeCounts[conv.partner_type] || 0) + 1;
      });

      const mostFrequentType = Object.entries(typeCounts)
        .sort(([, a], [, b]) => b - a)[0];

      // 최근 활동 시간
      const { data: recentConv } = await (supabaseAdmin as any)
        .from('conversations')
        .select('started_at')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      return {
        totalConversations: totalConversations || 0,
        todayConversations: todayConversations || 0,
        weekConversations: weekConversations || 0,
        averageScore,
        mostFrequentPartner: mostFrequentType ? {
          type: mostFrequentType[0],
          count: mostFrequentType[1],
          percentage: Math.round((mostFrequentType[1] / (totalConversations || 1)) * 100)
        } : null,
        lastActiveAt: recentConv?.started_at || null,
        streak: await this.calculateStreak(userId)
      };
    } catch (error) {
      console.error('Error fetching conversation stats:', error);
      throw AppError.internal('대화 통계를 가져오는데 실패했습니다');
    }
  }

  /**
   * 연속 대화 일수 계산
   */
  private async calculateStreak(userId: string): Promise<number> {
    try {
      const { data: conversations } = await (supabaseAdmin as any)
        .from('conversations')
        .select('started_at')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(30);

      if (!conversations || conversations.length === 0) return 0;

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        checkDate.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(checkDate);
        nextDate.setDate(nextDate.getDate() + 1);

        const hasConversation = conversations.some((conv: any) => {
          const convDate = new Date(conv.started_at);
          return convDate >= checkDate && convDate < nextDate;
        });

        if (hasConversation) {
          streak++;
        } else if (i > 0) {
          // 첫날이 아니고 대화가 없으면 스트릭 종료
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }

  // Get conversation analysis from database
  async getConversationAnalysis(conversationId: string): Promise<any> {
    const { data, error } = await supabase
      .from('conversation_analysis')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('analyzed_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Failed to get analysis:', error);
      return null;
    }

    return data;
  }

  // End a chat session
  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      // 세션 종료 처리
      this.sessions.delete(sessionId);
    }
  }

  // Cleanup old sessions periodically
  cleanupOldSessions(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [id, session] of this.sessions.entries()) {
      if (session.createdAt < oneHourAgo) {
        this.sessions.delete(id);
      }
    }
  }

  /**
   * 대화 스타일 분석 및 추천
   */
  async analyzeConversationStyle(messages: Message[]): Promise<{
    currentStyle: {
      type: string;
      characteristics: string[];
      strengths: string[];
      weaknesses: string[];
    };
    recommendations: {
      category: string;
      tips: string[];
      examples: string[];
    }[];
  }> {
    if (messages.length < 3) {
      return {
        currentStyle: {
          type: '분석 중',
          characteristics: ['대화가 더 필요해요'],
          strengths: [],
          weaknesses: []
        },
        recommendations: []
      };
    }

    const userMessages = messages.filter(m => m.sender === 'user');
    const conversationText = userMessages.map(m => m.text).join('\n');

    const prompt = `다음 연애 대화를 분석하고 스타일과 개선 추천을 제공해주세요:

${conversationText}

다음 JSON 형식으로 응답해주세요:
{
  "currentStyle": {
    "type": "대화 스타일 유형 (예: 친근한, 수줍은, 적극적인, 유머러스한)",
    "characteristics": ["특징1", "특징2", "특징3"],
    "strengths": ["강점1", "강점2"],
    "weaknesses": ["약점1", "약점2"]
  },
  "recommendations": [
    {
      "category": "카테고리명 (예: 질문하기, 감정표현, 유머)",
      "tips": ["구체적인 팁1", "구체적인 팁2"],
      "examples": ["예시 문장1", "예시 문장2"]
    }
  ]
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a dating conversation style analyzer. Provide helpful and encouraging feedback. Respond only with valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      return {
        currentStyle: result.currentStyle || {
          type: '친근한',
          characteristics: ['따뜻한 대화', '적극적인 반응'],
          strengths: ['공감 능력', '대화 이어가기'],
          weaknesses: ['질문 부족']
        },
        recommendations: result.recommendations || [
          {
            category: '질문하기',
            tips: ['상대방의 관심사에 대해 구체적으로 물어보세요', '열린 질문을 활용하세요'],
            examples: ['어떤 영화 장르를 좋아하세요?', '주말에는 보통 뭐 하면서 시간을 보내세요?']
          }
        ]
      };
    } catch (error) {
      console.error('Style analysis error:', error);
      return {
        currentStyle: {
          type: '분석 중',
          characteristics: ['대화 스타일 분석 중입니다'],
          strengths: [],
          weaknesses: []
        },
        recommendations: []
      };
    }
  }
}