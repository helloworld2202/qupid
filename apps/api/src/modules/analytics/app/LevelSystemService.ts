import { AppError } from '../../../shared/errors/AppError.js';

export interface UserLevel {
  level: number;
  levelName: string;
  currentExp: number;
  requiredExp: number;
  progressPercentage: number;
  nextLevelExp: number;
  totalExp: number;
  achievements: string[];
  unlockedFeatures: string[];
}

export interface LevelRequirement {
  level: number;
  levelName: string;
  requiredExp: number;
  description: string;
  features: string[];
  requirements: {
    minConversationScore: number;
    minConversationCount: number;
    minWeeklyActivity: number;
    specialRequirements?: string[];
  };
}

export class LevelSystemService {
  private readonly LEVEL_REQUIREMENTS: LevelRequirement[] = [
    {
      level: 1,
      levelName: '초급',
      requiredExp: 0,
      description: '기본적인 인사, 자기소개',
      features: ['기본 페르소나와 대화', '튜토리얼 완료'],
      requirements: {
        minConversationScore: 0,
        minConversationCount: 0,
        minWeeklyActivity: 0
      }
    },
    {
      level: 2,
      levelName: '중급',
      requiredExp: 100,
      description: '관심사 대화, 공통점 찾기',
      features: ['다양한 페르소나 접근', '기본 분석 리포트'],
      requirements: {
        minConversationScore: 60,
        minConversationCount: 3,
        minWeeklyActivity: 2
      }
    },
    {
      level: 3,
      levelName: '고급',
      requiredExp: 300,
      description: '감정 공감, 위로하기',
      features: ['상세 분석 리포트', '개인화된 추천', '학습 콘텐츠 접근'],
      requirements: {
        minConversationScore: 70,
        minConversationCount: 10,
        minWeeklyActivity: 5
      }
    },
    {
      level: 4,
      levelName: '전문가',
      requiredExp: 600,
      description: '갈등 해결, 깊은 대화',
      features: ['커스텀 페르소나 생성', '고급 분석 도구', '실시간 코칭'],
      requirements: {
        minConversationScore: 80,
        minConversationCount: 25,
        minWeeklyActivity: 10
      }
    },
    {
      level: 5,
      levelName: '마스터',
      requiredExp: 1000,
      description: '실제 사용자 매칭 자격 획득',
      features: ['실제 사용자 매칭', '멘토링 기능', '프리미엄 콘텐츠'],
      requirements: {
        minConversationScore: 85,
        minConversationCount: 50,
        minWeeklyActivity: 15,
        specialRequirements: ['30일 연속 로그인', '5명 이상 다른 페르소나와 대화']
      }
    }
  ];

  /**
   * 사용자 레벨 계산
   */
  calculateUserLevel(
    totalExp: number,
    conversationScores: number[],
    conversationCount: number,
    weeklyActivity: number,
    specialAchievements: string[] = []
  ): UserLevel {
    const currentLevel = this.getCurrentLevel(totalExp);
    const nextLevel = this.getNextLevel(currentLevel);
    
    const currentLevelReq = this.LEVEL_REQUIREMENTS.find(req => req.level === currentLevel);
    const nextLevelReq = this.LEVEL_REQUIREMENTS.find(req => req.level === nextLevel);
    
    if (!currentLevelReq || !nextLevelReq) {
      throw AppError.internal('레벨 정보를 찾을 수 없습니다.');
    }
    
    const progressPercentage = Math.round(
      ((totalExp - currentLevelReq.requiredExp) / 
       (nextLevelReq.requiredExp - currentLevelReq.requiredExp)) * 100
    );
    
    const achievements = this.calculateAchievements(
      conversationScores,
      conversationCount,
      weeklyActivity,
      specialAchievements
    );
    
    const unlockedFeatures = this.getUnlockedFeatures(currentLevel);
    
    return {
      level: currentLevel,
      levelName: currentLevelReq.levelName,
      currentExp: totalExp,
      requiredExp: currentLevelReq.requiredExp,
      progressPercentage: Math.max(0, Math.min(100, progressPercentage)),
      nextLevelExp: nextLevelReq.requiredExp,
      totalExp,
      achievements,
      unlockedFeatures
    };
  }

  /**
   * 대화 완료 시 경험치 계산
   */
  calculateExpFromConversation(
    conversationScore: number,
    conversationLength: number,
    isTutorial: boolean = false
  ): number {
    let baseExp = 0;
    
    // 기본 경험치 (점수 기반)
    if (conversationScore >= 90) {
      baseExp = 25;
    } else if (conversationScore >= 80) {
      baseExp = 20;
    } else if (conversationScore >= 70) {
      baseExp = 15;
    } else if (conversationScore >= 60) {
      baseExp = 10;
    } else {
      baseExp = 5;
    }
    
    // 대화 길이 보너스
    if (conversationLength >= 20) {
      baseExp += 10;
    } else if (conversationLength >= 10) {
      baseExp += 5;
    }
    
    // 튜토리얼 보너스
    if (isTutorial) {
      baseExp += 15;
    }
    
    // 첫 대화 보너스
    // TODO: 사용자별 첫 대화 여부 확인 로직 필요
    
    return baseExp;
  }

