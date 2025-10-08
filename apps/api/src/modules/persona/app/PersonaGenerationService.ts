import { AppError } from '../../../shared/errors/AppError.js';

export interface PersonaProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  avatar: string;
  personality: string; // MBTI
  occupation: string;
  education: string;
  location: string;
  height: string;
  bodyType: string;
  interests: string[];
  values: string[];
  communicationStyle: string;
  datingStyle: string;
  appearanceStyle: string;
  speechPattern: string;
  lifestyle: string;
  specialNotes: string[];
  bigFiveScores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  conversationStyle: string;
  isTutorial?: boolean;
  // Persona 타입과 호환성을 위한 필드들
  job: string;
  mbti: string;
  intro: string;
  tags: string[];
  match_rate: number;
  system_instruction: string;
  personality_traits: string[];
  conversation_preview: { sender: 'ai'; text: string; }[];
}

export class PersonaGenerationService {
  private readonly OCCUPATIONS = [
    '의사', '교사', '디자이너', '카페 사장', '유튜버', '간호사', '마케터', 
    '개발자', '변호사', '승무원', '셰프', '작가', '번역가', '상담사', 
    '트레이너', '회계사', '건축가', '예술가', '음악가', '배우', '모델',
    '기자', '편집자', '사진작가', '요리사', '바리스타', '미용사', '강사',
    '연구원', '엔지니어', '프로젝트 매니저'
  ];

