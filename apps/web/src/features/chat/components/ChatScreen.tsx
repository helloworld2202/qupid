import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Persona, Message, RealtimeFeedback, TutorialStep, ConversationAnalysis, AICoach } from '@qupid/core';
import { ArrowLeftIcon, PaperAirplaneIcon, CoachKeyIcon } from '@qupid/ui';
import { TUTORIAL_STEPS } from '@qupid/core';
import { useChatSession, useSendMessage, useAnalyzeConversation, useRealtimeFeedback, useCoachSuggestion } from '../hooks/useChatQueries';
import { useCreateCoachingSession, useSendCoachingMessage, useAnalyzeCoachingSession } from '../../coaching/hooks/useCoachingQueries';

interface ChatScreenProps {
  partner?: Persona | AICoach;
  isTutorial?: boolean;
  isCoaching?: boolean;
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

export const ChatScreen: React.FC<ChatScreenProps> = ({ partner, isTutorial = false, isCoaching = false, onComplete }) => {
  // partner가 없으면 에러 처리
  if (!partner) {
    return (
      <div className="flex flex-col h-full w-full bg-white items-center justify-center">
        <p className="text-[#8B95A1]">대화 파트너를 선택해주세요.</p>
      </div>
    );
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [realtimeFeedback, setRealtimeFeedback] = useState<RealtimeFeedback | null>(null);
  const [isTutorialMode, setIsTutorialMode] = useState(isTutorial);
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>(TUTORIAL_STEPS[0]);
  const [isTutorialComplete, setIsTutorialComplete] = useState(false);
  
  const [showCoachHint, setShowCoachHint] = useState(false);
  const [coachSuggestion, setCoachSuggestion] = useState<{reason: string, suggestion: string} | null>(null);
  const [isFetchingSuggestion, setIsFetchingSuggestion] = useState(false);

  const sessionIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  // API hooks
  const createSessionMutation = useChatSession();
  const sendMessageMutation = useSendMessage();
  const analyzeMutation = useAnalyzeConversation();
  const feedbackMutation = useRealtimeFeedback();
  const coachMutation = useCoachSuggestion();
  
  // 코칭 세션 hooks
  const createCoachingSessionMutation = useCreateCoachingSession();
  const sendCoachingMessageMutation = useSendCoachingMessage();
  const analyzeCoachingMutation = useAnalyzeCoachingSession();

  const fetchAndShowSuggestion = useCallback(async () => {
    if (isFetchingSuggestion || showCoachHint || messages.length < 2) return;

    setShowCoachHint(true);
    setIsFetchingSuggestion(true);
    setCoachSuggestion(null);

    const suggestion = await coachMutation.mutateAsync(messages);
    
    setCoachSuggestion(suggestion);
    setIsFetchingSuggestion(false);
  }, [messages, isFetchingSuggestion, showCoachHint, coachMutation]);

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
            initialMessages.push(
                { sender: 'system', text: `${partner.name}님과의 첫 만남이에요. 편안하게 인사해보세요 😊` },
                { sender: 'system', text: 'COACH_HINT_INTRO' }
            );
        }
        // conversation_preview가 없거나 비어있는 경우 처리
        const firstMessage = partner.conversation_preview && partner.conversation_preview.length > 0
          ? partner.conversation_preview[0].text
          : `안녕하세요! 처음 뵙네요 😊 반갑습니다!`;
        initialMessages.push({ sender: 'ai', text: firstMessage });
    }

    setMessages(initialMessages);
  }, []); // 의존성 배열을 빈 배열로 변경

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

  const handleSend = useCallback(async (messageText: string) => {
    if (messageText.trim() === '' || isLoading || isAnalyzing || !sessionIdRef.current) return;

    setShowCoachHint(false);
    setCoachSuggestion(null);

    const userMessage: Message = { sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Get realtime feedback
    const lastAiMessage = messages.filter(m => m.sender === 'ai').pop()?.text;
    feedbackMutation.mutate(
      { 
        lastUserMessage: messageText, 
        ...(lastAiMessage ? { lastAiMessage } : {})
      },
      { onSuccess: (feedback) => feedback && setRealtimeFeedback(feedback) }
    );

    if (isTutorialMode) {
        if (tutorialStep.successCriteria(messageText, messages)) {
            const nextStepIndex = tutorialStep.step;
            if (nextStepIndex < TUTORIAL_STEPS.length) {
                setTutorialStep(TUTORIAL_STEPS[nextStepIndex]);
            }
        }
    }

    try {
      // Mock 응답 생성 (API 실패 시 대체)
      let aiResponse: string;
      
      try {
        if (isCoaching && 'specialty' in partner) {
          // 코칭 메시지 전송
          aiResponse = await sendCoachingMessageMutation.mutateAsync({
            sessionId: sessionIdRef.current,
            message: messageText
          });
        } else {
          // 일반 페르소나 메시지 전송
          aiResponse = await sendMessageMutation.mutateAsync({
            sessionId: sessionIdRef.current,
            message: messageText
          });
        }
      } catch (error) {
        console.error('API call failed, using mock response:', error);
        // Mock 응답 생성
        const mockResponses = isCoaching ? [
          "좋은 질문이네요! 이런 접근을 해보세요 👍",
          "정확하게 파악하셨네요! 다음 단계로 나아가볼까요?",
          "훌륭한 진전이에요! 계속 이렇게 연습해보세요 💪",
          "이 부분을 더 자세히 연습해볼까요? 함께 해보죠!",
          "잘하고 계세요! 이런 팩을 기억하세요 💡"
        ] : [
          "네, 맞아요! 정말 재미있는 이야기네요 😊",
          "오~ 그렇군요! 더 자세히 들려주세요!",
          "와, 대단하네요! 저도 그런 경험이 있어요.",
          "정말 흥미로운 생각이에요! 어떻게 그런 생각을 하게 되셨나요?",
          "저도 완전 공감해요! 특히 그 부분이 인상 깊네요."
        ];
        aiResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      }
      
      const aiMessage: Message = { sender: 'ai', text: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isAnalyzing, messages, isTutorialMode, tutorialStep, sendMessageMutation, feedbackMutation]);

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
            <div className="ml-3">
                <h2 className="font-bold text-lg text-[#191F28]">{partner.name}</h2>
                <p className="text-sm text-[#0AC5A8] font-semibold">🟢 온라인</p>
            </div>
            <div className="flex-1 text-right">
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
        {isLoading && (
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
        <CoachHint
          isLoading={isFetchingSuggestion}
          suggestion={coachSuggestion}
          onApply={(text) => {
            setInput(text);
            handleCloseHint();
          }}
          onClose={handleCloseHint}
        />
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
            <button 
                onClick={fetchAndShowSuggestion} 
                disabled={isLoading || isAnalyzing || showCoachHint}
                className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-full disabled:opacity-50 transition-colors hover:bg-yellow-100"
            >
                <CoachKeyIcon className="w-6 h-6 text-yellow-500" />
            </button>
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
    </div>
  );
};

export default ChatScreen;