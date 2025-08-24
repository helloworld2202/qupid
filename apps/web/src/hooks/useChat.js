import { useState, useRef, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
export const useChat = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [realtimeFeedback, setRealtimeFeedback] = useState(null);
    const sessionIdRef = useRef(null);
    const createSession = useCallback(async (personaId, systemInstruction) => {
        try {
            const sessionId = await apiClient.createChatSession(personaId, systemInstruction);
            sessionIdRef.current = sessionId;
            return sessionId;
        }
        catch (error) {
            console.error('Failed to create chat session:', error);
            return null;
        }
    }, []);
    const sendMessage = useCallback(async (message) => {
        if (!sessionIdRef.current || isLoading)
            return;
        const userMessage = {
            sender: 'user',
            text: message,
            timestamp: Date.now()
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
            const aiMessage = {
                sender: 'ai',
                text: response,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, aiMessage]);
            // Set feedback if available
            const feedback = await feedbackPromise;
            if (feedback) {
                setRealtimeFeedback(feedback);
                setTimeout(() => setRealtimeFeedback(null), 2500);
            }
        }
        catch (error) {
            console.error('Failed to send message:', error);
        }
        finally {
            setIsLoading(false);
        }
    }, [messages, isLoading]);
    const analyzeConversation = useCallback(async () => {
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
