import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Persona, Message, RealtimeFeedback, TutorialStep, ConversationAnalysis, AICoach, ConversationMode } from '@qupid/core';
import { ArrowLeftIcon, PaperAirplaneIcon, CoachKeyIcon } from '@qupid/ui';
import { TUTORIAL_STEPS } from '@qupid/core';
import { useChatSession, useSendMessage, useAnalyzeConversation, useRealtimeFeedback, useCoachSuggestion } from '../hooks/useChatQueries';
import { useCreateCoachingSession, useSendCoachingMessage, useAnalyzeCoachingSession } from '../../coaching/hooks/useCoachingQueries';
import { useStyleAnalysis } from '../hooks/useStyleAnalysis';
import { useStreamingChat } from '../../../shared/hooks/useStreamingChat';
import { StyleRecommendationModal } from './StyleRecommendationModal';

interface ChatScreenProps {
  partner?: Persona | AICoach;
  isTutorial?: boolean;
  isCoaching?: boolean;
  conversationMode?: ConversationMode;
  userProfile?: any; // 사용자 프로필 정보 추가
  onComplete: (analysis: ConversationAnalysis | null, tutorialJustCompleted: boolean) => void;
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center justify-center space-x-1 p-2">
    <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s] bg-gray-500"></div>
    <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s] bg-gray-500"></div>
    <div className="w-2 h-2 rounded-full animate-bounce bg-gray-500"></div>
  </div>
);

const RealtimeFeedbackToast: React.FC<{ feedback: RealtimeFeedback }> = ({ feedback }) => (
    <div className="absolute bottom-24 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg flex items-center animate-fade-in-up shadow-lg z-10">
        <span className={`mr-2 text-lg ${feedback.isGood ? 'text-green-400' : 'text-yellow-400'}`}>{feedback.isGood ? '✅' : '💡'}</span>
        <span className="text-sm font-medium">{feedback.message}</span>
    </div>
);

const CoachHint: React.FC<{ 
    isLoading: boolean;
    suggestion: {reason: string, suggestion: string} | null;
    onApply: (text: string) => void; 
    onClose: () => void; 
}> = ({ isLoading, suggestion, onApply, onClose }) => {
    return (
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20">
             <div className="p-5 bg-white rounded-2xl border-2 border-[#F093B0] shadow-xl animate-scale-in">
                <p className="font-bold text-lg text-[#191F28] flex items-center"><CoachKeyIcon className="w-5 h-5 mr-2 text-[#F093B0]" /> 코치 제안</p>
                {isLoading && (
                    <div className="mt-2 text-center h-24 flex items-center justify-center">
                        <TypingIndicator/>
                    </div>
                )}
                {suggestion && !isLoading && (
                    <>
                        <p className="mt-2 text-base text-[#4F7ABA]">{suggestion.reason}</p>
                        <p className="mt-3 text-base text-[#191F28] font-semibold bg-[#F9FAFB] p-3 rounded-lg border border-[#F2F4F6]">"{suggestion.suggestion}"</p>
                    </>
                )}
                <div className="mt-4 flex space-x-2">
                    <button onClick={() => suggestion && onApply(suggestion.suggestion)} disabled={isLoading || !suggestion} className="flex-1 h-10 bg-[#F093B0] text-white rounded-lg text-sm font-bold disabled:opacity-50">적용하기</button>
                    <button onClick={onClose} className="flex-1 h-10 bg-[#F9FAFB] text-[#8B95A1] rounded-lg text-sm font-bold">직접 입력</button>
                </div>
            </div>
        </div>
    );
};

