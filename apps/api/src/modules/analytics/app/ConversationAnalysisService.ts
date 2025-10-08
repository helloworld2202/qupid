import { AppError } from '../../../shared/errors/AppError.js';

export interface ConversationMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  emotion?: string;
  intent?: string;
}

export interface ConversationMetrics {
  duration: number; // 대화 지속 시간 (분)
  messageCount: number; // 총 메시지 수
  userMessageCount: number; // 사용자 메시지 수
  aiMessageCount: number; // AI 메시지 수
  averageResponseTime: number; // 평균 응답 시간 (초)
  conversationTurns: number; // 대화 턴 수
}

export interface ConversationAnalysis {
  overallScore: number; // 전체 점수 (0-100)
  metrics: ConversationMetrics;
  strengths: string[]; // 강점들
  improvements: string[]; // 개선점들
  detailedFeedback: {
    communication: {
      score: number;
      feedback: string;
    };
    empathy: {
      score: number;
      feedback: string;
    };
    engagement: {
      score: number;
      feedback: string;
    };
    topicDiversity: {
      score: number;
      feedback: string;
    };
    questionQuality: {
      score: number;
      feedback: string;
    };
  };
  recommendations: {
    immediate: string[]; // 즉시 개선 가능한 점들
    longTerm: string[]; // 장기적 개선 사항들
    learningContent: string[]; // 추천 학습 콘텐츠
  };
  nextGoals: string[]; // 다음 목표들
}

export class ConversationAnalysisService {
  /**
   * 대화 분석 수행
   */
  async analyzeConversation(
    messages: ConversationMessage[],
    personaProfile: any,
    isTutorial: boolean = false
  ): Promise<ConversationAnalysis> {
    try {
      // 기본 메트릭 계산
      const metrics = this.calculateMetrics(messages);
      
      // 각 영역별 점수 계산
      const communicationScore = this.analyzeCommunication(messages);
      const empathyScore = this.analyzeEmpathy(messages);
      const engagementScore = this.analyzeEngagement(messages);
      const topicDiversityScore = this.analyzeTopicDiversity(messages);
      const questionQualityScore = this.analyzeQuestionQuality(messages);
      
      // 전체 점수 계산 (가중평균)
      const overallScore = Math.round(
        (communicationScore.score * 0.25) +
        (empathyScore.score * 0.25) +
        (engagementScore.score * 0.20) +
        (topicDiversityScore.score * 0.15) +
        (questionQualityScore.score * 0.15)
      );
      
      // 강점과 개선점 분석
      const strengths = this.identifyStrengths({
        communication: communicationScore.score,
        empathy: empathyScore.score,
        engagement: engagementScore.score,
        topicDiversity: topicDiversityScore.score,
        questionQuality: questionQualityScore.score
      });
      
      const improvements = this.identifyImprovements({
        communication: communicationScore.score,
        empathy: empathyScore.score,
        engagement: engagementScore.score,
        topicDiversity: topicDiversityScore.score,
        questionQuality: questionQualityScore.score
      });
      
      // 추천사항 생성
      const recommendations = this.generateRecommendations(
        strengths,
        improvements,
        isTutorial
      );
      
      // 다음 목표 설정
      const nextGoals = this.generateNextGoals(overallScore, improvements);
      
      return {
        overallScore,
        metrics,
        strengths,
        improvements,
        detailedFeedback: {
          communication: communicationScore,
          empathy: empathyScore,
          engagement: engagementScore,
          topicDiversity: topicDiversityScore,
          questionQuality: questionQualityScore
        },
        recommendations,
        nextGoals
      };
    } catch (error) {
      console.error('Conversation analysis error:', error);
      throw AppError.internal('대화 분석 중 오류가 발생했습니다.');
    }
  }

  private calculateMetrics(messages: ConversationMessage[]): ConversationMetrics {
    const userMessages = messages.filter(m => m.sender === 'user');
    const aiMessages = messages.filter(m => m.sender === 'ai');
    
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    const duration = lastMessage && firstMessage 
      ? Math.round((lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime()) / (1000 * 60))
      : 0;
    
    // 대화 턴 수 계산 (사용자 메시지 기준)
    const conversationTurns = userMessages.length;
    
    // 평균 응답 시간 계산 (간단한 추정)
    const averageResponseTime = conversationTurns > 0 ? 30 : 0; // 30초로 가정
    
    return {
      duration,
      messageCount: messages.length,
      userMessageCount: userMessages.length,
      aiMessageCount: aiMessages.length,
      averageResponseTime,
      conversationTurns
    };
  }

