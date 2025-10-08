import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeftIcon, PaperAirplaneIcon, CoachKeyIcon } from '@qupid/ui';
import { TUTORIAL_STEPS } from '@qupid/core';
import { useChatSession, useSendMessage, useAnalyzeConversation, useRealtimeFeedback, useCoachSuggestion } from '../hooks/useChatQueries';
import { useCreateCoachingSession, useSendCoachingMessage, useAnalyzeCoachingSession } from '../../coaching/hooks/useCoachingQueries';
import { useStyleAnalysis } from '../hooks/useStyleAnalysis';
import { StyleRecommendationModal } from './StyleRecommendationModal';
const TypingIndicator = () => (_jsxs("div", { className: "flex items-center justify-center space-x-1 p-2", children: [_jsx("div", { className: "w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s] bg-gray-500" }), _jsx("div", { className: "w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s] bg-gray-500" }), _jsx("div", { className: "w-2 h-2 rounded-full animate-bounce bg-gray-500" })] }));
const RealtimeFeedbackToast = ({ feedback }) => (_jsxs("div", { className: "absolute bottom-24 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg flex items-center animate-fade-in-up shadow-lg z-10", children: [_jsx("span", { className: `mr-2 text-lg ${feedback.isGood ? 'text-green-400' : 'text-yellow-400'}`, children: feedback.isGood ? '✅' : '💡' }), _jsx("span", { className: "text-sm font-medium", children: feedback.message })] }));
const CoachHint = ({ isLoading, suggestion, onApply, onClose }) => {
    return (_jsx("div", { className: "absolute inset-x-4 top-1/2 -translate-y-1/2 z-20", children: _jsxs("div", { className: "p-5 bg-white rounded-2xl border-2 border-[#F093B0] shadow-xl animate-scale-in", children: [_jsxs("p", { className: "font-bold text-lg text-[#191F28] flex items-center", children: [_jsx(CoachKeyIcon, { className: "w-5 h-5 mr-2 text-[#F093B0]" }), " \uCF54\uCE58 \uC81C\uC548"] }), isLoading && (_jsx("div", { className: "mt-2 text-center h-24 flex items-center justify-center", children: _jsx(TypingIndicator, {}) })), suggestion && !isLoading && (_jsxs(_Fragment, { children: [_jsx("p", { className: "mt-2 text-base text-[#4F7ABA]", children: suggestion.reason }), _jsxs("p", { className: "mt-3 text-base text-[#191F28] font-semibold bg-[#F9FAFB] p-3 rounded-lg border border-[#F2F4F6]", children: ["\"", suggestion.suggestion, "\""] })] })), _jsxs("div", { className: "mt-4 flex space-x-2", children: [_jsx("button", { onClick: () => suggestion && onApply(suggestion.suggestion), disabled: isLoading || !suggestion, className: "flex-1 h-10 bg-[#F093B0] text-white rounded-lg text-sm font-bold disabled:opacity-50", children: "\uC801\uC6A9\uD558\uAE30" }), _jsx("button", { onClick: onClose, className: "flex-1 h-10 bg-[#F9FAFB] text-[#8B95A1] rounded-lg text-sm font-bold", children: "\uC9C1\uC811 \uC785\uB825" })] })] }) }));
};
export const ChatScreen = ({ partner, isTutorial = false, isCoaching = false, conversationMode = 'normal', userProfile, onComplete }) => {
    // partner가 없으면 에러 처리
    if (!partner) {
        return (_jsx("div", { className: "flex flex-col h-full w-full bg-white items-center justify-center", children: _jsx("p", { className: "text-[#8B95A1]", children: "\uB300\uD654 \uD30C\uD2B8\uB108\uB97C \uC120\uD0DD\uD574\uC8FC\uC138\uC694." }) }));
    }
    const [messages, setMessages] = useState([]);
    const [currentMode, setCurrentMode] = useState(conversationMode);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [realtimeFeedback, setRealtimeFeedback] = useState(null);
    const [isTutorialMode, setIsTutorialMode] = useState(isTutorial);
    // isTutorial prop이 변경되면 isTutorialMode 상태도 업데이트
    useEffect(() => {
        setIsTutorialMode(isTutorial);
    }, [isTutorial]);
    const [tutorialStep, setTutorialStep] = useState(TUTORIAL_STEPS[0]);
    const [isTutorialComplete, setIsTutorialComplete] = useState(false);
    const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
    const [showCoachHint, setShowCoachHint] = useState(false);
    const [coachSuggestion, setCoachSuggestion] = useState(null);
    const [isFetchingSuggestion, setIsFetchingSuggestion] = useState(false);
    const [showStyleModal, setShowStyleModal] = useState(false);
    const [styleAnalysis, setStyleAnalysis] = useState(null);
    const sessionIdRef = useRef(null);
    const messagesEndRef = useRef(null);
    const feedbackTimeoutRef = useRef(null);
    // 페르소나의 성격에 맞는 자연스러운 첫 메시지 생성
    const generatePersonaStyleFirstMessage = (partner) => {
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
        return mbtiStyles[mbti] || `안녕하세요 ${userName}! 저는 ${name}이에요 😊 ${age}세 ${job}인데, 편하게 대화해요!`;
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
        if (isFetchingSuggestion || showCoachHint || messages.length < 1)
            return;
        setShowCoachHint(true);
        setIsFetchingSuggestion(true);
        setCoachSuggestion(null);
        const suggestion = await coachMutation.mutateAsync({
            messages,
            persona: partner
        });
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
                    }
                    else {
                        // 일반 페르소나 세션 생성
                        sessionId = await createSessionMutation.mutateAsync({
                            personaId: partner && 'id' in partner ? partner.id : partner?.name || 'unknown',
                            systemInstruction: partner?.system_instruction || ''
                        });
                    }
                    sessionIdRef.current = sessionId;
                }
                catch (error) {
                    console.error('Failed to create session:', error);
                    // 세션 생성 실패 시에도 계속 진행 (하드코딩 모드)
                    sessionIdRef.current = 'mock-session-' + Date.now();
                }
            };
            initSession();
        }
        setIsTutorialMode(isTutorial);
        setTutorialStep(TUTORIAL_STEPS[0]);
        let initialMessages = [];
        // Check if the partner is an AICoach
        if ('specialty' in partner) {
            initialMessages.push({ sender: 'system', text: `${partner.name} 코치와의 '${partner.specialty}' 코칭을 시작합니다.` });
            initialMessages.push({ sender: 'ai', text: partner.intro });
        }
        else { // It's a Persona
            if (isTutorial) {
                const currentStep = TUTORIAL_STEPS[0];
                initialMessages.push({ sender: 'system', text: `🎯 튜토리얼 시작! ${currentStep.title}` }, { sender: 'system', text: currentStep.description }, { sender: 'system', text: 'COACH_HINT_INTRO' });
            }
            // AI가 페르소나 특성에 맞게 자연스럽게 첫 메시지를 생성하도록 함
            // 하드코딩된 첫 메시지 대신 AI가 자율적으로 대화를 시작하도록 함
        }
        setMessages(initialMessages);
    }, [isTutorial, userProfile]); // userProfile 의존성 추가
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);
    useEffect(() => {
        if (realtimeFeedback) {
            if (feedbackTimeoutRef.current)
                clearTimeout(feedbackTimeoutRef.current);
            feedbackTimeoutRef.current = window.setTimeout(() => setRealtimeFeedback(null), 2500);
        }
        return () => {
            if (feedbackTimeoutRef.current)
                clearTimeout(feedbackTimeoutRef.current);
        };
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
    const progressTutorialStep = useCallback((userMessage) => {
        if (!isTutorialMode)
            return;
        console.log('🎯 튜토리얼 단계 진행 체크:', {
            currentStepIndex: tutorialStepIndex,
            currentStep: TUTORIAL_STEPS[tutorialStepIndex],
            userMessage
        });
        const currentStep = TUTORIAL_STEPS[tutorialStepIndex];
        if (currentStep && currentStep.successCriteria(userMessage, messages)) {
            console.log('✅ 단계 성공! 다음 단계로 진행');
            // 단계 성공 시 다음 단계로 진행
            const nextIndex = tutorialStepIndex + 1;
            if (nextIndex < TUTORIAL_STEPS.length) {
                setTutorialStepIndex(nextIndex);
                setTutorialStep(TUTORIAL_STEPS[nextIndex]);
                // 다음 단계 안내 메시지 추가
                const nextStep = TUTORIAL_STEPS[nextIndex];
                setTimeout(() => {
                    setMessages(prev => [...prev,
                        { sender: 'system', text: `✅ ${currentStep.step}단계 완료! 이제 ${nextStep.title}` },
                        { sender: 'system', text: nextStep.description }
                    ]);
                }, 1000);
            }
            else {
                // 튜토리얼 완료
                console.log('🎉 튜토리얼 완료!');
                setIsTutorialComplete(true);
                setTimeout(() => {
                    setMessages(prev => [...prev,
                        { sender: 'system', text: '🎉 튜토리얼 완료! 이제 자유롭게 대화해보세요!' }
                    ]);
                }, 1000);
            }
        }
        else {
            console.log('❌ 단계 조건 미충족');
        }
    }, [isTutorialMode, tutorialStepIndex, messages]);
    const handleSend = useCallback(async (messageText) => {
        if (messageText.trim() === '' || isLoading || isAnalyzing || !sessionIdRef.current)
            return;
        setShowCoachHint(false);
        setCoachSuggestion(null);
        const userMessage = { sender: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        // 튜토리얼 단계 진행 체크
        progressTutorialStep(messageText);
        // Get realtime feedback
        const lastAiMessage = messages.filter(m => m.sender === 'ai').pop()?.text;
        feedbackMutation?.mutate?.({
            lastUserMessage: messageText,
            ...(lastAiMessage ? { lastAiMessage } : {})
        }, { onSuccess: (feedback) => feedback && setRealtimeFeedback(feedback) });
        // 🚀 중복된 튜토리얼 진행 로직 제거 (progressTutorialStep에서 처리)
        try {
            // Mock 응답 생성 (API 실패 시 대체)
            let aiResponse;
            try {
                if (isCoaching && 'specialty' in partner) {
                    // 코칭 메시지 전송
                    aiResponse = await sendCoachingMessageMutation.mutateAsync({
                        sessionId: sessionIdRef.current,
                        message: messageText
                    });
                }
                else {
                    // 일반 페르소나 메시지 전송
                    aiResponse = await sendMessageMutation.mutateAsync({
                        sessionId: sessionIdRef.current,
                        message: messageText
                    });
                }
            }
            catch (error) {
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
            const aiMessage = { sender: 'ai', text: aiResponse };
            setMessages(prev => [...prev, aiMessage]);
        }
        catch (error) {
            console.error('Failed to send message:', error);
        }
        finally {
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
            }
            else {
                // 일반 대화 분석
                result = await analyzeMutation.mutateAsync(messages);
            }
            onComplete(result, isTutorialMode);
        }
        catch (error) {
            console.error('Failed to analyze conversation:', error);
            onComplete(null, isTutorialMode);
        }
    }, [messages, onComplete, isTutorialMode, analyzeMutation]);
    const handleCloseHint = () => {
        setShowCoachHint(false);
        setCoachSuggestion(null);
    };
    return (_jsxs("div", { className: "flex flex-col h-full w-full bg-white relative", children: [_jsxs("header", { className: "flex-shrink-0 flex flex-col p-3 border-b border-[#F2F4F6] z-10 bg-white", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("button", { onClick: handleComplete, className: "p-2 rounded-full hover:bg-gray-100", children: _jsx(ArrowLeftIcon, { className: "w-6 h-6 text-[#8B95A1]" }) }), _jsx("img", { src: partner.avatar, alt: partner.name, className: "w-10 h-10 rounded-full object-cover ml-2" }), _jsxs("div", { className: "ml-3 flex-1", children: [_jsx("h2", { className: "font-bold text-lg text-[#191F28]", children: partner.name }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "text-sm text-[#0AC5A8] font-semibold", children: "\uD83D\uDFE2 \uC628\uB77C\uC778" }), !isTutorialMode && (_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full font-medium ${currentMode === 'normal'
                                                    ? 'bg-[#E6F7F5] text-[#0AC5A8]'
                                                    : 'bg-[#FDF2F8] text-[#F093B0]'}`, children: currentMode === 'normal' ? '👋 친구모드' : '💕 연인모드' }))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [!isTutorialMode && (_jsx("button", { onClick: () => setCurrentMode(currentMode === 'normal' ? 'romantic' : 'normal'), className: `px-3 py-1.5 text-sm font-medium rounded-lg transition-all hover:scale-105 ${currentMode === 'normal'
                                            ? 'bg-[#FDF2F8] text-[#F093B0] border border-[#F093B0]'
                                            : 'bg-[#E6F7F5] text-[#0AC5A8] border border-[#0AC5A8]'}`, title: "\uB300\uD654 \uBAA8\uB4DC \uC804\uD658", children: currentMode === 'normal' ? '💕 연인 모드로' : '👋 일반 모드로' })), !isTutorialMode && messages.length > 3 && (_jsx("button", { onClick: async () => {
                                            const result = await styleAnalysisMutation.mutateAsync(messages);
                                            setStyleAnalysis(result);
                                            setShowStyleModal(true);
                                        }, className: "px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity", children: "\uD83D\uDCA1 \uC2A4\uD0C0\uC77C \uBD84\uC11D" })), isTutorialMode && tutorialStep.step < 5 && _jsxs("span", { className: "font-bold text-[#F093B0]", children: [tutorialStep.step, "/", TUTORIAL_STEPS.length - 1, " \uB2E8\uACC4"] })] })] }), isTutorialMode && tutorialStep.step < 5 && (_jsx("div", { className: "w-full bg-[#F2F4F6] h-1 rounded-full mt-2", children: _jsx("div", { className: "bg-[#F093B0] h-1 rounded-full transition-all duration-500", style: { width: `${((tutorialStep.step) / (TUTORIAL_STEPS.length - 1)) * 100}%` } }) }))] }), isTutorialMode && tutorialStep.step < 5 && (_jsxs("div", { className: "p-4 bg-gradient-to-r from-[#FDF2F8] to-[#EBF2FF] animate-fade-in z-10", children: [_jsxs("p", { className: "font-bold text-base flex items-center text-[#191F28]", children: [_jsx(CoachKeyIcon, { className: "w-5 h-5 mr-2 text-[#F093B0]" }), tutorialStep.title] }), _jsx("p", { className: "text-sm text-[#8B95A1] mt-1", children: tutorialStep.description })] })), _jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4", children: [messages.map((msg, index) => (_jsxs("div", { className: `flex items-end gap-2 animate-fade-in-up ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`, children: [msg.sender === 'ai' && _jsx("img", { src: partner.avatar, alt: "ai", className: "w-8 h-8 rounded-full self-start" }), msg.sender === 'system' ? (_jsx("div", { className: "w-full text-center text-sm text-[#4F7ABA] p-3 bg-[#F9FAFB] rounded-xl my-2", children: msg.text === 'COACH_HINT_INTRO' ? (_jsxs("span", { className: "flex items-center justify-center", children: ["\uB300\uD654\uAC00 \uB9C9\uD790 \uB550 \uC5B8\uC81C\uB4E0 ", _jsx(CoachKeyIcon, { className: "w-4 h-4 mx-1 inline-block text-yellow-500" }), " \uD78C\uD2B8 \uBC84\uD2BC\uC744 \uB20C\uB7EC AI \uCF54\uCE58\uC758 \uB3C4\uC6C0\uC744 \uBC1B\uC544\uBCF4\uC138\uC694!"] })) : msg.text })) : (_jsx("div", { className: `max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 shadow-sm ${msg.sender === 'user' ? 'text-white rounded-t-[18px] rounded-l-[18px] rounded-br-[6px] bg-[#F093B0]' : 'rounded-t-[18px] rounded-r-[18px] rounded-bl-[6px] bg-[#F9FAFB] text-[#191F28]'}`, children: _jsx("p", { className: "whitespace-pre-wrap leading-relaxed", children: msg.text }) }))] }, index))), isLoading && (_jsxs("div", { className: "flex items-end gap-2 justify-start", children: [_jsx("img", { src: partner.avatar, alt: "ai", className: "w-8 h-8 rounded-full self-start" }), _jsx("div", { className: "max-w-xs px-4 py-3 rounded-2xl rounded-bl-none bg-[#F9FAFB]", children: _jsx(TypingIndicator, {}) })] })), _jsx("div", { ref: messagesEndRef })] }), realtimeFeedback && _jsx(RealtimeFeedbackToast, { feedback: realtimeFeedback }), showCoachHint && (_jsx(CoachHint, { isLoading: isFetchingSuggestion, suggestion: coachSuggestion, onApply: (text) => {
                    setInput(text);
                    handleCloseHint();
                }, onClose: handleCloseHint })), isAnalyzing && (_jsxs("div", { className: "absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-20", children: [_jsx("div", { className: "w-8 h-8 border-4 border-t-transparent border-[#F093B0] rounded-full animate-spin" }), _jsx("p", { className: "mt-4 text-base font-semibold text-[#191F28]", children: "\uB300\uD654 \uBD84\uC11D \uC911..." })] })), isTutorialComplete && (_jsx("div", { className: "absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20 animate-fade-in", children: _jsxs("div", { className: "bg-white p-8 rounded-2xl text-center shadow-xl animate-scale-in", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83C\uDF89" }), _jsx("h2", { className: "text-2xl font-bold text-[#191F28] mb-2", children: "\uD29C\uD1A0\uB9AC\uC5BC \uC644\uB8CC!" }), _jsx("p", { className: "text-[#8B95A1] text-base", children: "\uB300\uD654\uC758 \uAE30\uBCF8\uC744 \uB9C8\uC2A4\uD130\uD558\uC168\uC5B4\uC694!" }), _jsx("p", { className: "text-[#4F7ABA] text-sm mt-2", children: "\uACE7 \uD648 \uD654\uBA74\uC73C\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4..." })] }) })), _jsxs("div", { className: "flex-shrink-0 p-2 border-t border-[#F2F4F6] bg-white z-10", children: [isTutorialMode && tutorialStep.step < 5 && (_jsx("div", { className: "flex space-x-2 overflow-x-auto pb-2 px-2", children: tutorialStep.quickReplies.map(reply => (_jsx("button", { onClick: () => handleSend(reply), className: "flex-shrink-0 h-10 px-4 bg-[#FDF2F8] border border-[#F093B0] text-[#DB7093] rounded-full text-sm font-medium transition-colors hover:bg-opacity-80", children: reply }, reply))) })), _jsx("div", { className: "p-2", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: fetchAndShowSuggestion, disabled: isLoading || isAnalyzing || showCoachHint, className: "w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-full disabled:opacity-50 transition-colors hover:bg-yellow-100", children: _jsx(CoachKeyIcon, { className: "w-6 h-6 text-yellow-500" }) }), _jsx("input", { type: "text", value: input, onChange: e => setInput(e.target.value), onKeyPress: e => e.key === 'Enter' && handleSend(input), placeholder: "\uBA54\uC2DC\uC9C0\uB97C \uC785\uB825\uD558\uC138\uC694...", className: "flex-1 w-full h-12 px-5 bg-[#F9FAFB] rounded-full focus:outline-none focus:ring-2 ring-[#F093B0]", disabled: isLoading || isAnalyzing }), _jsx("button", { onClick: () => handleSend(input), disabled: isLoading || isAnalyzing || input.trim() === '', className: "w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#F093B0] text-white rounded-full disabled:opacity-50 transition-opacity", children: _jsx(PaperAirplaneIcon, { className: "w-6 h-6" }) })] }) })] }), _jsx(StyleRecommendationModal, { isOpen: showStyleModal, onClose: () => setShowStyleModal(false), analysis: styleAnalysis, isLoading: styleAnalysisMutation.isPending })] }));
};
export default ChatScreen;
