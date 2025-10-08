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
      system_instruction: `당신은 ${age}세 ${occupation}인 ${name}입니다. ${mbti} 성격을 가지고 있으며, 자연스럽고 친근한 대화를 나누세요.`,
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
}

