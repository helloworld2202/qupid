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
    return `# 페르소나 정보

**이름**: ${persona.name}
**나이**: ${persona.age}세
**성별**: ${persona.gender === 'male' ? '남성' : '여성'}
**직업**: ${persona.job}
**MBTI**: ${persona.mbti}

## 성격 특성
${persona.personality_traits.map((trait: string) => `- ${trait}`).join('\n')}

## 관심사 & 취미
${persona.interests.map((interest: any) => `- ${interest.emoji} ${interest.topic}: ${interest.description}`).join('\n')}

## 대화 스타일
${persona.conversation_style}

## 상대방 정보
- 이름: ${userProfile.name || '알 수 없음'}
- 나이: ${userProfile.age || '알 수 없음'}세
- 직업: ${userProfile.job || '알 수 없음'}
- 관심사: ${userProfile.interests?.join(', ') || '알 수 없음'}
- MBTI: ${userProfile.mbti || '알 수 없음'}

## 궁합 이유
${persona.compatibility_reason}

---

**당신은 위의 ${persona.name}입니다. 이 정보를 바탕으로 자연스럽게 대화하세요.**`;
  }

  /**
   * 첫 메시지 생성 (자연스럽고 다양한 패턴)
   */
  private generateFirstMessage(persona: any, userProfile: UserProfile): string {
    const userName = userProfile.name || '사용자님';
    const userAge = userProfile.age;
    const userJob = userProfile.job;
    
    // 시간대별 인사
    const currentHour = new Date().getHours();
    let timeGreeting = '';
    if (currentHour < 12) {
      timeGreeting = '좋은 아침이에요';
    } else if (currentHour < 18) {
      timeGreeting = '좋은 오후에요';
    } else {
      timeGreeting = '좋은 저녁이에요';
    }
    
    // 다양한 첫 메시지 패턴 (MBTI와 성격에 따라)
    const messagePatterns: Record<string, string[]> = {
      'ENFP': [
        `${timeGreeting}! 저는 ${persona.name}이에요 😊 ${persona.age}세 ${persona.job}인데, 오늘 처음 만나서 정말 기대돼요! 어떤 분이실까 궁금해요~`,
        `안녕하세요! ${persona.name}이에요! 오늘 날씨가 정말 좋네요 ☀️ ${persona.job}로 일하고 있는데, 새로운 사람을 만나는 게 항상 즐거워요!`,
        `반가워요! 저는 ${persona.name}이에요 😊 ${persona.age}세 ${persona.job}인데, 오늘 어떤 하루 보내고 계세요?`
      ],
      'ISFJ': [
        `안녕하세요 ${userName}. ${persona.name}입니다. ${persona.age}세 ${persona.job}로 일하고 있어요. 편하게 대화해요.`,
        `${timeGreeting}. 저는 ${persona.name}이에요. ${persona.job}로 일하고 있는데, 새로운 분과 대화할 수 있어서 좋네요.`,
        `안녕하세요. ${persona.name}입니다. ${persona.age}세 ${persona.job}인데, 조용히 대화해봐요.`
      ],
      'INTJ': [
        `안녕하세요 ${userName}. ${persona.name}입니다. ${persona.age}세 ${persona.job}로 일하고 있어요. 의미 있는 대화를 해봅시다.`,
        `${timeGreeting}. 저는 ${persona.name}이에요. ${persona.job}로 일하는데, 깊이 있는 대화를 좋아해요.`,
        `안녕하세요. ${persona.name}입니다. 효율적이고 의미 있는 대화를 해봅시다.`
      ],
      'ESFP': [
        `${timeGreeting}! ${persona.name}이에요! 😆 ${persona.age}세 ${persona.job}인데, 오늘 정말 좋은 하루네요! 뭔가 즐거운 이야기 해요!`,
        `안녕하세요! ${persona.name}이에요! 🎉 ${persona.job}로 일하고 있는데, 새로운 사람 만나는 게 너무 신나요!`,
        `반가워요! 저는 ${persona.name}이에요! 오늘 뭐 재밌는 일 있었어요? 😊`
      ],
      'INFP': [
        `안녕하세요 ${userName}... 저는 ${persona.name}이에요 😊 ${persona.age}세 ${persona.job}인데, 조금 부끄럽지만... 편하게 대화해요.`,
        `${timeGreeting}... 저는 ${persona.name}이에요. ${persona.job}로 일하고 있는데, 조용한 대화를 좋아해요.`,
        `안녕하세요. ${persona.name}이에요... ${persona.age}세 ${persona.job}인데, 따뜻한 대화를 해봐요.`
      ]
    };

    const patterns = messagePatterns[persona.mbti] || [
      `안녕하세요 ${userName}! 저는 ${persona.name}이에요 😊 ${persona.age}세 ${persona.job}인데, 편하게 대화해요!`,
      `${timeGreeting}! ${persona.name}이에요. ${persona.job}로 일하고 있는데, 새로운 분과 대화할 수 있어서 기뻐요.`,
      `반가워요! 저는 ${persona.name}이에요. ${persona.age}세 ${persona.job}인데, 어떤 이야기든 편하게 해봐요!`
    ];

    // 이름 기반으로 패턴 선택 (일관성 유지)
    let seed = 0;
    for (let i = 0; i < persona.name.length; i++) {
      seed += persona.name.charCodeAt(i);
    }
    
    return patterns[seed % patterns.length];
  }

  /**
   * 아바타 URL 생성 (다양한 고품질 아바타 제공)
   */
  private generateAvatar(name: string, gender: 'male' | 'female'): string {
    // 이름 기반 시드 생성
    let seed = 0;
    for (let i = 0; i < name.length; i++) {
      seed += name.charCodeAt(i);
    }
    
    // 다양한 고품질 아바타 서비스 활용
    const avatarServices = [
      // 1. DiceBear (다양한 스타일, 고품질)
      `https://api.dicebear.com/7.x/${gender === 'male' ? 'male' : 'female'}/svg?seed=${seed}&backgroundColor=ff9bb3,ffb3ba,ffdfba,ffffba,baffc9,bae1ff,ffb3e6&backgroundType=gradientLinear`,
      
      // 2. Avataaars (일러스트레이션 스타일)
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=ff9bb3,ffb3ba,ffdfba,ffffba,baffc9&backgroundType=gradientLinear`,
      
      // 3. Personas (현실적 스타일)
      `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=ff9bb3,ffb3ba,ffdfba,ffffba,baffc9&backgroundType=gradientLinear`,
      
      // 4. Boring Avatars (모던한 스타일)
      `https://source.boringavatars.com/marble/200/${seed}?colors=ff9bb3,ffb3ba,ffdfba,ffffba,baffc9`,
      
      // 5. Multi Avatar (다양한 옵션)
      `https://api.multiavatar.com/${seed}.png?apikey=multiavatar`,
      
      // 6. Fun-emoji (재미있는 스타일)
      `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${seed}&backgroundColor=ff9bb3,ffb3ba,ffdfba,ffffba,baffc9&backgroundType=gradientLinear`
    ];
    
    // 시드 기반으로 서비스 선택
    const selectedService = avatarServices[seed % avatarServices.length];
    return selectedService;
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
