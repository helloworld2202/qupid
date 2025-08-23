import { openai, defaultModel } from '../../../shared/infra/openai.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { ChatSession } from '../domain/ChatSession.js';
import { Message, ConversationAnalysis, RealtimeFeedback } from '@qupid/core';
import type { ChatCompletionMessageParam } from 'openai/resources/index.js';

export class ChatService {
  private sessions = new Map<string, ChatSession>();

  async createSession(
    userId: string,
    personaId: string,
    systemInstruction: string
  ): Promise<string> {
    const sessionId = this.generateSessionId();
    const session = new ChatSession(
      sessionId,
      userId,
      personaId,
      systemInstruction
    );
    
    this.sessions.set(sessionId, session);
    return sessionId;
  }

  async sendMessage(
    sessionId: string,
    message: string
  ): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw AppError.notFound('Chat session');
    }

    // Add user message
    session.addMessage({
      sender: 'user',
      text: message,
      timestamp: new Date()
    });

    // Prepare messages for OpenAI
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `${session.systemInstruction} Keep your responses concise, natural, and engaging, like a real chat conversation.`
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
        temperature: 0.8,
        max_tokens: 500
      });

      const aiResponse = response.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';
      
      // Add AI response
      session.addMessage({
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date()
      });

      return aiResponse;
    } catch (error) {
      throw AppError.internal('Failed to generate AI response', error);
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
    messages: Message[]
  ): Promise<{ reason: string; suggestion: string }> {
    const conversationText = messages
      .filter((msg) => msg.sender !== 'system')
      .map((msg) => `${msg.sender === 'user' ? '나' : '상대'}: ${msg.text}`)
      .join('\n');

    const prompt = `
    사용자가 대화를 이어가는데 도움이 필요합니다.
    
    대화:
    ${conversationText}
    
    JSON 응답:
    {
      "reason": "왜 이 제안이 좋은지 (1-2 문장)",
      "suggestion": "구체적인 메시지 제안"
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

  // Cleanup old sessions periodically
  cleanupOldSessions(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [id, session] of this.sessions.entries()) {
      if (session.createdAt < oneHourAgo) {
        this.sessions.delete(id);
      }
    }
  }
}