  private analyzeCommunication(messages: ConversationMessage[]): { score: number; feedback: string } {
    const userMessages = messages.filter(m => m.sender === 'user');
    
    if (userMessages.length === 0) {
      return {
        score: 0,
        feedback: '사용자 메시지가 없어 분석할 수 없습니다.'
      };
    }
    
    let score = 50; // 기본 점수
    const feedbacks: string[] = [];
    
    // 메시지 길이 분석
    const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
    if (avgLength > 20) {
      score += 15;
      feedbacks.push('적절한 메시지 길이를 유지하고 있습니다.');
    } else if (avgLength < 10) {
      score -= 10;
      feedbacks.push('메시지를 좀 더 자세히 작성해보세요.');
    }
    
    // 질문 사용 빈도
    const questionCount = userMessages.filter(m => m.content.includes('?')).length;
    const questionRatio = questionCount / userMessages.length;
    if (questionRatio > 0.3) {
      score += 20;
      feedbacks.push('상대방에게 관심을 보이는 질문을 잘 하고 있습니다.');
    } else if (questionRatio < 0.1) {
      score -= 15;
      feedbacks.push('상대방에게 더 많은 질문을 해보세요.');
    }
    
    // 감정 표현 분석
    const emotionWords = ['좋아', '싫어', '기뻐', '슬퍼', '화나', '놀라', '재미있', '지루'];
    const hasEmotion = userMessages.some(m => 
      emotionWords.some(word => m.content.includes(word))
    );
    if (hasEmotion) {
      score += 15;
      feedbacks.push('감정을 잘 표현하고 있습니다.');
    } else {
      score -= 10;
      feedbacks.push('감정을 더 표현해보세요.');
    }
    
    // 공감 표현 분석
    const empathyWords = ['이해해', '공감해', '그렇구나', '맞아', '동감해'];
    const hasEmpathy = userMessages.some(m => 
      empathyWords.some(word => m.content.includes(word))
    );
    if (hasEmpathy) {
      score += 10;
      feedbacks.push('상대방의 말에 공감하고 있습니다.');
    }
    
    return {
      score: Math.max(0, Math.min(100, score)),
      feedback: feedbacks.length > 0 ? feedbacks.join(' ') : '기본적인 소통을 하고 있습니다.'
    };
  }

  private analyzeEmpathy(messages: ConversationMessage[]): { score: number; feedback: string } {
    const userMessages = messages.filter(m => m.sender === 'user');
    
    if (userMessages.length === 0) {
      return {
        score: 0,
        feedback: '사용자 메시지가 없어 분석할 수 없습니다.'
      };
    }
    
    let score = 50;
    const feedbacks: string[] = [];
    
    // 공감 표현 분석
    const empathyWords = ['이해해', '공감해', '그렇구나', '맞아', '동감해', '알겠어', '그럴 수 있어'];
    const empathyCount = userMessages.reduce((count, m) => 
      count + empathyWords.filter(word => m.content.includes(word)).length, 0
    );
    
    if (empathyCount > 2) {
      score += 25;
      feedbacks.push('상대방의 감정을 잘 이해하고 공감하고 있습니다.');
    } else if (empathyCount === 0) {
      score -= 20;
      feedbacks.push('상대방의 말에 더 공감하는 표현을 사용해보세요.');
    }
    
    // 위로 표현 분석
    const comfortWords = ['괜찮아', '힘내', '응원해', '걱정하지 마', '잘될 거야'];
    const hasComfort = userMessages.some(m => 
      comfortWords.some(word => m.content.includes(word))
    );
    if (hasComfort) {
      score += 15;
      feedbacks.push('상대방을 위로하는 표현을 잘 사용하고 있습니다.');
    }
    
    // 칭찬 표현 분석
    const praiseWords = ['좋아', '멋져', '대단해', '잘했어', '훌륭해'];
    const hasPraise = userMessages.some(m => 
      praiseWords.some(word => m.content.includes(word))
    );
    if (hasPraise) {
      score += 10;
      feedbacks.push('상대방을 칭찬하는 표현을 사용하고 있습니다.');
    }
    
    return {
      score: Math.max(0, Math.min(100, score)),
      feedback: feedbacks.length > 0 ? feedbacks.join(' ') : '기본적인 공감 능력을 보이고 있습니다.'
    };
  }