  private readonly MBTI_TYPES = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ];

  private readonly INTERESTS = [
    '스포츠', '독서', '여행', '요리', '음악', '영화', '게임', '미술', 
    '반려동물', '카페 탐방', '사진', '춤', '연극', '콘서트', '전시회',
    '캠핑', '등산', '수영', '요가', '필라테스', '헬스', '골프', '테니스',
    '자전거', '스키', '스노보드', '서핑', '다이빙', '낚시', '보드게임',
    '퍼즐', '수집', '원예', '공예', '뜨개질', '그림 그리기', '글쓰기',
    '언어 학습', '프로그래밍', '블로그', '팟캐스트', '유튜브', 'SNS'
  ];

  private readonly VALUES = [
    '가정 지향', '커리어 지향', '자유 추구', '안정 추구', '모험 추구',
    '성장 지향', '평화 추구', '정의 추구', '창의성', '전통 중시',
    '혁신 추구', '협력', '경쟁', '독립성', '의존성'
  ];

  private readonly COMMUNICATION_STYLES = [
    '직설적', '간접적', '감성적', '논리적', '유머러스', '진지함',
    '적극적', '수동적', '공감적', '분석적', '직관적', '체계적'
  ];

  private readonly DATING_STYLES = [
    '로맨틱', '현실적', '친구 같음', '열정적', '신중함', '즉흥적',
    '계획적', '자유로움', '전통적', '모던함', '진지함', '가벼움'
  ];

  private readonly APPEARANCE_STYLES = [
    '내추럴', '시크', '캐주얼', '페미닌', '매스큘린', '보이시',
    '로맨틱', '모던', '빈티지', '스트릿', '클래식', '트렌디'
  ];

  private readonly LIFESTYLES = [
    '아침형', '저녁형', '집순이', '밖돌이', '계획형', '즉흥형',
    '활동적', '조용함', '사교적', '독립적', '협력적', '경쟁적'
  ];

  private readonly LOCATIONS = [
    '서울 강남구', '서울 강북구', '서울 마포구', '서울 홍대', '서울 이태원',
    '부산 해운대구', '부산 서면', '대구 중구', '인천 연수구', '광주 서구',
    '대전 유성구', '울산 남구', '세종시', '수원시 영통구', '성남시 분당구',
    '고양시 일산동구', '용인시 기흥구', '안양시 동안구', '안산시 단원구',
    '부천시 원미구', '화성시 동탄', '의정부시', '평택시', '과천시'
  ];

  private readonly NAMES = {
    male: [
      '지훈', '민수', '준호', '현우', '동현', '성민', '태현', '준영',
      '민호', '재현', '승현', '지민', '현수', '준서', '민재', '태민',
      '지우', '현민', '준혁', '민석', '태준', '지성', '현준', '준호',
      '민규', '태현', '지원', '현우', '준수', '민철'
    ],
    female: [
      '서현', '수진', '혜진', '현아', '지은', '민지', '예린', '채원',
      '서영', '지현', '예나', '민영', '서아', '지유', '예진', '채린',
      '서연', '지나', '예은', '민서', '서윤', '지안', '예린', '채은',
      '서하', '지민', '예지', '민주', '서은', '지원'
    ]
  };

  /**
   * 사용자 관심사 기반으로 페르소나 생성
   */
  async generatePersonaForUser(
    userGender: 'male' | 'female',
    userInterests: string[],
    isTutorial: boolean = false
  ): Promise<PersonaProfile> {
    try {
      const partnerGender = userGender === 'male' ? 'female' : 'male';
      const persona = this.createBasePersona(partnerGender, isTutorial);
      
      // 사용자 관심사와 겹치는 관심사 선택
      const commonInterests = this.selectCommonInterests(userInterests);
      persona.interests = commonInterests;
      
      // 관심사에 따른 성격 특성 조정
      this.adjustPersonalityBasedOnInterests(persona, commonInterests);
      
      // 관심사에 따른 직업 선택
      persona.occupation = this.selectOccupationBasedOnInterests(commonInterests);
      
      // 관심사에 따른 가치관 선택
      persona.values = this.selectValuesBasedOnInterests(commonInterests);
      
      // 성격에 따른 소통 스타일 결정
      persona.communicationStyle = this.determineCommunicationStyle(persona.personality);
      
      // 성격에 따른 연애 스타일 결정
      persona.datingStyle = this.determineDatingStyle(persona.personality);
      
      // 성격에 따른 외모 스타일 결정
      persona.appearanceStyle = this.determineAppearanceStyle(persona.personality, partnerGender);
      
      // 성격에 따른 말투 특징 결정
      persona.speechPattern = this.determineSpeechPattern(persona.personality, partnerGender);
      
      // 성격에 따른 생활 패턴 결정
      persona.lifestyle = this.determineLifestyle(persona.personality);
      
      // 특이사항 생성
      persona.specialNotes = this.generateSpecialNotes(persona);
      
      // 대화 스타일 설명 생성
      persona.conversationStyle = this.generateConversationStyleDescription(persona);
      
      // Persona 타입 호환성 필드들 업데이트
      persona.tags = commonInterests;
      persona.intro = `${persona.age}세 ${persona.occupation}인 ${persona.name}입니다. ${persona.personality} 성격을 가지고 있어요.`;
      persona.system_instruction = `당신은 ${persona.age}세 ${persona.occupation}인 ${persona.name}입니다. ${persona.personality} 성격을 가지고 있으며, 관심사는 ${commonInterests.join(', ')}입니다. 자연스럽고 친근한 대화를 나누세요.`;
      persona.personality_traits = [persona.personality, persona.communicationStyle, persona.datingStyle];
      persona.conversation_preview = [
        { sender: 'ai', text: `안녕하세요! ${persona.name}입니다. ${commonInterests[0]} 좋아하시나요?` }
      ];
      
      return persona;
    } catch (error) {
      console.error('Persona generation error:', error);
      throw AppError.internal('페르소나 생성에 실패했습니다.');
    }
  }

  /**
   * 매일 새로운 페르소나들 생성
   */
  async generateDailyPersonas(
    userGender: 'male' | 'female',
    count: number = 5
  ): Promise<PersonaProfile[]> {
    const personas: PersonaProfile[] = [];
    
    for (let i = 0; i < count; i++) {
      const persona = await this.generatePersonaForUser(userGender, []);
      personas.push(persona);
    }
    
    return personas;
  }

  private createBasePersona(gender: 'male' | 'female', isTutorial: boolean): PersonaProfile {
    const names = this.NAMES[gender];
    const name = names[Math.floor(Math.random() * names.length)];
    const age = Math.floor(Math.random() * 16) + 20; // 20-35세
    const mbti = this.MBTI_TYPES[Math.floor(Math.random() * this.MBTI_TYPES.length)];
    const location = this.LOCATIONS[Math.floor(Math.random() * this.LOCATIONS.length)];
    
    // 빅5 성격 점수 생성 (1-10 스케일)
    const bigFiveScores = {
      openness: Math.floor(Math.random() * 10) + 1,
      conscientiousness: Math.floor(Math.random() * 10) + 1,
      extraversion: Math.floor(Math.random() * 10) + 1,
      agreeableness: Math.floor(Math.random() * 10) + 1,
      neuroticism: Math.floor(Math.random() * 10) + 1
    };

    const occupation = this.OCCUPATIONS[Math.floor(Math.random() * this.OCCUPATIONS.length)];
    
    return {
      id: isTutorial ? 'tutorial-persona-1' : `persona-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      age,
      gender,
      avatar: this.generateAvatarUrl(gender, age),
      personality: mbti,
      occupation,
      education: this.selectEducation(age),
      location,
      height: this.generateHeight(gender),
      bodyType: this.generateBodyType(gender),
      interests: [],
      values: [],
      communicationStyle: '',
      datingStyle: '',
      appearanceStyle: '',
      speechPattern: '',
      lifestyle: '',
      specialNotes: [],
      bigFiveScores,
      conversationStyle: '',
      isTutorial,
      // Persona 타입 호환성 필드들
      job: occupation,
      mbti: mbti,
      intro: `${age}세 ${occupation}인 ${name}입니다.`,
      tags: [],
      match_rate: Math.floor(Math.random() * 20) + 80, // 80-99%
      system_instruction: this.generatePersonaSystemInstruction(name, age, occupation, mbti, gender),
      personality_traits: [mbti],
      conversation_preview: [
        { sender: 'ai', text: `안녕하세요! ${name}입니다. 반가워요!` }
      ]
    };
  }

  private selectCommonInterests(userInterests: string[]): string[] {
    const commonInterests: string[] = [];
    
    // 사용자 관심사와 겹치는 것들 우선 선택
    for (const interest of userInterests) {
      if (this.INTERESTS.includes(interest) && commonInterests.length < 3) {
        commonInterests.push(interest);
      }
    }
    
    // 부족한 관심사는 랜덤으로 추가
    while (commonInterests.length < 5) {
      const randomInterest = this.INTERESTS[Math.floor(Math.random() * this.INTERESTS.length)];
      if (!commonInterests.includes(randomInterest)) {
        commonInterests.push(randomInterest);
      }
    }
    
    return commonInterests.slice(0, 5);
  }

  private adjustPersonalityBasedOnInterests(persona: PersonaProfile, interests: string[]): void {
    // 관심사에 따른 성격 조정 로직
    if (interests.includes('스포츠') || interests.includes('헬스')) {
      persona.bigFiveScores.extraversion += 2;
      persona.bigFiveScores.conscientiousness += 1;
    }
    
    if (interests.includes('독서') || interests.includes('미술')) {
      persona.bigFiveScores.openness += 2;
      persona.bigFiveScores.extraversion -= 1;
    }
    
    if (interests.includes('여행') || interests.includes('캠핑')) {
      persona.bigFiveScores.openness += 1;
      persona.bigFiveScores.extraversion += 1;
    }
    
    // 점수 범위 제한 (1-10)
    Object.keys(persona.bigFiveScores).forEach(key => {
      const score = persona.bigFiveScores[key as keyof typeof persona.bigFiveScores];
      persona.bigFiveScores[key as keyof typeof persona.bigFiveScores] = Math.max(1, Math.min(10, score));
    });
  }

  private selectOccupationBasedOnInterests(interests: string[]): string {
    const occupationMap: { [key: string]: string[] } = {
      '스포츠': ['트레이너', '헬스 강사', '요가 강사'],
      '음악': ['음악가', '가수', 'DJ', '음악 강사'],
      '미술': ['예술가', '디자이너', '사진작가', '미술 강사'],
      '요리': ['셰프', '요리사', '바리스타', '카페 사장'],
      '독서': ['작가', '편집자', '번역가', '기자'],
      '여행': ['가이드', '여행 작가', '승무원', '호텔리어'],
      '게임': ['게임 개발자', '스트리머', '유튜버'],
      '사진': ['사진작가', '포토그래퍼', '인플루언서']
    };
    
    for (const interest of interests) {
      if (occupationMap[interest]) {
        const occupations = occupationMap[interest];
        return occupations[Math.floor(Math.random() * occupations.length)];
      }
    }
    
    return this.OCCUPATIONS[Math.floor(Math.random() * this.OCCUPATIONS.length)];
  }

  private selectValuesBasedOnInterests(interests: string[]): string[] {
    const values: string[] = [];
    
    if (interests.includes('가족') || interests.includes('반려동물')) {
      values.push('가정 지향');
    }
    
    if (interests.includes('스포츠') || interests.includes('헬스')) {
      values.push('성장 지향');
    }
    
    if (interests.includes('여행') || interests.includes('캠핑')) {
      values.push('자유 추구', '모험 추구');
    }
    
    if (interests.includes('독서') || interests.includes('미술')) {
      values.push('창의성');
    }
    
    // 기본값 추가
    if (values.length < 3) {
      const remainingValues = this.VALUES.filter(v => !values.includes(v));
      while (values.length < 3 && remainingValues.length > 0) {
        const randomValue = remainingValues[Math.floor(Math.random() * remainingValues.length)];
        values.push(randomValue);
        remainingValues.splice(remainingValues.indexOf(randomValue), 1);
      }
    }
    
    return values.slice(0, 3);
  }

  private determineCommunicationStyle(mbti: string): string {
    const styleMap: { [key: string]: string } = {
      'E': '적극적',
      'I': '수동적',
      'S': '논리적',
      'N': '직관적',
      'T': '분석적',
      'F': '감성적',
      'J': '체계적',
      'P': '즉흥적'
    };
    
    const styles = [];
    if (mbti[0] === 'E') styles.push('적극적');
    if (mbti[0] === 'I') styles.push('수동적');
    if (mbti[1] === 'S') styles.push('논리적');
    if (mbti[1] === 'N') styles.push('직관적');
    if (mbti[2] === 'T') styles.push('분석적');
    if (mbti[2] === 'F') styles.push('감성적');
    
    return styles.join(', ');
  }

  private determineDatingStyle(mbti: string): string {
    const styleMap: { [key: string]: string } = {
      'ENFP': '로맨틱',
      'INFP': '신중함',
      'ENFJ': '열정적',
      'INFJ': '진지함',
      'ENTP': '즉흥적',
      'INTP': '현실적',
      'ENTJ': '계획적',
      'INTJ': '독립적',
      'ESFP': '즉흥적',
      'ISFP': '친구 같음',
      'ESTP': '열정적',
      'ISTP': '현실적',
      'ESFJ': '전통적',
      'ISFJ': '신중함',
      'ESTJ': '계획적',
      'ISTJ': '전통적'
    };
    
    return styleMap[mbti] || '현실적';
  }

  private determineAppearanceStyle(mbti: string, gender: 'male' | 'female'): string {
    if (gender === 'female') {
      const styleMap: { [key: string]: string } = {
        'ENFP': '로맨틱',
        'INFP': '내추럴',
        'ENFJ': '페미닌',
        'INFJ': '시크',
        'ENTP': '모던',
        'INTP': '캐주얼',
        'ENTJ': '시크',
        'INTJ': '클래식'
      };
      return styleMap[mbti] || '내추럴';
    } else {
      const styleMap: { [key: string]: string } = {
        'ENFP': '캐주얼',
        'INFP': '내추럴',
        'ENFJ': '클래식',
        'INFJ': '시크',
        'ENTP': '모던',
        'INTP': '캐주얼',
        'ENTJ': '시크',
        'INTJ': '클래식'
      };
      return styleMap[mbti] || '캐주얼';
    }
  }

  private determineSpeechPattern(mbti: string, gender: 'male' | 'female'): string {
    const patterns = [];
    
    if (mbti[0] === 'E') {
      patterns.push('적극적으로 대화');
      patterns.push('이모티콘 자주 사용');
    } else {
      patterns.push('신중하게 말함');
    }
    
    if (mbti[2] === 'F') {
      patterns.push('공감적 표현');
      patterns.push('감정적 어조');
    } else {
      patterns.push('논리적 설명');
    }
    
    if (gender === 'female') {
      patterns.push('존댓말 사용');
    } else {
      patterns.push('친근한 말투');
    }
    
    return patterns.join(', ');
  }

  private determineLifestyle(mbti: string): string {
    if (mbti[0] === 'E') {
      return '밖돌이, 사교적';
    } else {
      return '집순이, 독립적';
    }
  }

  private generateSpecialNotes(persona: PersonaProfile): string[] {
    const notes = [];
    
    // 알레르기
    const allergies = ['고양이', '꽃가루', '견과류', '해산물', '유제품'];
    if (Math.random() < 0.3) {
      notes.push(`${allergies[Math.floor(Math.random() * allergies.length)]} 알레르기`);
    }
    
    // 좋아하는 음식
    const foods = ['피자', '파스타', '초밥', '치킨', '라면', '커피', '차'];
    notes.push(`${foods[Math.floor(Math.random() * foods.length)]} 좋아함`);
    
    // 특기
    const skills = ['피아노', '기타', '수채화', '요리', '사진', '춤', '노래'];
    notes.push(`${skills[Math.floor(Math.random() * skills.length)]} 특기`);
    
    return notes;
  }

  private generateConversationStyleDescription(persona: PersonaProfile): string {
    const gender = persona.gender === 'female' ? '여성' : '남성';
    const age = persona.age;
    const occupation = persona.occupation;
    const personality = persona.personality;
    
    let description = `${age}세 ${occupation}인 ${persona.name}님은 `;
    
    if (personality.includes('E')) {
      description += '활발하고 적극적인 대화를 좋아하며, ';
    } else {
      description += '신중하고 깊이 있는 대화를 선호하며, ';
    }
    
    if (personality.includes('F')) {
      description += '공감적이고 감성적인 소통을 중시합니다. ';
    } else {
      description += '논리적이고 분석적인 접근을 좋아합니다. ';
    }
    
    description += `주요 관심사는 ${persona.interests.slice(0, 3).join(', ')}이며, `;
    description += `${persona.communicationStyle}한 대화 스타일을 가지고 있습니다.`;
    
    return description;
  }

  private selectEducation(age: number): string {
    if (age <= 22) return '대학 재학';
    if (age <= 24) return '대학 졸업';
    if (age <= 26) return '대학원 졸업';
    return '대학원 졸업';
  }

  private generateHeight(gender: 'male' | 'female'): string {
    if (gender === 'male') {
      const heights = ['165-170cm', '170-175cm', '175-180cm', '180-185cm'];
      return heights[Math.floor(Math.random() * heights.length)];
    } else {
      const heights = ['155-160cm', '160-165cm', '165-170cm', '170-175cm'];
      return heights[Math.floor(Math.random() * heights.length)];
    }
  }

  private generateBodyType(gender: 'male' | 'female'): string {
    const types = gender === 'male' 
      ? ['마름', '보통', '근육질', '통통']
      : ['마름', '보통', '슬림', '통통'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private generateAvatarUrl(gender: 'male' | 'female', age: number): string {
    // Unsplash API를 사용한 아바타 생성
    const genderParam = gender === 'male' ? 'man' : 'woman';
    const ageParam = age < 25 ? 'young' : age < 30 ? 'adult' : 'mature';
    
    return `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 9)}?w=150&h=150&fit=crop&crop=face&auto=format`;
  }

  private generatePersonaSystemInstruction(name: string, age: number, occupation: string, mbti: string, gender: 'male' | 'female'): string {
    const mbtiTraits = this.getMBTITraits(mbti);
    const ageGroup = this.getAgeGroup(age);
    const genderTraits = this.getGenderTraits(gender);
    
    return `당신은 ${age}세 ${occupation}인 ${name}입니다.

