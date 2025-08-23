import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Persona, Message, RealtimeFeedback, TutorialStep, ConversationAnalysis, AICoach } from '@qupid/core';
import { ArrowLeftIcon, PaperAirplaneIcon, CoachKeyIcon } from '@qupid/ui';
import { TUTORIAL_STEPS } from '@qupid/core';
import { useChatSession, useSendMessage, useAnalyzeConversation, useRealtimeFeedback, useCoachSuggestion } from '../hooks/useChatQueries';

interface ChatScreenProps {
  partner: Persona | AICoach;
  isTutorial: boolean;
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
                {suggestion && !isLoading && (
                    <div className="mt-3 flex gap-2">
                        <button onClick={() => onApply(suggestion.suggestion)} className="flex-1 bg-[#F093B0] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#DB7093] transition-colors">
                            제안 사용
                        </button>
                        <button onClick={onClose} className="flex-1 bg-[#F2F4F6] text-[#8B95A1] py-2 px-4 rounded-lg font-semibold hover:bg-[#E5E8EB] transition-colors">
                            직접 입력
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const ChatScreen: React.FC<ChatScreenProps> = ({ partner, isTutorial, onComplete }) => {
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
    const initSession = async () => {
      const sessionId = await createSessionMutation.mutateAsync({
        personaId: 'id' in partner ? partner.id : partner.name,
        systemInstruction: partner.system_instruction
      });
      sessionIdRef.current = sessionId;
    };

    initSession();

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
        initialMessages.push({ sender: 'ai', text: partner.conversation_preview[0]?.text || `안녕하세요! 처음 뵙네요 😊 반갑습니다!` });
    }

    setMessages(initialMessages);
  }, [partner, isTutorial, createSessionMutation]);

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
      { lastUserMessage: messageText, lastAiMessage },
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
      const aiResponse = await sendMessageMutation.mutateAsync({
        sessionId: sessionIdRef.current,
        message: messageText
      });
      
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
      const result = await analyzeMutation.mutateAsync(messages);
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
        {messages.map((message, index) => {
          if (message.sender === 'system') {
            if (message.text === 'COACH_HINT_INTRO') {
              return (
                <div key={index} className="p-3 bg-[#FDF2F8] rounded-lg border-l-4 border-[#F093B0] text-[#191F28] text-sm animate-fade-in-up">
                  <p className="font-semibold">💡 도움이 필요하세요?</p>
                  <p className="mt-1">막막하다면 <button onClick={fetchAndShowSuggestion} className="underline font-semibold text-[#F093B0]">코치 제안</button>을 받아보세요!</p>
                </div>
              );
            }
            return (
              <div key={index} className="text-center text-[#8B95A1] text-sm py-2 animate-fade-in">
                {message.text}
              </div>
            );
          }

          const isUser = message.sender === 'user';
          return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              <div className={`max-w-[70%] ${isUser ? 'bg-[#F093B0] text-white' : 'bg-[#F2F4F6] text-[#191F28]'} p-3 rounded-2xl ${isUser ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                <p className="text-base whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-[#F2F4F6] p-3 rounded-2xl rounded-bl-sm">
              <TypingIndicator />
            </div>
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
      
      {/* Completion/Tutorial Complete Screen */}
      {isTutorialComplete && (
        <div className="absolute inset-0 bg-white flex items-center justify-center z-30 animate-fade-in">
          <div className="text-center p-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-[#191F28] mb-2">튜토리얼 완료!</h2>
            <p className="text-[#8B95A1] text-base">대화의 기본을 마스터하셨어요!</p>
            <p className="text-[#4F7ABA] text-sm mt-2">곧 홈 화면으로 이동합니다...</p>
          </div>
        </div>
      )}
      
      {/* Input Section */}
      <div className="flex-shrink-0 p-4 border-t border-[#F2F4F6] bg-white">
        {(messages.length === 0 || (messages.length === 1 && isTutorialMode)) && (
          <div className="mb-2 p-2 bg-[#EBF2FF] rounded-lg text-[#4F7ABA] text-sm">
            💬 대화를 시작해보세요! 자연스럽게 인사하는 것부터 시작해보면 어떨까요?
          </div>
        )}
        <div className="flex items-center gap-2">
          <button onClick={fetchAndShowSuggestion} disabled={isFetchingSuggestion || messages.length < 1} className="p-3 rounded-full bg-[#FDF2F8] text-[#F093B0] hover:bg-[#F093B0] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <CoachKeyIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder={isAnalyzing ? "대화 분석 중..." : "메시지를 입력하세요"}
            disabled={isLoading || isAnalyzing}
            className="flex-1 px-4 py-3 bg-[#F9FAFB] rounded-full text-[#191F28] placeholder-[#B0B8C1] focus:outline-none focus:ring-2 focus:ring-[#F093B0] disabled:opacity-50"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading || isAnalyzing}
            className="p-3 rounded-full bg-[#F093B0] text-white hover:bg-[#DB7093] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;