  private analyzeEngagement(messages: ConversationMessage[]): { score: number; feedback: string } {
    const userMessages = messages.filter(m => m.sender === 'user');
    
    if (userMessages.length === 0) {
      return {
        score: 0,
        feedback: '사용자 메시지가 없어 분석할 수 없습니다.'
      };
    }
    
    let score = 50;
    const feedbacks: string[] = [];
    
    // 대화 지속성 분석
    if (userMessages.length >= 5) {
      score += 20;
      feedbacks.push('대화를 잘 이어가고 있습니다.');
    } else if (userMessages.length < 3) {
      score -= 20;
      feedbacks.push('대화를 더 길게 이어가보세요.');
    }
    
    // 적극적 참여 분석
    const activeWords = ['어떻게', '왜', '어디서', '언제', '누가', '무엇을', '어떤'];
    const activeCount = userMessages.reduce((count, m) => 
      count + activeWords.filter(word => m.content.includes(word)).length, 0
    );
    
    if (activeCount > 1) {
      score += 15;
      feedbacks.push('적극적으로 대화에 참여하고 있습니다.');
    }
    
    // 흥미 표현 분석
    const interestWords = ['재미있', '흥미롭', '신기', '놀라', '대단', '멋져'];
    const hasInterest = userMessages.some(m => 
      interestWords.some(word => m.content.includes(word))
    );
    if (hasInterest) {
      score += 15;
      feedbacks.push('상대방의 이야기에 흥미를 보이고 있습니다.');
    }
    
    return {
      score: Math.max(0, Math.min(100, score)),
      feedback: feedbacks.length > 0 ? feedbacks.join(' ') : '기본적인 참여도를 보이고 있습니다.'
    };
  }

  private analyzeTopicDiversity(messages: ConversationMessage[]): { score: number; feedback: string } {
    const userMessages = messages.filter(m => m.sender === 'user');
    
    if (userMessages.length === 0) {
      return {
        score: 0,
        feedback: '사용자 메시지가 없어 분석할 수 없습니다.'
      };
    }
    
    let score = 50;
    const feedbacks: string[] = [];
    
    // 주제 키워드 분석
    const topicKeywords = {
      '일상': ['오늘', '어제', '내일', '요즘', '평소'],
      '취미': ['좋아', '취미', '관심', '즐겨', '해봐'],
      '음식': ['먹', '음식', '맛있', '요리', '식당'],
      '여행': ['여행', '가봤', '가고 싶', '여기', '저기'],
      '일': ['일', '직장', '회사', '업무', '일하'],
      '감정': ['기뻐', '슬퍼', '화나', '좋아', '싫어']
    };
    
    const mentionedTopics = Object.keys(topicKeywords).filter(topic =>
      userMessages.some(m => 
        topicKeywords[topic as keyof typeof topicKeywords].some(keyword => 
          m.content.includes(keyword)
        )
      )
    );
    
    if (mentionedTopics.length >= 3) {
      score += 25;
      feedbacks.push('다양한 주제로 대화를 이끌고 있습니다.');
    } else if (mentionedTopics.length === 1) {
      score -= 15;
      feedbacks.push('더 다양한 주제로 대화를 확장해보세요.');
    }
    
    return {
      score: Math.max(0, Math.min(100, score)),
      feedback: feedbacks.length > 0 ? feedbacks.join(' ') : '기본적인 주제 다양성을 보이고 있습니다.'
    };
  }

  private analyzeQuestionQuality(messages: ConversationMessage[]): { score: number; feedback: string } {
    const userMessages = messages.filter(m => m.sender === 'user');
    
    if (userMessages.length === 0) {
      return {
        score: 0,
        feedback: '사용자 메시지가 없어 분석할 수 없습니다.'
      };
    }
    
    let score = 50;
    const feedbacks: string[] = [];
    
    // 질문 개수 분석
    const questions = userMessages.filter(m => m.content.includes('?'));
    const questionRatio = questions.length / userMessages.length;
    
    if (questionRatio > 0.2) {
      score += 20;
      feedbacks.push('적절한 비율로 질문을 하고 있습니다.');
    } else if (questionRatio < 0.05) {
      score -= 20;
      feedbacks.push('더 많은 질문을 해보세요.');
    }
    
    // 질문 품질 분석
    const goodQuestionWords = ['어떻게', '왜', '어떤', '언제', '어디서', '누구와'];
    const hasGoodQuestions = questions.some(q => 
      goodQuestionWords.some(word => q.content.includes(word))
    );
    
    if (hasGoodQuestions) {
      score += 15;
      feedbacks.push('구체적이고 좋은 질문을 하고 있습니다.');
    }
    
    // 개방형 질문 분석
    const openQuestions = questions.filter(q => 
      q.content.includes('어떻게') || q.content.includes('왜') || q.content.includes('어떤')
    );
    
    if (openQuestions.length > 0) {
      score += 15;
      feedbacks.push('개방형 질문을 잘 사용하고 있습니다.');
    }
    
    return {
      score: Math.max(0, Math.min(100, score)),
      feedback: feedbacks.length > 0 ? feedbacks.join(' ') : '기본적인 질문 능력을 보이고 있습니다.'
    };
  }

