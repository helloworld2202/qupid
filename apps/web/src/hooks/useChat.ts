import { useState, useRef, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import { Message, ConversationAnalysis, RealtimeFeedback } from '@qupid/core';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [realtimeFeedback, setRealtimeFeedback] = useState<RealtimeFeedback | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const createSession = useCallback(async (
    personaId: string,
    systemInstruction: string
  ) => {
    try {
      const sessionId = await apiClient.createChatSession(
        personaId,
        systemInstruction
      );
      sessionIdRef.current = sessionId;
      return sessionId;
    } catch (error) {
      console.error('Failed to create chat session:', error);
      return null;
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!sessionIdRef.current || isLoading) return;

    const userMessage: Message = {
      sender: 'user',
      text: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get realtime feedback
      const lastAiMessage = messages
        .filter(m => m.sender === 'ai')
        .pop()?.text;
      
      const feedbackPromise = apiClient.getRealtimeFeedback(message, lastAiMessage);
      
      // Send message and get response
      const response = await apiClient.sendMessage(sessionIdRef.current, message);
      
      const aiMessage: Message = {
        sender: 'ai',
        text: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Set feedback if available
      const feedback = await feedbackPromise;
      if (feedback) {
        setRealtimeFeedback(feedback);
        setTimeout(() => setRealtimeFeedback(null), 2500);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const analyzeConversation = useCallback(async (): Promise<ConversationAnalysis | null> => {
    return await apiClient.analyzeConversation(messages);
  }, [messages]);

  const getCoachSuggestion = useCallback(async () => {
    return await apiClient.getCoachSuggestion(messages);
  }, [messages]);

  return {
    messages,
    isLoading,
    realtimeFeedback,
    createSession,
    sendMessage,
    analyzeConversation,
    getCoachSuggestion,
    setMessages
  };
};