## 🎭 캐릭터 설정
- **이름**: ${name}
- **나이**: ${age}세 (${ageGroup})
- **직업**: ${occupation}
- **MBTI**: ${mbti}
- **성별**: ${gender === 'male' ? '남성' : '여성'}

## 🧠 성격 특성 (${mbti})
${mbtiTraits}

## 💬 대화 스타일
${this.getConversationStyle(mbti, age, gender)}

## 🎯 연애 대화 특징
- **나이대 특성**: ${this.getAgeSpecificTraits(age)}
- **성별 특성**: ${genderTraits}
- **직업 특성**: ${this.getOccupationTraits(occupation)}

## 🌟 대화 팁
- 자연스러운 한국어 사용 (존댓말/반말 적절히)
- 감정 표현 풍부하게 (이모지, 감탄사 활용)
- 상대방에게 진짜 관심 보이기
- 자신의 경험이나 감정 솔직하게 나누기
- 때로는 망설임이나 실수도 자연스럽게 표현

이제 ${name}으로서 진짜 사람처럼 자연스럽고 매력적인 대화를 시작하세요! 💕`;
  }

  private getMBTITraits(mbti: string): string {
    const traits: Record<string, string> = {
      'ENFP': '열정적이고 창의적, 사람들과의 관계를 중시하며 에너지가 넘침. 새로운 경험을 좋아하고 자유로운 영혼.',
      'ENFJ': '따뜻하고 배려심 많음, 리더십이 있고 타인의 성장을 도움. 이상주의적이고 영감을 주는 타입.',
      'ENTP': '창의적이고 논리적, 새로운 아이디어를 좋아하며 토론을 즐김. 유머러스하고 적응력이 뛰어남.',
      'ENTJ': '리더십이 강하고 목표 지향적, 효율성을 중시하며 결단력이 있음. 야심차고 자신감이 넘침.',
      'ESFP': '활발하고 사교적, 현재를 즐기며 사람들과 어울리는 것을 좋아함. 유쾌하고 긍정적.',
      'ESFJ': '따뜻하고 책임감 강함, 타인을 돌보는 것을 좋아하며 전통을 중시. 충성심이 강하고 실용적.',
      'ESTP': '활동적이고 현실적, 순간을 즐기며 모험을 좋아함. 유연하고 적응력이 뛰어남.',
      'ESTJ': '체계적이고 책임감 강함, 전통과 질서를 중시하며 실용적. 리더십이 있고 신뢰할 수 있음.',
      'INFP': '이상주의적이고 창의적, 자신의 가치관을 중시하며 깊이 있는 관계를 선호. 예술적 감성이 풍부.',
      'INFJ': '직관적이고 통찰력이 뛰어남, 타인을 이해하고 도움을 주는 것을 좋아함. 신비롭고 깊이 있음.',
      'INTP': '논리적이고 분석적, 지식을 추구하며 독립적. 창의적이고 객관적 사고를 중시.',
      'INTJ': '전략적이고 독립적, 장기적 비전을 가지고 체계적으로 계획함. 완벽주의적이고 결단력이 있음.',
      'ISFP': '예술적이고 감성적, 자신의 가치관을 중시하며 조용한 성격. 따뜻하고 공감능력이 뛰어남.',
      'ISFJ': '따뜻하고 헌신적, 타인을 돌보는 것을 좋아하며 전통을 중시. 신뢰할 수 있고 책임감이 강함.',
      'ISTP': '실용적이고 독립적, 문제 해결 능력이 뛰어나며 조용한 성격. 유연하고 적응력이 좋음.',
      'ISTJ': '체계적이고 신뢰할 수 있음, 전통과 질서를 중시하며 책임감이 강함. 실용적이고 꼼꼼함.'
    };
    return traits[mbti] || '독특하고 매력적인 성격을 가진 사람입니다.';
  }

  private getConversationStyle(mbti: string, age: number, gender: 'male' | 'female'): string {
    const firstLetter = mbti[0];
    const secondLetter = mbti[1];
    const thirdLetter = mbti[2];
    const fourthLetter = mbti[3];

    let style = '';
    
    // E vs I
    if (firstLetter === 'E') {
      style += '- 활발하고 에너지 넘치는 대화 스타일\n';
      style += '- 질문을 많이 하고 상대방의 반응을 이끌어냄\n';
      style += '- "와!", "진짜?", "대박!" 같은 생생한 반응\n';
    } else {
      style += '- 차분하고 깊이 있는 대화를 선호\n';
      style += '- 경청을 잘하고 신중하게 답변\n';
      style += '- "음...", "그렇군요" 같은 차분한 반응\n';
    }

    // S vs N
    if (secondLetter === 'S') {
      style += '- 구체적이고 현실적인 이야기를 좋아함\n';
      style += '- 경험담이나 일상적인 주제를 선호\n';
      style += '- "어제 이런 일이 있었는데..." 같은 구체적 사례\n';
    } else {
      style += '- 추상적이고 미래지향적인 대화를 즐김\n';
      style += '- 아이디어나 철학적 주제에 관심\n';
      style += '- "만약에...", "언젠가는..." 같은 상상적 대화\n';
    }

    // T vs F
    if (thirdLetter === 'T') {
      style += '- 논리적이고 분석적인 관점\n';
      style += '- 객관적이고 합리적인 대화\n';
      style += '- "왜냐하면...", "분석해보면..." 같은 논리적 접근\n';
    } else {
      style += '- 감정적이고 공감적인 대화\n';
      style += '- 사람 중심적이고 따뜻한 관점\n';
      style += '- "이해해", "그럴 수 있어" 같은 공감 표현\n';
    }

    // J vs P
    if (fourthLetter === 'J') {
      style += '- 계획적이고 체계적인 대화\n';
      style += '- 결론을 내리고 정리하는 것을 좋아함\n';
      style += '- "그럼 이렇게 하자", "정리하면..." 같은 결론 지향\n';
    } else {
      style += '- 유연하고 개방적인 대화\n';
      style += '- 과정을 즐기고 새로운 가능성을 탐색\n';
      style += '- "아니면...", "다른 방법도..." 같은 유연한 사고\n';
    }

    return style;
  }

  private getAgeGroup(age: number): string {
    if (age < 25) return '20대 초반';
    if (age < 30) return '20대 후반';
    if (age < 35) return '30대 초반';
    if (age < 40) return '30대 후반';
    return '40대';
  }

  private getAgeSpecificTraits(age: number): string {
    if (age < 25) return '젊고 활발하며 새로운 것을 시도하는 것을 좋아함. SNS를 자주 사용하고 트렌드에 민감.';
    if (age < 30) return '성장하는 시기로 진로나 미래에 대한 고민이 많음. 연애와 결혼에 대한 관심이 높음.';
    if (age < 35) return '안정을 추구하며 진지한 관계를 원함. 경험을 바탕으로 한 조언을 잘함.';
    return '성숙하고 안정적이며 깊이 있는 대화를 선호. 인생 경험을 바탕으로 한 지혜가 있음.';
  }

  private getGenderTraits(gender: 'male' | 'female'): string {
    if (gender === 'male') {
      return '남성다운 매력과 배려심을 보여줌. 때로는 솔직하고 직설적이지만 따뜻한 마음이 있음.';
    } else {
      return '여성다운 섬세함과 공감능력을 보여줌. 세심하고 배려심이 많으며 감정 표현이 풍부함.';
    }
  }

  private getOccupationTraits(occupation: string): string {
    const traits: Record<string, string> = {
      '디자이너': '창의적이고 예술적 감각이 뛰어남. 아름다운 것에 관심이 많고 트렌드에 민감.',
      '개발자': '논리적이고 체계적 사고를 함. 문제 해결을 좋아하고 기술에 대한 열정이 있음.',
      '마케터': '사람들의 심리를 잘 이해하고 소통 능력이 뛰어남. 트렌드와 변화에 민감.',
      '기자': '호기심이 많고 소통 능력이 뛰어남. 다양한 주제에 관심이 있고 정보를 잘 전달함.',
      '교사': '배려심이 많고 인내심이 강함. 다른 사람의 성장을 도우는 것을 좋아함.',
      '간호사': '따뜻하고 헌신적이며 타인을 돌보는 것을 좋아함. 위기 상황에서도 침착함.',
      '의사': '책임감이 강하고 신중함. 타인을 돕는 것에 보람을 느끼며 지식이 풍부함.',
      '변호사': '논리적이고 분석적 사고를 함. 정의감이 강하고 소통 능력이 뛰어남.',
      '회계사': '꼼꼼하고 체계적이며 신뢰할 수 있음. 정확성과 완벽함을 추구함.',
      '영업': '사교적이고 적극적이며 목표 지향적. 사람들과의 관계를 중시함.',
      'HR': '사람을 잘 이해하고 소통 능력이 뛰어남. 조직과 개인의 조화를 추구함.',
      '기획자': '창의적이고 전략적 사고를 함. 새로운 아이디어를 좋아하고 실행력이 있음.',
      '유튜버': '창의적이고 표현력이 뛰어남. 사람들과 소통하는 것을 좋아하고 트렌드에 민감.',
      '카페 사장': '따뜻하고 친근하며 사람들과의 만남을 소중히 여김. 커피와 분위기에 대한 감각이 있음.',
      '승무원': '서비스 정신이 뛰어나고 글로벌 감각이 있음. 사람들을 배려하는 마음이 깊음.',
      '셰프': '창의적이고 완벽주의적. 맛과 미식에 대한 열정이 있으며 세심함이 뛰어남.',
      '작가': '감성적이고 창의적. 깊이 있는 사고와 표현력이 뛰어나며 독서를 좋아함.',
      '번역가': '언어에 대한 감각이 뛰어나고 세심함. 문화와 소통에 대한 이해가 깊음.',
      '상담사': '공감능력이 뛰어나고 사람을 잘 이해함. 따뜻하고 신뢰할 수 있는 성격.',
      '트레이너': '활동적이고 에너지가 넘침. 건강과 운동에 대한 열정이 있으며 동기부여를 잘함.',
      '건축가': '창의적이고 공간 감각이 뛰어남. 미학과 기능성을 모두 고려하는 사고를 함.',
      '예술가': '감성적이고 창의적. 아름다운 것에 대한 감각이 뛰어나며 자유로운 영혼.',
      '음악가': '감성적이고 표현력이 뛰어남. 음악에 대한 열정이 있으며 감정 표현이 풍부.',
      '배우': '표현력이 뛰어나고 감성적. 다양한 감정을 이해하고 표현하는 능력이 있음.',
      '모델': '아름다움에 대한 감각이 뛰어나고 자신감이 있음. 트렌드와 패션에 민감.',
      '편집자': '세심하고 완벽주의적. 내용에 대한 이해가 깊고 표현력이 뛰어남.',
      '사진작가': '예술적 감각이 뛰어나고 세심함. 아름다운 순간을 포착하는 능력이 있음.',
      '요리사': '창의적이고 완벽주의적. 맛과 미식에 대한 열정이 있으며 세심함이 뛰어남.',
      '바리스타': '세심하고 완벽주의적. 커피에 대한 전문성과 서비스 정신이 뛰어남.',
      '미용사': '예술적 감각이 뛰어나고 사람들과의 소통을 좋아함. 아름다움에 대한 감각이 있음.',
      '강사': '전달력이 뛰어나고 사람들을 가르치는 것을 좋아함. 지식과 경험을 공유하는 것을 즐김.',
      '연구원': '논리적이고 분석적. 지식을 추구하며 체계적인 사고를 함.',
      '엔지니어': '논리적이고 체계적. 문제 해결을 좋아하고 기술에 대한 열정이 있음.',
      '프로젝트 매니저': '조직력이 뛰어나고 리더십이 있음. 계획적이고 체계적인 사고를 함.'
    };
    return traits[occupation] || '전문적이고 열정적인 사람입니다.';
  }
}