  /**
   * 주간 활동 보너스 경험치 계산
   */
  calculateWeeklyBonus(weeklyConversationCount: number): number {
    if (weeklyConversationCount >= 10) {
      return 50; // 주간 10회 이상
    } else if (weeklyConversationCount >= 7) {
      return 30; // 주간 7회 이상
    } else if (weeklyConversationCount >= 5) {
      return 20; // 주간 5회 이상
    } else if (weeklyConversationCount >= 3) {
      return 10; // 주간 3회 이상
    }
    return 0;
  }

  /**
   * 특별 업적 경험치 계산
   */
  calculateAchievementExp(achievement: string): number {
    const achievementExp: { [key: string]: number } = {
      'first_conversation': 20,
      'tutorial_completed': 30,
      'week_streak': 25,
      'month_streak': 100,
      'high_score': 15,
      'diverse_topics': 20,
      'empathy_master': 30,
      'conversation_master': 50,
      'level_5_reached': 100
    };
    
    return achievementExp[achievement] || 0;
  }

  /**
   * 레벨업 가능 여부 확인
   */
  canLevelUp(currentLevel: number, totalExp: number): boolean {
    const nextLevel = this.getNextLevel(currentLevel);
    if (nextLevel === null) return false;
    
    const nextLevelReq = this.LEVEL_REQUIREMENTS.find(req => req.level === nextLevel);
    return nextLevelReq ? totalExp >= nextLevelReq.requiredExp : false;
  }

  /**
   * 레벨업 시 보상 계산
   */
  getLevelUpRewards(level: number): {
    exp: number;
    features: string[];
    message: string;
  } {
    const levelReq = this.LEVEL_REQUIREMENTS.find(req => req.level === level);
    
    if (!levelReq) {
      return {
        exp: 0,
        features: [],
        message: '레벨업을 축하합니다!'
      };
    }
    
    const expReward = level * 10; // 레벨당 10의 추가 경험치
    
    return {
      exp: expReward,
      features: levelReq.features,
      message: `레벨 ${level} (${levelReq.levelName}) 달성! ${levelReq.description}`
    };
  }

  private getCurrentLevel(totalExp: number): number {
    for (let i = this.LEVEL_REQUIREMENTS.length - 1; i >= 0; i--) {
      if (totalExp >= this.LEVEL_REQUIREMENTS[i].requiredExp) {
        return this.LEVEL_REQUIREMENTS[i].level;
      }
    }
    return 1;
  }

  private getNextLevel(currentLevel: number): number | null {
    const nextLevel = currentLevel + 1;
    return this.LEVEL_REQUIREMENTS.find(req => req.level === nextLevel) ? nextLevel : null;
  }

  private calculateAchievements(
    conversationScores: number[],
    conversationCount: number,
    weeklyActivity: number,
    specialAchievements: string[]
  ): string[] {
    const achievements: string[] = [...specialAchievements];
    
    // 첫 대화 업적
    if (conversationCount >= 1 && !achievements.includes('first_conversation')) {
      achievements.push('first_conversation');
    }
    
    // 튜토리얼 완료 업적
    if (conversationCount >= 1 && !achievements.includes('tutorial_completed')) {
      achievements.push('tutorial_completed');
    }
    
    // 주간 연속 업적
    if (weeklyActivity >= 7 && !achievements.includes('week_streak')) {
      achievements.push('week_streak');
    }
    
    // 고득점 업적
    const maxScore = Math.max(...conversationScores, 0);
    if (maxScore >= 90 && !achievements.includes('high_score')) {
      achievements.push('high_score');
    }
    
    // 대화 마스터 업적
    if (conversationCount >= 50 && !achievements.includes('conversation_master')) {
      achievements.push('conversation_master');
    }
    
    // 레벨 5 달성 업적
    if (this.getCurrentLevel(this.calculateTotalExp(conversationScores, conversationCount)) >= 5 && 
        !achievements.includes('level_5_reached')) {
      achievements.push('level_5_reached');
    }
    
    return achievements;
  }

  private getUnlockedFeatures(level: number): string[] {
    const features: string[] = [];
    
    for (const req of this.LEVEL_REQUIREMENTS) {
      if (level >= req.level) {
        features.push(...req.features);
      }
    }
    
    return [...new Set(features)]; // 중복 제거
  }

  private calculateTotalExp(conversationScores: number[], conversationCount: number): number {
    // 간단한 총 경험치 계산 (실제로는 데이터베이스에서 조회해야 함)
    let totalExp = 0;
    
    for (const score of conversationScores) {
      totalExp += this.calculateExpFromConversation(score, 10); // 평균 대화 길이 10으로 가정
    }
    
    // 주간 보너스 추가
    totalExp += this.calculateWeeklyBonus(conversationCount);
    
    return totalExp;
  }

  /**
   * 사용자별 레벨 진행 상황 조회
   */
  async getUserLevelProgress(userId: string): Promise<UserLevel> {
    // TODO: 데이터베이스에서 사용자 정보 조회
    // 현재는 임시 데이터 반환
    return this.calculateUserLevel(150, [70, 75, 80], 5, 3);
  }

  /**
   * 레벨별 요구사항 조회
   */
  getLevelRequirements(): LevelRequirement[] {
    return this.LEVEL_REQUIREMENTS;
  }

  /**
   * 특정 레벨의 요구사항 조회
   */
  getLevelRequirement(level: number): LevelRequirement | null {
    return this.LEVEL_REQUIREMENTS.find(req => req.level === level) || null;
  }
}
