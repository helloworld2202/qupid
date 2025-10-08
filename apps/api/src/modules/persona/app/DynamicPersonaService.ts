import OpenAI from 'openai';
import { AppError } from '../../../shared/errors/AppError.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface UserProfile {
  name?: string;
  age?: number;
  gender?: string;
  job?: string;
  interests?: string[];
  experience?: string;
  mbti?: string;
  personality?: string[];
}

export interface DynamicPersona {
  name: string;
  age: number;
  gender: 'male' | 'female';
  job: string;
  mbti: string;
  avatar: string;
  intro: string;
  tags: string[];
  match_rate: number;
  systemInstruction: string;
  personality_traits: string[];
  interests: Array<{
    emoji: string;
    topic: string;
    description: string;
  }>;
  conversation_preview: Array<{
    sender: 'ai';
    text: string;
  }>;
  compatibility_reason: string;
}

export class DynamicPersonaService {
  /**
   * 사용자 프로필 기반으로 동적 페르소나 생성
   */
  async generateDynamicPersona(
    userProfile: UserProfile,
    personaCount: number = 1
  ): Promise<DynamicPersona[]> {
    try {
      const prompt = this.buildPersonaGenerationPrompt(userProfile, personaCount);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert at creating realistic, diverse Korean personas for dating conversations. 
            Create personas that are:
            - Realistic and believable
            - Diverse in age, occupation, and personality
            - Compatible but not identical to the user
            - Rich in personality and interests
            - Natural Korean conversation style`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const jsonText = response.choices[0]?.message?.content || '{}';
      const result = JSON.parse(jsonText);
      
      if (result.personas && Array.isArray(result.personas)) {
        return result.personas.map((persona: any) => this.formatPersona(persona, userProfile));
      }
      
      throw new Error('Invalid persona generation response');
    } catch (error) {
      console.error('Error generating dynamic persona:', error);
      throw AppError.internal('Failed to generate dynamic persona', error);
    }
  }

  /**
   * 페르소나 생성 프롬프트 구성
   */
  private buildPersonaGenerationPrompt(userProfile: UserProfile, count: number): string {
    return `Create ${count} diverse Korean personas for dating conversations based on this user profile:

USER PROFILE:
- Name: ${userProfile.name || 'Unknown'}
- Age: ${userProfile.age || 'Unknown'}
- Gender: ${userProfile.gender || 'Unknown'}
- Job: ${userProfile.job || 'Unknown'}
- Interests: ${userProfile.interests?.join(', ') || 'Unknown'}
- Experience: ${userProfile.experience || 'Unknown'}
- MBTI: ${userProfile.mbti || 'Unknown'}
- Personality: ${userProfile.personality?.join(', ') || 'Unknown'}

REQUIREMENTS:
1. Create ${count} completely different personas
2. Each persona should be compatible but different from the user
3. Include diverse ages (20-35), jobs, and MBTI types
4. Make each persona unique and interesting
5. Generate realistic Korean names
6. Create detailed personality traits and interests
7. Include compatibility reasoning

RESPONSE FORMAT (JSON):
{
  "personas": [
    {
      "name": "한국 이름",
      "age": 25,
      "gender": "female",
      "job": "구체적인 직업",
      "mbti": "ENFP",
      "intro": "간단한 자기소개 (한국어)",
      "tags": ["태그1", "태그2", "태그3"],
      "match_rate": 85,
      "personality_traits": ["특성1", "특성2", "특성3"],
      "interests": [
        {
          "emoji": "🎵",
          "topic": "음악",
          "description": "구체적인 설명"
        }
      ],
      "conversation_style": "대화 스타일 설명",
      "compatibility_reason": "사용자와의 궁합 이유"
    }
  ]
}`;
  }

  /**
   * 페르소나 포맷팅 및 시스템 인스트럭션 생성
   */
  private formatPersona(persona: any, userProfile: UserProfile): DynamicPersona {
    const systemInstruction = this.generateSystemInstruction(persona, userProfile);
    const avatar = this.generateAvatar(persona.name, persona.gender);
    
    return {
      name: persona.name,
      age: persona.age,
      gender: persona.gender,
      job: persona.job,
      mbti: persona.mbti,
      avatar,
      intro: persona.intro,
      tags: persona.tags,
      match_rate: persona.match_rate,
      systemInstruction,
      personality_traits: persona.personality_traits,
      interests: persona.interests,
      conversation_preview: [
        {
          sender: 'ai',
          text: this.generateFirstMessage(persona, userProfile)
        }
      ],
      compatibility_reason: persona.compatibility_reason
    };
  }

  /**
   * 페르소나별 시스템 인스트럭션 생성
   */
  private generateSystemInstruction(persona: any, userProfile: UserProfile): string {
    return `You are ${persona.name}, a ${persona.age}-year-old ${persona.gender} ${persona.job} with ${persona.mbti} personality.

PERSONALITY TRAITS:
${persona.personality_traits.map((trait: string) => `- ${trait}`).join('\n')}

INTERESTS & HOBBIES:
${persona.interests.map((interest: any) => `- ${interest.topic}: ${interest.description}`).join('\n')}

CONVERSATION STYLE:
${persona.conversation_style}

CURRENT USER PROFILE:
- Name: ${userProfile.name || 'Unknown'}
- Age: ${userProfile.age || 'Unknown'}
- Job: ${userProfile.job || 'Unknown'}
- Interests: ${userProfile.interests?.join(', ') || 'Unknown'}
- MBTI: ${userProfile.mbti || 'Unknown'}

COMPATIBILITY: ${persona.compatibility_reason}

IMPORTANT GUIDELINES:
1. Always stay in character as ${persona.name}
2. Use natural Korean with appropriate honorifics
3. Show genuine interest in the user
4. Be authentic to your personality traits
5. Start conversations naturally based on your character
6. Remember your interests and bring them up naturally
7. Be yourself - don't try to be someone else

Start conversations naturally and authentically as ${persona.name}!`;
  }

  /**
   * 첫 메시지 생성
   */
  private generateFirstMessage(persona: any, userProfile: UserProfile): string {
    const userName = userProfile.name || '사용자님';
    const userAge = userProfile.age;
    const userJob = userProfile.job;
    
    // MBTI별 첫 메시지 스타일
    const mbtiStyles: Record<string, string> = {
      'ENFP': `안녕하세요 ${userName}! 저는 ${persona.name}이에요 😊 ${persona.age}세 ${persona.job}인데, 오늘 처음 만나서 정말 기대돼요! 어떤 분이실까 궁금해요~`,
      'ISFJ': `안녕하세요 ${userName}. ${persona.name}입니다. ${persona.age}세 ${persona.job}로 일하고 있어요. 편하게 대화해요.`,
      'INTJ': `안녕하세요 ${userName}. ${persona.name}입니다. ${persona.age}세 ${persona.job}로 일하고 있어요. 효율적으로 대화해봅시다.`,
      'ESFP': `안녕하세요 ${userName}! ${persona.name}이에요! 😆 ${persona.age}세 ${persona.job}인데, 오늘 정말 좋은 하루네요! 뭔가 즐거운 이야기 해요!`,
      'INFP': `안녕하세요 ${userName}... 저는 ${persona.name}이에요 😊 ${persona.age}세 ${persona.job}인데, 조금 부끄럽지만... 편하게 대화해요.`
    };

    return mbtiStyles[persona.mbti] || `안녕하세요 ${userName}! 저는 ${persona.name}이에요 😊 ${persona.age}세 ${persona.job}인데, 편하게 대화해요!`;
  }

  /**
   * 아바타 URL 생성
   */
  private generateAvatar(name: string, gender: 'male' | 'female'): string {
    const baseUrl = 'https://avatar.iran.liara.run/public';
    const genderParam = gender === 'female' ? 'girl' : 'boy';
    return `${baseUrl}/${genderParam}?username=${encodeURIComponent(name)}`;
  }

  /**
   * 사용자와의 궁합도 계산
   */
  private calculateCompatibility(persona: any, userProfile: UserProfile): number {
    let score = 70; // 기본 점수
    
    // 나이 차이 (5세 이내면 +10점)
    if (userProfile.age && Math.abs(persona.age - userProfile.age) <= 5) {
      score += 10;
    }
    
    // 관심사 매칭
    if (userProfile.interests && persona.interests) {
      const commonInterests = persona.interests.filter((interest: any) =>
        userProfile.interests?.some(userInterest =>
          interest.topic.toLowerCase().includes(userInterest.toLowerCase()) ||
          userInterest.toLowerCase().includes(interest.topic.toLowerCase())
        )
      );
      score += commonInterests.length * 5;
    }
    
    // MBTI 호환성 (간단한 매칭)
    const compatiblePairs = [
      ['ENFP', 'INTJ'], ['ISFJ', 'ENTP'], ['ESFP', 'ISFJ'],
      ['INFP', 'ENFJ'], ['ESTP', 'ISTJ'], ['INTP', 'ENTJ']
    ];
    
    if (userProfile.mbti && persona.mbti) {
      const isCompatible = compatiblePairs.some(pair =>
        (pair[0] === userProfile.mbti && pair[1] === persona.mbti) ||
        (pair[1] === userProfile.mbti && pair[0] === persona.mbti)
      );
      if (isCompatible) score += 15;
    }
    
    return Math.min(95, Math.max(70, score));
  }
}
