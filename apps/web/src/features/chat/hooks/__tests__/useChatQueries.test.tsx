import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useChatSession,
  useSendMessage,
  useAnalyzeConversation,
  useRealtimeFeedback,
  useCoachSuggestion
} from '../useChatQueries';
import { apiClient } from '../../../../services/apiClient';

// Mock the actual apiClient used by hooks
vi.mock('../../../../services/apiClient', () => ({
  apiClient: {
    createChatSession: vi.fn(),
    sendMessage: vi.fn(),
    analyzeConversation: vi.fn(),
    getRealtimeFeedback: vi.fn(),
    getCoachSuggestion: vi.fn()
  }
}));

describe('Chat Query Hooks', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    
    return Wrapper;
  };

  describe('useChatSession', () => {
    it('should create a chat session', async () => {
      const mockSessionId = 'session-123';
      vi.mocked(apiClient.createChatSession).mockResolvedValueOnce(mockSessionId);

      const { result } = renderHook(() => useChatSession(), {
        wrapper: createWrapper()
      });

      const sessionData = {
        personaId: 'persona-456',
        systemInstruction: 'Be helpful'
      };

      result.current.mutate(sessionData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toBe(mockSessionId);
      });

      expect(apiClient.createChatSession).toHaveBeenCalledWith('persona-456', 'Be helpful');
    });

    it('should handle session creation error', async () => {
      const mockError = new Error('Failed to create session');
      vi.mocked(apiClient.createChatSession).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useChatSession(), {
        wrapper: createWrapper()
      });

      result.current.mutate({
        personaId: 'persona-456',
        systemInstruction: 'Be helpful'
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBe(mockError);
      });
    });
  });

  describe('useSendMessage', () => {
    it('should send a message and get response', async () => {
      const mockResponse = 'Hi there!';

      vi.mocked(apiClient.sendMessage).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useSendMessage(), {
        wrapper: createWrapper()
      });

      result.current.mutate({
        sessionId: 'session-123',
        message: 'Hello'
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(mockResponse);
      });

      expect(apiClient.sendMessage).toHaveBeenCalledWith('session-123', 'Hello');
    });
  });

  describe('useAnalyzeConversation', () => {
    it('should analyze conversation', async () => {
      const mockAnalysis = {
        totalScore: 85,
        feedback: 'Great conversation!',
        friendliness: { score: 90, feedback: 'Very friendly!' },
        curiosity: { score: 85, feedback: 'Good questions!' },
        empathy: { score: 80, feedback: 'Shows empathy!' },
        positivePoints: ['Friendly', 'Curious'],
        pointsToImprove: [
          { topic: 'depth', suggestion: 'Ask deeper questions' }
        ]
      };

      vi.mocked(apiClient.analyzeConversation).mockResolvedValueOnce(mockAnalysis);

      const { result } = renderHook(() => useAnalyzeConversation(), {
        wrapper: createWrapper()
      });

      const messages = [
        { sender: 'user' as const, text: 'Hello' },
        { sender: 'ai' as const, text: 'Hi there!' }
      ];

      result.current.mutate(messages);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(mockAnalysis);
      });

      expect(apiClient.analyzeConversation).toHaveBeenCalledWith(messages);
    });
  });

  describe('useRealtimeFeedback', () => {
    it('should get realtime feedback', async () => {
      const mockFeedback = {
        isGood: true,
        message: 'Great question!',
        category: 'question'
      };

      vi.mocked(apiClient.getRealtimeFeedback).mockResolvedValueOnce(mockFeedback);

      const { result } = renderHook(() => useRealtimeFeedback(), {
        wrapper: createWrapper()
      });

      const feedbackData = {
        lastUserMessage: 'What are your hobbies?',
        lastAiMessage: 'I enjoy reading!'
      };

      result.current.mutate(feedbackData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(mockFeedback);
      });

      expect(apiClient.getRealtimeFeedback).toHaveBeenCalledWith('What are your hobbies?', 'I enjoy reading!');
    });
  });

  describe('useCoachSuggestion', () => {
    it('should get coach suggestion', async () => {
      const mockSuggestion = {
        reason: 'You could ask more open-ended questions',
        suggestion: 'Try asking "What do you enjoy most about reading?"'
      };

      vi.mocked(apiClient.getCoachSuggestion).mockResolvedValueOnce(mockSuggestion);

      const { result } = renderHook(() => useCoachSuggestion(), {
        wrapper: createWrapper()
      });

      const messages = [
        { sender: 'user' as const, text: 'Do you read?' },
        { sender: 'ai' as const, text: 'Yes, I do!' }
      ];

      result.current.mutate(messages);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(mockSuggestion);
      });

      expect(apiClient.getCoachSuggestion).toHaveBeenCalledWith(messages);
    });

    it('should handle empty messages', async () => {
      const mockSuggestion = {
        reason: '',
        suggestion: ''
      };

      vi.mocked(apiClient.getCoachSuggestion).mockResolvedValueOnce(mockSuggestion);

      const { result } = renderHook(() => useCoachSuggestion(), {
        wrapper: createWrapper()
      });

      result.current.mutate([]);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(mockSuggestion);
      });
    });
  });
});