  private identifyStrengths(scores: { [key: string]: number }): string[] {
    const strengths: string[] = [];
    
    if (scores.communication >= 80) {
      strengths.push('소통 능력이 뛰어납니다');
    }
    if (scores.empathy >= 80) {
      strengths.push('공감 능력이 뛰어납니다');
    }
    if (scores.engagement >= 80) {
      strengths.push('적극적인 참여도를 보입니다');
    }
    if (scores.topicDiversity >= 80) {
      strengths.push('다양한 주제로 대화를 이끕니다');
    }
    if (scores.questionQuality >= 80) {
      strengths.push('질문의 질이 높습니다');
    }
    
    return strengths.length > 0 ? strengths : ['기본적인 대화 능력을 보이고 있습니다'];
  }

  private identifyImprovements(scores: { [key: string]: number }): string[] {
    const improvements: string[] = [];
    
    if (scores.communication < 60) {
      improvements.push('소통 능력 향상이 필요합니다');
    }
    if (scores.empathy < 60) {
      improvements.push('공감 능력 향상이 필요합니다');
    }
    if (scores.engagement < 60) {
      improvements.push('적극적인 참여가 필요합니다');
    }
    if (scores.topicDiversity < 60) {
      improvements.push('주제 다양성 확장이 필요합니다');
    }
    if (scores.questionQuality < 60) {
      improvements.push('질문 능력 향상이 필요합니다');
    }
    
    return improvements.length > 0 ? improvements : ['전반적인 대화 능력 향상이 필요합니다'];
  }

  private generateRecommendations(
    strengths: string[],
    improvements: string[],
    isTutorial: boolean
  ): { immediate: string[]; longTerm: string[]; learningContent: string[] } {
    const immediate: string[] = [];
    const longTerm: string[] = [];
    const learningContent: string[] = [];
    
    // 즉시 개선 가능한 사항들
    if (improvements.some(imp => imp.includes('소통'))) {
      immediate.push('메시지를 더 자세히 작성해보세요');
      immediate.push('상대방에게 질문을 더 많이 해보세요');
    }
    
    if (improvements.some(imp => imp.includes('공감'))) {
      immediate.push('상대방의 말에 공감하는 표현을 사용해보세요');
      immediate.push('"이해해요", "그렇구나" 같은 표현을 활용해보세요');
    }
    
    if (improvements.some(imp => imp.includes('참여'))) {
      immediate.push('대화를 더 길게 이어가보세요');
      immediate.push('상대방의 이야기에 흥미를 보이는 표현을 사용해보세요');
    }
    
    // 장기적 개선 사항들
    if (improvements.some(imp => imp.includes('주제'))) {
      longTerm.push('다양한 관심사를 개발해보세요');
      longTerm.push('새로운 경험을 쌓아보세요');
    }
    
    if (improvements.some(imp => imp.includes('질문'))) {
      longTerm.push('호기심을 기르고 관심을 가져보세요');
      longTerm.push('상대방에 대해 더 알고 싶어하는 마음을 가져보세요');
    }
    
    // 학습 콘텐츠 추천
    if (isTutorial) {
      learningContent.push('대화의 기본 - 경청과 공감');
      learningContent.push('질문 기술 향상');
    } else {
      learningContent.push('상황별 대화법');
      learningContent.push('감정 표현 방법');
      learningContent.push('관심사 기반 대화 전개');
    }
    
    return { immediate, longTerm, learningContent };
  }

  private generateNextGoals(overallScore: number, improvements: string[]): string[] {
    const goals: string[] = [];
    
    if (overallScore < 60) {
      goals.push('기본적인 대화 능력 향상');
      goals.push('상대방과의 자연스러운 소통');
    } else if (overallScore < 80) {
      goals.push('대화 품질 향상');
      goals.push('더 깊이 있는 대화');
    } else {
      goals.push('고급 대화 기술 습득');
      goals.push('다양한 상황에서의 대화 능력');
    }
    
    if (improvements.some(imp => imp.includes('공감'))) {
      goals.push('공감 능력 향상');
    }
    if (improvements.some(imp => imp.includes('주제'))) {
      goals.push('주제 다양성 확장');
    }
    
    return goals;
  }
}