// 자연스러운 첫 메시지 생성 함수
const generateNaturalFirstMessage = (partner: Persona | AICoach, userProfile?: any): string => {
  const userName = userProfile?.name || '사용자님';
  const userAge = userProfile?.age;
  const userJob = userProfile?.job;
  
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
  
  // 페르소나의 MBTI와 성격에 따른 다양한 첫 메시지
  const mbti = 'mbti' in partner ? partner.mbti || 'ENFP' : 'ENFP';
  const personaName = partner.name;
  const personaAge = 'age' in partner ? partner.age : 25;
  const personaJob = 'job' in partner ? partner.job : '일반인';
  
  // 🚀 맥락 기반 자연스러운 첫 메시지 패턴 (사용자에게 질문하여 대화 시작)
  const messagePatterns: Record<string, string[]> = {
    'ENFP': [
      `${timeGreeting}! 저는 ${personaName}이에요 😊 ${personaAge}세 ${personaJob}인데, ${userName}님은 어떤 일을 하시나요?`,
      `안녕하세요! ${personaName}이에요! ${personaJob}로 일하고 있는데, ${userName}님은 어떤 취미가 있으세요?`,
      `반가워요! 저는 ${personaName}이에요 😊 ${personaAge}세 ${personaJob}인데, 오늘 어떤 하루 보내고 계세요?`,
      `안녕하세요! ${personaName}이에요! ${personaJob}로 일하고 있는데, ${userName}님은 어떤 걸 좋아하세요?`,
      `반가워요! 저는 ${personaName}이에요! ${personaAge}세 ${personaJob}인데, 어떤 음악을 즐겨 들어요?`,
      `안녕하세요! ${personaName}이에요! ${personaJob}로 일하고 있는데, 최근에 재밌게 본 영화가 있나요?`
    ],
    'ISFJ': [
      `안녕하세요 ${userName}. 저는 ${personaName}이에요. ${personaAge}세 ${personaJob}로 일하고 있어요. ${userName}님은 어떤 일을 하시나요?`,
      `${timeGreeting}. ${personaName}입니다. ${personaJob}로 일하고 있는데, ${userName}님은 어떤 책을 좋아하세요?`,
      `안녕하세요. 저는 ${personaName}이에요. ${personaAge}세 ${personaJob}인데, 오늘 하루는 어떠셨나요?`,
      `반가워요. ${personaName}이에요. ${personaJob}로 일하고 있는데, ${userName}님은 어떤 음식을 좋아하세요?`,
      `안녕하세요. ${personaName}입니다. ${personaAge}세 ${personaJob}인데, 주말에는 보통 뭐 하세요?`,
      `${timeGreeting}. 저는 ${personaName}이에요. ${personaJob}로 일하는데, ${userName}님은 어떤 장소를 좋아하세요?`
    ],
    'INTJ': [
      `안녕하세요 ${userName}. ${personaName}입니다. ${personaAge}세 ${personaJob}로 일하고 있어요. ${userName}님의 목표는 무엇인가요?`,
      `${timeGreeting}. 저는 ${personaName}이에요. ${personaJob}로 일하는데, ${userName}님은 어떤 분야에 관심이 있으세요?`,
      `안녕하세요. ${personaName}입니다. ${personaJob}로 일하고 있는데, ${userName}님은 어떤 프로젝트를 하고 계세요?`,
      `반가워요. ${personaName}이에요. ${personaAge}세 ${personaJob}인데, 어떤 걸 배우고 싶으세요?`,
      `안녕하세요. ${personaName}입니다. ${personaJob}로 일하고 있는데, ${userName}님의 계획은 무엇인가요?`,
      `${timeGreeting}. 저는 ${personaName}이에요. ${personaJob}로 일하는데, ${userName}님은 어떤 문제를 해결하고 싶으세요?`
    ],
    'ESFP': [
      `${timeGreeting}! ${personaName}이에요! 😆 ${personaAge}세 ${personaJob}인데, ${userName}님은 오늘 뭐 재밌는 일 있었어요?`,
      `안녕하세요! ${personaName}이에요! 🎉 ${personaJob}로 일하고 있는데, ${userName}님은 어떤 활동을 좋아하세요?`,
      `반가워요! 저는 ${personaName}이에요! 오늘 기분은 어떠세요? 😊`,
      `안녕하세요! ${personaName}이에요! ${personaJob}로 일하는데, ${userName}님은 어떤 걸로 스트레스 푸세요?`,
      `반가워요! 저는 ${personaName}이에요! ${personaAge}세 ${personaJob}인데, 주말에는 보통 뭐 하세요?`,
      `안녕하세요! ${personaName}이에요! ${personaJob}로 일하고 있는데, ${userName}님은 어떤 장소를 좋아하세요?`
    ],
    'INFP': [
      `안녕하세요 ${userName}... 저는 ${personaName}이에요 😊 ${personaAge}세 ${personaJob}인데, ${userName}님은 어떤 음악을 좋아하세요?`,
      `${timeGreeting}... 저는 ${personaName}이에요. ${personaJob}로 일하고 있는데, ${userName}님은 어떤 책을 좋아하세요?`,
      `안녕하세요. ${personaName}이에요... ${personaAge}세 ${personaJob}인데, ${userName}님은 어떤 영화를 좋아하세요?`,
      `반가워요... 저는 ${personaName}이에요. ${personaJob}로 일하는데, 오늘 하루는 어떠셨나요?`,
      `안녕하세요. ${personaName}이에요... ${personaAge}세 ${personaJob}인데, ${userName}님은 어떤 꿈이 있으세요?`,
      `${timeGreeting}... 저는 ${personaName}이에요. ${personaJob}로 일하고 있는데, ${userName}님은 어떤 가치를 중요하게 생각하세요?`
    ],
    'ENTP': [
      `안녕하세요! ${personaName}이에요! ${personaAge}세 ${personaJob}인데, ${userName}님은 어떤 주제에 관심이 있으세요?`,
      `${timeGreeting}! 저는 ${personaName}이에요. ${personaJob}로 일하는데, ${userName}님은 어떤 아이디어가 있으세요?`,
      `반가워요! ${personaName}이에요! ${personaJob}로 일하고 있는데, ${userName}님은 어떤 걸 창조하는 걸 좋아하세요?`,
      `안녕하세요! ${personaName}이에요! ${personaAge}세 ${personaJob}인데, ${userName}님은 어떤 도전을 하고 계세요?`,
      `반가워요! 저는 ${personaName}이에요! ${personaJob}로 일하는데, ${userName}님은 어떤 혁신에 관심이 있으세요?`,
      `안녕하세요! ${personaName}이에요! ${personaJob}로 일하고 있는데, ${userName}님은 어떤 문제를 해결하고 싶으세요?`
    ],
    'ESTJ': [
      `안녕하세요. ${personaName}입니다. ${personaAge}세 ${personaJob}로 일하고 있어요. ${userName}님은 어떤 일을 하고 계세요?`,
      `${timeGreeting}. 저는 ${personaName}이에요. ${personaJob}로 일하는데, ${userName}님의 목표는 무엇인가요?`,
      `안녕하세요. ${personaName}입니다. ${personaJob}로 일하고 있는데, ${userName}님은 어떤 문제를 해결하고 계세요?`,
      `반가워요. ${personaName}이에요. ${personaAge}세 ${personaJob}인데, ${userName}님은 어떤 방법으로 효율성을 높이세요?`,
      `안녕하세요. ${personaName}입니다. ${personaJob}로 일하는데, ${userName}님은 어떤 리더십 스타일을 가지고 계세요?`,
      `${timeGreeting}. 저는 ${personaName}이에요. ${personaJob}로 일하고 있는데, ${userName}님은 어떤 계획을 세우고 계세요?`
    ]
  };

  const patterns = messagePatterns[mbti] || [
    `안녕하세요 ${userName}! 저는 ${personaName}이에요 😊 ${personaAge}세 ${personaJob}인데, 편하게 대화해요!`,
    `${timeGreeting}! ${personaName}이에요. ${personaJob}로 일하고 있는데, 새로운 분과 대화할 수 있어서 기뻐요.`,
    `반가워요! 저는 ${personaName}이에요. ${personaAge}세 ${personaJob}인데, 어떤 이야기든 편하게 해봐요!`
  ];

  // 페르소나 이름 기반으로 패턴 선택 (일관성 유지)
  let seed = 0;
  for (let i = 0; i < personaName.length; i++) {
    seed += personaName.charCodeAt(i);
  }
  
  return patterns[seed % patterns.length];
};

