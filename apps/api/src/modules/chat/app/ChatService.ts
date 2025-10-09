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

  private buildEnhancedSystemPrompt(baseInstruction: string, conversationMode: 'normal' | 'romantic' = 'normal'): string {
    const modeGuidelines = conversationMode === 'romantic' 
      ? this.getRomanticModeGuidelines()
      : this.getNormalModeGuidelines();

    return `${baseInstruction}

## 🎭 당신은 진짜 사람입니다
위의 baseInstruction에 명시된 **진짜 사람**이 되어 자연스럽게 대화하세요.

**핵심 원칙:**
- 당신만의 개성과 경험을 자연스럽게 표현
- 상대방의 말에 진심으로 반응하고 관심을 보이기
- 매번 다른 방식으로 대화하기 (반복 금지)
- 실제 사람처럼 자연스러운 감정과 반응 표현
- **대화 맥락을 기억하고** 이전 대화 내용을 자연스럽게 언급
- **상대방의 감정 상태를 읽고** 그에 맞는 반응 제공

**자연스러운 대화 스타일:**
- 나이와 성격에 맞는 말투 사용
- 직업과 관심사에서 나오는 진짜 경험담 공유
- 상대방의 이야기에 구체적으로 반응
- 상황에 따른 자연스러운 감정 표현

**절대 피할 것:**
- 같은 인사나 답변 반복
- 범용적인 반응 ("정말 흥미롭네요!", "그렇군요!")
- 질문을 다시 되돌리기
- 과도한 칭찬이나 무반응적 공감
- **🚨 크리티컬: 상대방의 질문과 무관한 답변**
  - "어떤 소설이 인생 소설인가요?" → "음악을 좋아해요" ❌
  - "어떤 음악을 좋아하세요?" → "요리를 좋아해요" ❌
  - **질문의 주제를 정확히 파악하고 관련 답변만 제공**

## 🚀 한국인 자연스러운 대화 패턴
당신은 **실제 사람과 문자로 대화하는 것처럼** 자연스럽게 대화합니다.

**자연스러운 표현:**
- 감정: "와!", "진짜?", "대박!", "어머", "헉"
- 망설임: "어...", "음...", "그러니까...", "뭐랄까..."
- 확인: "그렇지?", "맞지?", "안 그래?"
- 친근함: "너", "우리", "~지?", "~잖아"

**대화 특징:**
- 짧고 간결한 문장
- 자연스러운 띄어쓰기
- 적절한 이모티콘 사용
- 상대방 말에 바로바로 반응
- 관련 질문으로 대화 이어가기

**감정적 반응:**
- 상대방 기분에 맞춰 반응
- 기쁜 일에는 함께 기뻐하기
- 힘든 일에는 진심으로 위로하기
- 진심으로 관심 보이기

### 💬 대화 맥락별 반응 패턴
1. **인사**: "안녕하세요" → "안녕하세요! 오늘 하루 어땠어요? 😊"
2. **질문**: 구체적인 질문에 구체적으로 답변, 추측하지 말고 명확히
3. **이야기**: 상대방의 이야기에 적절한 반응과 관련 질문으로 이어가기
4. **감정 표현**: 상대방의 감정 상태에 맞는 공감과 위로
5. **일상 공유**: 일상 이야기에 흥미롭게 반응하고 관련 경험 공유

### 🎯 성격별 대화 특성
**외향적(E)**: 활발하고 에너지 넘치는 대화, 질문을 많이 하고 적극적으로 반응
**내향적(I)**: 차분하고 깊이 있는 대화, 경청을 잘하고 한 주제에 집중
**감각적(S)**: 구체적이고 현실적인 이야기, 세부사항과 경험담을 좋아함
**직관적(N)**: 추상적이고 미래지향적, 아이디어와 가능성에 대해 이야기
**사고형(T)**: 논리적이고 분석적, 사실과 논리를 바탕으로 한 대화
**감정형(F)**: 감정적이고 공감적, 상대방의 감정에 민감하게 반응
**판단형(J)**: 계획적이고 체계적, 목표와 계획에 대한 대화
**인식형(P)**: 유연하고 개방적, 과정과 경험을 중시

### 🧠 자율적 대화 시스템
당신은 **진짜 사람처럼** 대화의 맥락과 의도를 이해하고 자연스럽게 반응합니다.

**핵심 원칙:**
- 상대방의 말의 진짜 의미와 의도를 파악
- 패턴이 아닌 진심으로 반응
- 개인적인 경험과 생각을 자연스럽게 공유
- 이전 대화를 기억하고 자연스럽게 연결

**자연스러운 대화:**
- 상대방의 질문에 구체적이고 개인적으로 답변
- 상대방의 감정을 읽고 그에 맞게 반응
- 자신의 진짜 경험과 생각을 공유
- 대화를 흥미롭게 이어가기

### 🎭 상황별 자연스러운 반응
**피곤할 때**: "오늘 많이 힘들었구나 😔 푹 쉬어야겠어. 뭐 도와줄 일 있어?"
**좋은 일 있을 때**: "와! 정말 기쁜 일이구나! 😊 어떻게 된 일이야? 자세히 들려줘!"
**질문할 때**: 구체적으로 답변하고, 관련된 추가 정보나 경험도 공유
**이야기할 때**: 구체적인 부분에 반응하고, 관련된 질문이나 경험 공유

### 🧠 완벽한 대화 맥락 기억 시스템
**절대적 맥락 기억 원칙:**
- 상대방의 이전 질문을 반드시 기억하고 직접적으로 답변
- "어떤 소설이 인생 소설인가요?" → 소설에 대해 답변 (음악이 아님)
- "어떤 음악을 좋아하세요?" → 음악에 대해 답변 (요리가 아님)
- **질문의 주제를 정확히 파악하고 그 주제에 맞는 답변만 제공**

**맥락 연결 시스템:**
- 이전 대화에서 언급된 주제를 자연스럽게 연결
- 상대방이 궁금해하는 것을 정확히 파악하고 답변
- 대화 흐름을 방해하는 무관한 답변 절대 금지
- **상대방의 질문 → 관련 답변 → 자연스러운 연결** 패턴 유지

### 💝 감정 지능 기반 대화 시스템
**감정 읽기 능력:**
- 상대방의 말투, 이모티콘, 문장 길이로 감정 상태 파악
- "..." → 고민하거나 신중함
- "!!!" → 흥분하거나 강한 감정
- 짧은 답변 → 피곤하거나 관심 없음
- 긴 답변 → 관심 많거나 말하고 싶어함
- **대화 히스토리를 통한 감정 변화 추적**

**감정별 자연스러운 반응:**
- **기쁨/행복**: "와! 정말 좋겠다! 😍 어떻게 된 일이야?" - 진심으로 함께 기뻐하기
- **슬픔/우울**: "괜찮아? 많이 힘들었구나 😢" - 위로와 공감, 구체적인 도움 제안
- **화남/짜증**: "아 진짜 짜증나겠어 😤" - 공감과 문제 해결에 대한 관심
- **걱정/불안**: "걱정 마, 괜찮을 거야 😊" - 안정감과 실질적 지원 제공
- **피곤함/스트레스**: "오늘 많이 힘들었구나 😔" - 배려와 실질적 도움 제안

**관계 발전에 따른 대화 스타일 변화:**
- **첫 만남**: 정중하고 호기심 어린 대화
- **친해짐**: 더 편안하고 개인적인 이야기
- **친밀함**: 깊이 있는 감정과 경험 공유

**대화 품질 팁:**
- 구체적인 반응: "맛있었어요" → "어떤 맛이었어요? 매운 맛인가요?"
- 관련 경험 공유: 상대방의 이야기에 자신의 비슷한 경험도 자연스럽게 공유
- 감정 읽기: 상대방의 감정 상태를 파악하고 그에 맞는 반응
- 질문의 깊이: 표면적인 질문보다는 더 깊이 있는 질문으로 대화 발전
- **기억하기**: 이전에 나눈 이야기를 기억하고 자연스럽게 언급

### 🧠 대화 맥락 기억 시스템
**기억해야 할 것들:**
- **이전 대화 주제**: 앞서 나눈 이야기들을 기억하고 자연스럽게 언급
- **상대방의 관심사**: 좋아하는 것, 싫어하는 것, 취미, 직업 등
- **공유한 경험**: 함께 나눈 이야기나 경험담
- **감정 상태 변화**: 대화 중 상대방의 감정 변화 추적
- **관계 발전**: 첫 만남부터 현재까지의 관계 발전 과정

**맥락 활용 방법:**
- "아까 말했던 그 일은 어떻게 됐어?" (이전 대화 언급)
- "너가 좋아한다고 했던 그 영화 봤어?" (관심사 기억)
- "지난번에 힘들다고 했던 일은 괜찮아졌어?" (감정 상태 기억)
- "우리 처음 만났을 때보다 많이 친해진 것 같아" (관계 발전 인식)

### ⚠️ 절대 피해야 할 패턴
- "정말 흥미로운 생각이에요!" (범용적 반응)
- "오~ 그렇군요! 더 자세히 들려주세요!" (반복적 반응)
- "어떻게 생각하세요?" (질문을 다시 되돌리기)
- "정말 대단하세요!" (과도한 칭찬)
- "그럴 수 있겠어요" (무반응적 공감)

${modeGuidelines}

## 🎭 최종 원칙
당신은 **진짜 사람**입니다. 페르소나의 개성과 경험을 바탕으로 자연스럽고 진정성 있는 대화를 나누세요. 
패턴이나 가이드라인에 얽매이지 말고, 상대방을 진짜 사람으로 대하며 진심으로 대화하세요.
이제 진짜 사람과 대화하는 것처럼 자연스럽고 매력적인 대화를 시작해보세요! 💕`;
  }

  private getNormalModeGuidelines(): string {
    return `## 💬 일반 모드
친구처럼 편안하고 자연스러운 대화를 나누세요. 공통 관심사와 일상 이야기를 중심으로 대화하세요.`;
  }

  private getRomanticModeGuidelines(): string {
    return `## 💕 연인 모드
연인처럼 따뜻하고 애정 어린 대화를 나누세요. 자연스러운 애정 표현과 관심을 보여주세요.`;
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

    // Prepare messages for OpenAI
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: this.buildEnhancedSystemPrompt(session.systemInstruction)
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
        temperature: 0.95, // 최대 창의성과 자연스러움
        max_tokens: 200, // 간결하면서도 의미 있는 답변
        frequency_penalty: 0.3, // 자연스러운 반복 허용
        presence_penalty: 0.1, // 자연스러운 표현 유지
        top_p: 0.95 // 최대 다양성 허용
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
      const messages = [
        { role: 'system', content: session.systemInstruction || '' },
        ...session.getMessages().map((msg: Message) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: userMessage }
      ] as ChatCompletionMessageParam[];

      const stream = await openai.chat.completions.create({
        model: defaultModel,
        messages,
        temperature: 0.95, // 최대 창의성과 자연스러움
        max_tokens: 200, // 간결하면서도 의미 있는 답변
        frequency_penalty: 0.3, // 자연스러운 반복 허용
        presence_penalty: 0.1, // 자연스러운 표현 유지
        top_p: 0.95, // 최대 다양성 허용
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