export const ChatScreen: React.FC<ChatScreenProps> = ({ partner, isTutorial = false, isCoaching = false, conversationMode = 'normal', userProfile, onComplete }) => {
  // partner가 없으면 에러 처리
  if (!partner) {
    return (
      <div className="flex flex-col h-full w-full bg-white items-center justify-center">
        <p className="text-[#8B95A1]">대화 파트너를 선택해주세요.</p>
      </div>
    );
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMode, setCurrentMode] = useState<ConversationMode>(conversationMode);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [realtimeFeedback, setRealtimeFeedback] = useState<RealtimeFeedback | null>(null);
  const [isTutorialMode, setIsTutorialMode] = useState(isTutorial);
  
  // 🚀 스트리밍 대화 기능
  const { isStreaming, streamingMessage, startStreaming, stopStreaming } = useStreamingChat({
    onMessageComplete: (message) => {
      setMessages(prev => [...prev, message]);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Streaming error:', error);
      setIsLoading(false);
    }
  });
  
  // isTutorial prop이 변경되면 isTutorialMode 상태도 업데이트
  useEffect(() => {
    setIsTutorialMode(isTutorial);
  }, [isTutorial]);
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>(TUTORIAL_STEPS[0]);
  const [isTutorialComplete, setIsTutorialComplete] = useState(false);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
  
  const [showCoachHint, setShowCoachHint] = useState(false);
  const [coachSuggestion, setCoachSuggestion] = useState<{reason: string, suggestion: string} | null>(null);
  const [isFetchingSuggestion, setIsFetchingSuggestion] = useState(false);
  
  // 🚀 실시간 대화 분석 시스템
  const [conversationAnalysis, setConversationAnalysis] = useState<any>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [styleAnalysis, setStyleAnalysis] = useState<any>(null);

  const sessionIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  // 페르소나의 성격에 맞는 자연스러운 첫 메시지 생성
  const generatePersonaStyleFirstMessage = (partner: Persona) => {
    const mbti = partner.mbti || 'ENFP';
    const age = partner.age;
    const job = partner.job || '학생';
    const name = partner.name;
    const userName = userProfile?.name || '사용자님';
    
    // 사용자 프로필 정보 활용
    const userAge = userProfile?.age;
    const userJob = userProfile?.job;
    const userExperience = userProfile?.experience;
    
    // MBTI별 대화 스타일 (사용자 정보 포함)
    const mbtiStyles = {
      'ENFP': `안녕하세요 ${userName}! 저는 ${name}이에요 😊 ${age}세 ${job}인데, 오늘 처음 만나서 정말 기대돼요! ${userName}님은 어떤 분이실까 궁금해요~`,
      'ENFJ': `안녕하세요 ${userName}! ${name}입니다 😊 ${age}세 ${job}로 일하고 있어요. 편하게 대화해요! ${userName}님 이야기 들어드릴게요.`,
      'ENTP': `어? 안녕하세요 ${userName}! ${name}이에요 😄 ${age}세 ${job}인데, 뭔가 재미있는 이야기 들려주실 것 같은데요?`,
      'ENTJ': `안녕하세요 ${userName}. ${name}입니다. ${age}세 ${job}로 일하고 있어요. 시간이 있으니 편하게 대화해봐요.`,
      'INFP': `안녕하세요 ${userName}... 저는 ${name}이에요 😊 ${age}세 ${job}인데, 조금 부끄럽지만... 편하게 대화해요.`,
      'INFJ': `안녕하세요 ${userName}. ${name}입니다. ${age}세 ${job}로 일하고 있어요. 조용히 대화해봐요.`,
      'INTP': `안녕하세요 ${userName}. ${name}이에요. ${age}세 ${job}인데... 음, 뭔가 대화하기 어색하네요 😅`,
      'INTJ': `안녕하세요 ${userName}. ${name}입니다. ${age}세 ${job}로 일하고 있어요. 효율적으로 대화해봅시다.`,
      'ESFP': `안녕하세요 ${userName}! ${name}이에요! 😆 ${age}세 ${job}인데, 오늘 정말 좋은 하루네요! 뭔가 즐거운 이야기 해요!`,
      'ESFJ': `안녕하세요 ${userName}! ${name}입니다 😊 ${age}세 ${job}로 일하고 있어요. 편하게 대화해요! 뭔가 도움이 될 이야기 해봐요.`,
      'ESTP': `어! 안녕하세요 ${userName}! ${name}이에요 😎 ${age}세 ${job}인데, 뭔가 재미있는 일 있나요?`,
      'ESTJ': `안녕하세요 ${userName}. ${name}입니다. ${age}세 ${job}로 일하고 있어요. 체계적으로 대화해봅시다.`,
      'ISFP': `안녕하세요 ${userName}... 저는 ${name}이에요 😊 ${age}세 ${job}인데, 조용히 대화해요...`,
      'ISFJ': `안녕하세요 ${userName}. ${name}입니다. ${age}세 ${job}로 일하고 있어요. 편하게 대화해요.`,
      'ISTP': `안녕하세요 ${userName}. ${name}이에요. ${age}세 ${job}인데... 음, 뭔가 대화하기 어색하네요.`,
      'ISTJ': `안녕하세요 ${userName}. ${name}입니다. ${age}세 ${job}로 일하고 있어요. 차근차근 대화해봅시다.`
    };

    return mbtiStyles[mbti as keyof typeof mbtiStyles] || `안녕하세요 ${userName}! 저는 ${name}이에요 😊 ${age}세 ${job}인데, 편하게 대화해요!`;
  };

  // API hooks
  const createSessionMutation = useChatSession();
  const sendMessageMutation = useSendMessage();
  const analyzeMutation = useAnalyzeConversation();
  const feedbackMutation = useRealtimeFeedback();
  const coachMutation = useCoachSuggestion();
  const styleAnalysisMutation = useStyleAnalysis();
  
  // 코칭 세션 hooks
  const createCoachingSessionMutation = useCreateCoachingSession();
  const sendCoachingMessageMutation = useSendCoachingMessage();
  const analyzeCoachingMutation = useAnalyzeCoachingSession();

  const fetchAndShowSuggestion = useCallback(async () => {
    if (isFetchingSuggestion || showCoachHint || messages.length < 1) return;

    setShowCoachHint(true);
    setIsFetchingSuggestion(true);
    setCoachSuggestion(null);

    try {
      // 🚀 맥락 기반 AI 코치 제안 시스템 (API 우선 시도)
      const suggestion = await coachMutation.mutateAsync({ 
        messages, 
        persona: partner 
      });
      
      setCoachSuggestion(suggestion);
    } catch (error) {
      console.error('Failed to fetch contextual suggestion:', error);
      // 🚀 강화된 맥락 기반 대체 제안 생성 (API 실패 시)
      const contextualSuggestion = generateContextualSuggestion(messages, partner);
      setCoachSuggestion({ reason: "AI 맥락 분석 제안", suggestion: contextualSuggestion });
    } finally {
      setIsFetchingSuggestion(false);
    }
  }, [messages, isFetchingSuggestion, showCoachHint, coachMutation, partner]);

  // 🚀 강화된 맥락 기반 제안 생성 함수
  const generateContextualSuggestion = useCallback((messages: Message[], partner: Persona | AICoach) => {
    const userMessages = messages.filter(m => m.sender === 'user');
    const aiMessages = messages.filter(m => m.sender === 'ai');
    const lastUserMessage = userMessages.pop()?.text || '';
    const lastAiMessage = aiMessages.pop()?.text || '';
    const conversationLength = userMessages.length;
    
    // 🧠 고급 맥락 분석
    const isFirstMessage = conversationLength === 1;
    const isShortResponse = lastUserMessage.length < 15;
    const isLongResponse = lastUserMessage.length > 50;
    const isQuestion = lastUserMessage.includes('?') || lastUserMessage.includes('어떤') || lastUserMessage.includes('무엇') || lastUserMessage.includes('어디') || lastUserMessage.includes('언제');
    const isEmotional = lastUserMessage.includes('힘들') || lastUserMessage.includes('좋아') || lastUserMessage.includes('재미') || lastUserMessage.includes('기쁘') || lastUserMessage.includes('슬프') || lastUserMessage.includes('화나');
    const isPersonal = lastUserMessage.includes('저') || lastUserMessage.includes('나') || lastUserMessage.includes('제가') || lastUserMessage.includes('내가');
    const isAboutWork = lastUserMessage.includes('일') || lastUserMessage.includes('직장') || lastUserMessage.includes('회사') || lastUserMessage.includes('업무');
    const isAboutHobby = lastUserMessage.includes('취미') || lastUserMessage.includes('관심') || lastUserMessage.includes('좋아하는') || lastUserMessage.includes('즐겨');
    const isAboutFuture = lastUserMessage.includes('미래') || lastUserMessage.includes('계획') || lastUserMessage.includes('꿈') || lastUserMessage.includes('목표');
    
    // 🎯 AI 응답 분석
    const aiIsAsking = lastAiMessage.includes('?');
    const aiIsSharing = lastAiMessage.includes('저는') || lastAiMessage.includes('제가');
    const aiIsEmotional = lastAiMessage.includes('😊') || lastAiMessage.includes('😢') || lastAiMessage.includes('😍') || lastAiMessage.includes('🤔');
    
    // 🚀 상황별 맞춤 제안 생성
    if (isFirstMessage) {
      return "좋은 시작이에요! 이제 상대방의 관심사를 파악해보세요. '어떤 일을 하시나요?' 또는 '주말에는 보통 뭐 하면서 시간을 보내세요?' 같은 질문으로 대화를 이어가보세요 💡";
    } else if (isShortResponse && !isQuestion) {
      return "대화를 더 풍성하게 만들어보세요! '그렇군요! 저도 비슷한 경험이 있어요. 그때는 정말...'처럼 자신의 경험을 구체적으로 공유해보세요 💭";
    } else if (isQuestion && aiIsAsking) {
      return "훌륭해요! 서로 질문을 주고받고 있네요. 이제 '정말 흥미롭네요! 그때 어떤 기분이었나요?'처럼 감정이나 경험에 대해 더 깊이 파고드는 질문을 해보세요 🤔";
    } else if (isEmotional && !aiIsEmotional) {
      return "감정을 잘 표현하고 있네요! 이제 상대방도 감정을 나눌 수 있도록 '그때 어떤 기분이었나요?' 또는 '비슷한 경험이 있으신가요?' 같은 질문을 해보세요 😊";
    } else if (isPersonal && !isAboutWork && !isAboutHobby) {
      return "개인적인 이야기를 잘 나누고 있네요! 이제 '그 경험에서 무엇을 배웠나요?' 또는 '그 일이 당신에게 어떤 의미가 있나요?' 같은 성찰적인 질문을 해보세요 🎯";
    } else if (isAboutWork) {
      return "직장 이야기를 나누고 있네요! 이제 '그 일이 재미있으신가요?' 또는 '어떤 부분이 가장 보람을 느끼시나요?' 같은 감정과 가치관을 파악하는 질문을 해보세요 💼";
    } else if (isAboutHobby) {
      return "취미 이야기가 좋네요! 이제 '그걸 어떻게 시작하게 되셨나요?' 또는 '그 취미의 어떤 점이 가장 좋으신가요?' 같은 깊이 있는 질문을 해보세요 🎨";
    } else if (isAboutFuture) {
      return "미래에 대한 이야기를 나누고 있네요! 이제 '그 목표를 위해 어떤 계획을 세우고 계신가요?' 또는 '그 꿈이 언제부터 생겼나요?' 같은 구체적인 질문을 해보세요 🌟";
    } else if (conversationLength >= 6) {
      return "대화가 정말 잘 이어지고 있어요! 이제 '오늘 정말 좋은 시간이었어요. 다음에 또 이런 이야기 해요' 또는 '다음에 만날 때 더 자세히 들려주세요' 같은 긍정적인 마무리를 준비해보세요 ✨";
    } else if (isLongResponse && !isQuestion) {
      return "상세한 이야기를 잘 해주고 있네요! 이제 상대방의 반응을 확인하고 '어떻게 생각하세요?' 또는 '비슷한 경험이 있으신가요?' 같은 질문을 해보세요 💬";
    } else {
      return "대화를 더 깊이 있게 만들어보세요! '그 경험에서 무엇을 배웠나요?' 또는 '그 일이 당신에게 어떤 의미가 있나요?' 같은 성찰적이고 의미 있는 질문을 해보세요 🎯";
    }
  }, []);

  // 🚀 맥락 기반 자연스러운 Mock 응답 생성 함수
  const generateContextualMockResponse = useCallback((userMessage: string, isCoaching: boolean): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (isCoaching) {
      // 코칭 모드: 구체적이고 실용적인 조언
      if (lowerMessage.includes('어떻게') || lowerMessage.includes('방법')) {
        return "좋은 질문이에요! 예를 들어 '그때 어떤 기분이었어요?'처럼 구체적으로 물어보면 대화가 더 깊어져요 💡";
      } else if (lowerMessage.includes('힘들') || lowerMessage.includes('어려워')) {
        return "괜찮아요! 처음엔 다 그래요. 작은 것부터 시작해서 점점 늘려가면 돼요 😊";
      } else if (lowerMessage.includes('좋아') || lowerMessage.includes('잘됐')) {
        return "와! 정말 잘하고 있네요! 그런 식으로 계속 연습하면 더 좋아질 거예요 ✨";
      } else {
        return "좋은 시작이에요! 이제 상대방의 반응을 보고 자연스럽게 대화를 이어가보세요 🎯";
      }
    } else {
      // 일반 대화 모드: 자연스러운 응답
      if (lowerMessage.includes('안녕') || lowerMessage.includes('하이')) {
        return "안녕! 오늘 기분이 어때? 😊";
      } else if (lowerMessage.includes('영화') || lowerMessage.includes('영상')) {
        return "영화 좋아해? 나는 로맨스 영화를 자주 봐! 최근에 본 영화 중에 뭐가 제일 좋았어?";
      } else if (lowerMessage.includes('음악') || lowerMessage.includes('노래')) {
        return "음악 듣는 거 좋아해? 나는 K-pop을 자주 들어! 어떤 장르 좋아해?";
      } else if (lowerMessage.includes('일') || lowerMessage.includes('직장') || lowerMessage.includes('회사')) {
        return "일하는 거 어때? 힘들지 않아? 나도 일할 때 스트레스 받을 때가 많아 😅";
      } else if (lowerMessage.includes('취미') || lowerMessage.includes('관심')) {
        return "취미가 뭐야? 나는 요리하는 걸 좋아해! 너는 뭘 하면서 시간 보내?";
      } else if (lowerMessage.includes('피곤') || lowerMessage.includes('힘들')) {
        return "아, 많이 힘들었구나 😔 푹 쉬어야겠어. 뭐 도와줄 일 있어?";
      } else if (lowerMessage.includes('좋아') || lowerMessage.includes('기쁘') || lowerMessage.includes('행복')) {
        return "와! 정말 좋겠다! 😍 어떻게 된 일이야? 자세히 들려줘!";
      } else if (lowerMessage.includes('?')) {
        return "음... 좋은 질문이네! 나도 그런 생각 해본 적 있어. 너는 어떻게 생각해?";
      } else {
        return "그렇구나! 나도 비슷한 경험이 있어. 그때는 정말... 😊";
      }
    }
  }, []);

  // 🚀 실시간 대화 분석 함수
  const analyzeConversationRealTime = useCallback((messages: Message[]) => {
    if (messages.length < 2) return null;
    
    const userMessages = messages.filter(m => m.sender === 'user');
    const aiMessages = messages.filter(m => m.sender === 'ai');
    
    if (userMessages.length === 0) return null;
    
    const lastUserMessage = userMessages[userMessages.length - 1];
    const conversationLength = userMessages.length;
    
    // 대화 품질 분석
    const analysis = {
      conversationLength,
      messageQuality: analyzeMessageQuality(lastUserMessage.text),
      conversationFlow: analyzeConversationFlow(messages),
      improvementSuggestions: generateImprovementSuggestions(messages, lastUserMessage),
      strengths: identifyStrengths(messages),
      nextSteps: suggestNextSteps(messages, conversationLength)
    };
    
    return analysis;
  }, []);

  // 메시지 품질 분석
  const analyzeMessageQuality = (message: string) => {
    const length = message.length;
    const hasQuestion = message.includes('?') || message.includes('어떤') || message.includes('무엇');
    const hasEmotion = message.includes('좋아') || message.includes('힘들') || message.includes('재미');
    const isDetailed = length > 20;
    
    return {
      length,
      hasQuestion,
      hasEmotion,
      isDetailed,
      score: (hasQuestion ? 30 : 0) + (hasEmotion ? 25 : 0) + (isDetailed ? 25 : 0) + Math.min(length / 2, 20)
    };
  };

  // 대화 흐름 분석
  const analyzeConversationFlow = (messages: Message[]) => {
    const userMessages = messages.filter(m => m.sender === 'user');
    const aiMessages = messages.filter(m => m.sender === 'ai');
    
    const responseTime = userMessages.length > 0 && aiMessages.length > 0;
    const topicConsistency = analyzeTopicConsistency(messages);
    const engagementLevel = calculateEngagementLevel(messages);
    
    return {
      responseTime,
      topicConsistency,
      engagementLevel,
      flowScore: (responseTime ? 40 : 0) + topicConsistency + engagementLevel
    };
  };

  // 주제 일관성 분석
  const analyzeTopicConsistency = (messages: Message[]) => {
    const recentMessages = messages.slice(-4);
    const topics = recentMessages.map(m => extractTopic(m.text));
    const uniqueTopics = new Set(topics.filter(t => t));
    return Math.max(0, 30 - (uniqueTopics.size - 1) * 10);
  };

  // 주제 추출
  const extractTopic = (text: string) => {
    if (text.includes('영화') || text.includes('영상')) return 'entertainment';
    if (text.includes('음악') || text.includes('노래')) return 'music';
    if (text.includes('일') || text.includes('직장')) return 'work';
    if (text.includes('취미') || text.includes('관심')) return 'hobby';
    if (text.includes('감정') || text.includes('기분')) return 'emotion';
    return 'general';
  };

  // 참여도 계산
  const calculateEngagementLevel = (messages: Message[]) => {
    const userMessages = messages.filter(m => m.sender === 'user');
    const avgLength = userMessages.reduce((sum, m) => sum + m.text.length, 0) / userMessages.length;
    return Math.min(30, avgLength / 2);
  };

  // 개선 제안 생성
  const generateImprovementSuggestions = (messages: Message[], lastMessage: Message) => {
    const suggestions = [];
    const messageQuality = analyzeMessageQuality(lastMessage.text);
    
    if (!messageQuality.hasQuestion) {
      suggestions.push("상대방에게 질문을 해보세요. '어떤 생각이세요?' 같은 질문으로 대화를 이어가보세요.");
    }
    
    if (!messageQuality.hasEmotion) {
      suggestions.push("감정을 표현해보세요. '정말 좋아요!' 같은 감정 표현으로 대화를 풍성하게 만들어보세요.");
    }
    
    if (!messageQuality.isDetailed) {
      suggestions.push("더 자세한 이야기를 해보세요. 구체적인 경험이나 생각을 공유하면 대화가 더 흥미로워집니다.");
    }
    
    return suggestions;
  };

  // 강점 식별
  const identifyStrengths = (messages: Message[]) => {
    const strengths = [];
    const userMessages = messages.filter(m => m.sender === 'user');
    
    if (userMessages.some(m => m.text.includes('?'))) {
      strengths.push("적극적인 질문");
    }
    
    if (userMessages.some(m => m.text.length > 30)) {
      strengths.push("상세한 설명");
    }
    
    if (userMessages.some(m => m.text.includes('좋아') || m.text.includes('재미'))) {
      strengths.push("긍정적 표현");
    }
    
    return strengths.length > 0 ? strengths : ["대화 참여"];
  };

  // 다음 단계 제안
  const suggestNextSteps = (messages: Message[], conversationLength: number) => {
    if (conversationLength < 3) {
      return ["상대방의 관심사를 더 파악해보세요", "자신의 경험을 공유해보세요"];
    } else if (conversationLength < 6) {
      return ["대화를 더 깊이 있게 만들어보세요", "감정을 나누어보세요"];
    } else {
      return ["대화를 자연스럽게 마무리해보세요", "다음 만남을 기약해보세요"];
    }
  };

  useEffect(() => {
    // Initialize chat session
    if (!sessionIdRef.current) {
      const initSession = async () => {
        try {
          let sessionId;
          
          if (isCoaching && partner && 'specialty' in partner) {
            // 코칭 세션 생성
            const userId = localStorage.getItem('userId') || undefined;
            sessionId = await createCoachingSessionMutation.mutateAsync({
              coachId: partner.id,
              userId
            });
          } else {
            // 일반 페르소나 세션 생성
            sessionId = await createSessionMutation.mutateAsync({
              personaId: partner && 'id' in partner ? partner.id : (partner as any)?.name || 'unknown',
              systemInstruction: partner?.system_instruction || ''
            });
          }
          
          sessionIdRef.current = sessionId;
        } catch (error) {
          console.error('Failed to create session:', error);
          // 세션 생성 실패 시에도 계속 진행 (하드코딩 모드)
          sessionIdRef.current = 'mock-session-' + Date.now();
        }
      };

      initSession();
    }

    setIsTutorialMode(isTutorial);
    setTutorialStep(TUTORIAL_STEPS[0]);
    
    let initialMessages: Message[] = [];

    // Check if the partner is an AICoach
    if ('specialty' in partner) {
        initialMessages.push({ sender: 'system', text: `${partner.name} 코치와의 '${partner.specialty}' 코칭을 시작합니다.` });
        initialMessages.push({ sender: 'ai', text: partner.intro });
    } else { // It's a Persona
        if (isTutorial) {
            const currentStep = TUTORIAL_STEPS[0];
            // 🚀 튜토리얼 지시사항 간소화 (중복 제거)
            initialMessages.push(
                { sender: 'system', text: `🎯 ${currentStep.title}` }
            );
            
            // 🚀 튜토리얼 시작 시 AI가 첫 메시지를 보내도록 함 (중복 방지)
            setTimeout(() => {
                const firstMessage = generateNaturalFirstMessage(partner, userProfile);
                setMessages(prev => {
                    // 이미 AI 메시지가 있는지 확인
                    const hasAIMessage = prev.some(msg => msg.sender === 'ai');
                    if (hasAIMessage) return prev;
                    return [...prev, { sender: 'ai', text: firstMessage }];
                });
            }, 1000);
        } else {
            // 일반 모드에서도 AI 첫 메시지 추가 (중복 방지)
            setTimeout(() => {
                const firstMessage = generateNaturalFirstMessage(partner, userProfile);
                setMessages(prev => {
                    // 이미 AI 메시지가 있는지 확인
                    const hasAIMessage = prev.some(msg => msg.sender === 'ai');
                    if (hasAIMessage) return prev;
                    return [...prev, { sender: 'ai', text: firstMessage }];
                });
            }, 500);
        }
    }

    setMessages(initialMessages);
  }, [isTutorial, userProfile]); // userProfile 의존성 추가

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
      if (realtimeFeedback) {
          if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
          feedbackTimeoutRef.current = window.setTimeout(() => setRealtimeFeedback(null), 2500);
      }
      return () => {
          if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      }
  }, [realtimeFeedback]);

  useEffect(() => {
    if (isTutorialMode && tutorialStep.step === 5) { // When the "Completed" step is reached
        setIsTutorialComplete(true);
        const timer = setTimeout(() => {
            onComplete(null, true);
        }, 3000);
        return () => clearTimeout(timer);
    }
  }, [tutorialStep, isTutorialMode, onComplete]);

  // 🚀 튜토리얼 단계별 진행 함수 개선
  const progressTutorialStep = useCallback((userMessage: string) => {
    if (!isTutorialMode) return;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 튜토리얼 단계 진행 체크:', {
        currentStepIndex: tutorialStepIndex,
        currentStep: TUTORIAL_STEPS[tutorialStepIndex],
        userMessage
      });
    }
    
    const currentStep = TUTORIAL_STEPS[tutorialStepIndex];
    if (currentStep && currentStep.successCriteria(userMessage, messages)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ 단계 성공! 다음 단계로 진행');
      }
      
      // 단계 성공 시 다음 단계로 진행
      const nextIndex = tutorialStepIndex + 1;
      if (nextIndex < TUTORIAL_STEPS.length) {
        setTutorialStepIndex(nextIndex);
        setTutorialStep(TUTORIAL_STEPS[nextIndex]);
        
        // 다음 단계 안내 메시지 추가 (간소화)
        const nextStep = TUTORIAL_STEPS[nextIndex];
        setTimeout(() => {
          setMessages(prev => [...prev, 
            { sender: 'system', text: `✅ ${currentStep.step}단계 완료! 이제 ${nextStep.title}` }
          ]);
        }, 1000);
      } else {
        // 튜토리얼 완료
        if (process.env.NODE_ENV === 'development') {
          console.log('🎉 튜토리얼 완료!');
        }
        setIsTutorialComplete(true);
        setTimeout(() => {
          setMessages(prev => [...prev, 
            { sender: 'system', text: '🎉 튜토리얼 완료! 이제 자유롭게 대화해보세요!' }
          ]);
        }, 1000);
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ 단계 조건 미충족');
      }
    }
  }, [isTutorialMode, tutorialStepIndex, messages]);

  const handleSend = useCallback(async (messageText: string) => {
    if (messageText.trim() === '' || isLoading || isAnalyzing || !sessionIdRef.current) return;

    setShowCoachHint(false);
    setCoachSuggestion(null);

    const userMessage: Message = { sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // 튜토리얼 단계 진행 체크
    progressTutorialStep(messageText);

    // Get realtime feedback
    const lastAiMessage = messages.filter(m => m.sender === 'ai').pop()?.text;
    feedbackMutation?.mutate?.(
      { 
        lastUserMessage: messageText, 
        ...(lastAiMessage ? { lastAiMessage } : {})
      },
      { onSuccess: (feedback) => feedback && setRealtimeFeedback(feedback) }
    );

    // 🚀 중복된 튜토리얼 진행 로직 제거 (progressTutorialStep에서 처리)

    try {
      // 🚀 스트리밍 대화 시작
      await startStreaming(sessionIdRef.current, messageText, isCoaching);
      
      // 튜토리얼 완료 체크 (스트리밍 완료 후)
      if (isTutorialMode && messages.length >= 4) {
        setTimeout(() => {
          handleComplete();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      // 스트리밍 실패 시 fallback
      const fallbackResponse = generateContextualMockResponse(messageText, isCoaching);
      const aiMessage: Message = { sender: 'ai', text: fallbackResponse };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }
  }, [isLoading, isAnalyzing, messages, isTutorialMode, tutorialStep, sendMessageMutation, feedbackMutation, partner]);

  const handleComplete = useCallback(async () => {
    if (messages.filter(m => m.sender === 'user').length === 0) {
        onComplete(null, isTutorialMode);
        return;
    }
    setIsAnalyzing(true);
    try {
      let result;
      
      if (isCoaching && sessionIdRef.current) {
        // 코칭 세션 분석
        result = await analyzeCoachingMutation.mutateAsync({
          sessionId: sessionIdRef.current,
          messages
        });
      } else {
        // 일반 대화 분석
        result = await analyzeMutation.mutateAsync(messages);
      }
      
      onComplete(result, isTutorialMode);
    } catch (error) {
      console.error('Failed to analyze conversation:', error);
      onComplete(null, isTutorialMode);
    }
  }, [messages, onComplete, isTutorialMode, analyzeMutation]);
  
  const handleCloseHint = () => {
      setShowCoachHint(false);
      setCoachSuggestion(null);
  }

  return (
    <div className="flex flex-col h-full w-full bg-white relative">
      {/* Header */}
      <header className="flex-shrink-0 flex flex-col p-3 border-b border-[#F2F4F6] z-10 bg-white">
        <div className="flex items-center">
            <button onClick={handleComplete} className="p-2 rounded-full hover:bg-gray-100">
                <ArrowLeftIcon className="w-6 h-6 text-[#8B95A1]" />
            </button>
            <img src={partner.avatar} alt={partner.name} className="w-10 h-10 rounded-full object-cover ml-2" />
            <div className="ml-3 flex-1">
                <h2 className="font-bold text-lg text-[#191F28]">{partner.name}</h2>
                <div className="flex items-center gap-2">
                    <p className="text-sm text-[#0AC5A8] font-semibold">🟢 온라인</p>
                    {!isTutorialMode && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            currentMode === 'normal' 
                                ? 'bg-[#E6F7F5] text-[#0AC5A8]' 
                                : 'bg-[#FDF2F8] text-[#F093B0]'
                        }`}>
                            {currentMode === 'normal' ? '👋 친구모드' : '💕 연인모드'}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {/* 🚀 코칭 모드가 아닐 때만 연인모드와 스타일분석 버튼 표시 */}
                {!isTutorialMode && !isCoaching && (
                    <button
                        onClick={() => setCurrentMode(currentMode === 'normal' ? 'romantic' : 'normal')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all hover:scale-105 ${
                            currentMode === 'normal'
                                ? 'bg-[#FDF2F8] text-[#F093B0] border border-[#F093B0]'
                                : 'bg-[#E6F7F5] text-[#0AC5A8] border border-[#0AC5A8]'
                        }`}
                        title="대화 모드 전환"
                    >
                        {currentMode === 'normal' ? '💕 연인 모드로' : '👋 일반 모드로'}
                    </button>
                )}
                {!isTutorialMode && !isCoaching && messages.length > 3 && (
                    <button
                        onClick={async () => {
                            const result = await styleAnalysisMutation.mutateAsync(messages);
                            setStyleAnalysis(result);
                            setShowStyleModal(true);
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                    >
                        💡 스타일 분석
                    </button>
                )}
                {/* 🚀 코칭 모드일 때는 코칭 관련 정보 표시 */}
                {!isTutorialMode && isCoaching && 'specialty' in partner && (
                    <span className="px-3 py-1.5 bg-[#E6F7F5] text-[#0AC5A8] border border-[#0AC5A8] text-sm font-medium rounded-lg">
                        📚 {partner.specialty} 코칭
                    </span>
                )}
                {isTutorialMode && tutorialStep.step < 5 && <span className="font-bold text-[#F093B0]">{tutorialStep.step}/{TUTORIAL_STEPS.length - 1} 단계</span>}
            </div>
        </div>
        {isTutorialMode && tutorialStep.step < 5 && (
            <div className="w-full bg-[#F2F4F6] h-1 rounded-full mt-2">
                <div className="bg-[#F093B0] h-1 rounded-full transition-all duration-500" style={{ width: `${((tutorialStep.step) / (TUTORIAL_STEPS.length - 1)) * 100}%` }}></div>
            </div>
        )}
      </header>

      {/* Tutorial Card */}
      {isTutorialMode && tutorialStep.step < 5 && (
        <div className="p-4 bg-gradient-to-r from-[#FDF2F8] to-[#EBF2FF] animate-fade-in z-10">
            <p className="font-bold text-base flex items-center text-[#191F28]"><CoachKeyIcon className="w-5 h-5 mr-2 text-[#F093B0]" />{tutorialStep.title}</p>
            <p className="text-sm text-[#8B95A1] mt-1">{tutorialStep.description}</p>
        </div>
      )}
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 animate-fade-in-up ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && <img src={partner.avatar} alt="ai" className="w-8 h-8 rounded-full self-start" />}
                {msg.sender === 'system' ? (
                  <div className="w-full text-center text-sm text-[#4F7ABA] p-3 bg-[#F9FAFB] rounded-xl my-2">
                    {msg.text === 'COACH_HINT_INTRO' ? (
                      <span className="flex items-center justify-center">
                        대화가 막힐 땐 언제든 <CoachKeyIcon className="w-4 h-4 mx-1 inline-block text-yellow-500" /> 힌트 버튼을 눌러 AI 코치의 도움을 받아보세요!
                      </span>
                    ) : msg.text}
                  </div>
                ) : (
                  <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 shadow-sm ${msg.sender === 'user' ? 'text-white rounded-t-[18px] rounded-l-[18px] rounded-br-[6px] bg-[#F093B0]' : 'rounded-t-[18px] rounded-r-[18px] rounded-bl-[6px] bg-[#F9FAFB] text-[#191F28]'}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                )}
            </div>
        ))}
        {/* 🚀 스트리밍 메시지 표시 */}
        {isStreaming && streamingMessage && (
          <div className="flex items-end gap-2 justify-start">
            <img src={partner.avatar} alt="ai" className="w-8 h-8 rounded-full self-start" />
            <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-t-[18px] rounded-r-[18px] rounded-bl-[6px] bg-[#F9FAFB] text-[#191F28]">
              <p className="whitespace-pre-wrap leading-relaxed">{streamingMessage}</p>
              <span className="inline-block w-2 h-4 bg-[#F093B0] ml-1 animate-pulse"></span>
            </div>
          </div>
        )}
        {isLoading && !isStreaming && (
          <div className="flex items-end gap-2 justify-start">
            <img src={partner.avatar} alt="ai" className="w-8 h-8 rounded-full self-start" />
            <div className="max-w-xs px-4 py-3 rounded-2xl rounded-bl-none bg-[#F9FAFB]"><TypingIndicator /></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Realtime Feedback */}
      {realtimeFeedback && <RealtimeFeedbackToast feedback={realtimeFeedback} />}
      
      {/* Coach Hint Modal */}
      {showCoachHint && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#191F28]">💡 코치 제안</h3>
              <button 
                onClick={handleCloseHint}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {isFetchingSuggestion ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F093B0]"></div>
                <p className="ml-3 text-sm text-gray-500">코치가 제안을 준비하고 있어요...</p>
              </div>
            ) : coachSuggestion ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#FDF2F8] rounded-xl border border-[#F093B0]">
                  <p className="text-sm text-[#191F28] leading-relaxed">
                    {coachSuggestion.suggestion}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setInput(coachSuggestion.suggestion);
                      handleCloseHint();
                    }}
                    className="flex-1 py-2 px-4 bg-[#F093B0] text-white rounded-lg font-medium hover:bg-[#E085A3] transition-colors"
                  >
                    적용하기
                  </button>
                  <button
                    onClick={handleCloseHint}
                    className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    직접 입력
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">제안을 불러올 수 없습니다.</p>
                <button
                  onClick={handleCloseHint}
                  className="mt-4 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
       {isAnalyzing && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-20">
                <div className="w-8 h-8 border-4 border-t-transparent border-[#F093B0] rounded-full animate-spin"></div>
                <p className="mt-4 text-base font-semibold text-[#191F28]">대화 분석 중...</p>
            </div>
        )}
       {isTutorialComplete && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20 animate-fade-in">
                <div className="bg-white p-8 rounded-2xl text-center shadow-xl animate-scale-in">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-[#191F28] mb-2">튜토리얼 완료!</h2>
                    <p className="text-[#8B95A1] text-base">대화의 기본을 마스터하셨어요!</p>
                    <p className="text-[#4F7ABA] text-sm mt-2">곧 홈 화면으로 이동합니다...</p>
                </div>
            </div>
        )}
      
      {/* Input Form */}
      <div className="flex-shrink-0 p-2 border-t border-[#F2F4F6] bg-white z-10">
        {isTutorialMode && tutorialStep.step < 5 && (
            <div className="flex space-x-2 overflow-x-auto pb-2 px-2">
                {tutorialStep.quickReplies.map(reply => (
                    <button key={reply} onClick={() => handleSend(reply)} className="flex-shrink-0 h-10 px-4 bg-[#FDF2F8] border border-[#F093B0] text-[#DB7093] rounded-full text-sm font-medium transition-colors hover:bg-opacity-80">
                        {reply}
                    </button>
                ))}
            </div>
        )}
        <div className="p-2">
          <div className="flex items-center space-x-2">
            {/* 🚀 코칭 모드가 아닐 때만 키 모양 코칭 버튼 표시 */}
            {!isCoaching && (
              <button 
                  onClick={fetchAndShowSuggestion} 
                  disabled={isLoading || isAnalyzing || showCoachHint}
                  className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-full disabled:opacity-50 transition-colors hover:bg-yellow-100"
              >
                  <CoachKeyIcon className="w-6 h-6 text-yellow-500" />
              </button>
            )}
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend(input)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 w-full h-12 px-5 bg-[#F9FAFB] rounded-full focus:outline-none focus:ring-2 ring-[#F093B0]"
              disabled={isLoading || isAnalyzing}
            />
            <button onClick={() => handleSend(input)} disabled={isLoading || isAnalyzing || input.trim() === ''} className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#F093B0] text-white rounded-full disabled:opacity-50 transition-opacity">
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Style Recommendation Modal */}
      <StyleRecommendationModal
        isOpen={showStyleModal}
        onClose={() => setShowStyleModal(false)}
        analysis={styleAnalysis}
        isLoading={styleAnalysisMutation.isPending}
      />
      
      {/* 🚀 실시간 대화 분석 모달 제거 (사용자 요청에 따라) */}
    </div>
  );
};

export default ChatScreen;