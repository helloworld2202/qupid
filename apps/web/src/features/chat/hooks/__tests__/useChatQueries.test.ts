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
import { apiClient } from '../../../../shared/api/apiClient';

// Mock apiClient
vi.mock('../../../../shared/api/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn()
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

    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  describe('useChatSession', () => {
    it('should create a chat session', async () => {
      const mockSessionId = 'session-123';
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          ok: true,
          data: { sessionId: mockSessionId }
        }
      });

      const { result } = renderHook(() => useChatSession(), {
        wrapper: createWrapper()
      });

      const sessionData = {
        userId: 'user-123',
        personaId: 'persona-456',
        systemInstruction: 'Be helpful'
      };

      result.current.mutate(sessionData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toBe(mockSessionId);
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/chat/sessions',
        sessionData
      );
    });

    it('should handle session creation error', async () => {
      const mockError = new Error('Failed to create session');
      vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useChatSession(), {
        wrapper: createWrapper()
      });

      result.current.mutate({
        userId: 'user-123',
        personaId: 'persona-456'
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBe(mockError);
      });
    });
  });

  describe('useSendMessage', () => {
    it('should send a message and get response', async () => {
      const mockResponse = {
        userMessage: { sender: 'user', text: 'Hello' },
        aiResponse: { sender: 'ai', text: 'Hi there!' }
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          ok: true,
          data: mockResponse
        }
      });

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

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/chat/sessions/session-123/messages',
        { message: 'Hello' }
      );
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

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          ok: true,
          data: mockAnalysis
        }
      });

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

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/chat/analyze',
        { messages }
      );
    });
  });

  describe('useRealtimeFeedback', () => {
    it('should get realtime feedback', async () => {
      const mockFeedback = {
        isGood: true,
        message: 'Great question!',
        category: 'question'
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          ok: true,
          data: mockFeedback
        }
      });

      const { result } = renderHook(() => useRealtimeFeedback(), {
        wrapper: createWrapper()
      });

      result.current.mutate({
        lastUserMessage: 'What are your hobbies?',
        lastAiMessage: 'I enjoy reading!'
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toEqual(mockFeedback);
      });
    });
  });

  describe('useCoachSuggestion', () => {
    it('should get coach suggestion', async () => {
      const mockSuggestion = {
        reason: 'You could ask more open-ended questions',
        suggestion: 'Try asking "What do you enjoy most about reading?"'
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          ok: true,
          data: mockSuggestion
        }
      });

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

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/chat/coach-suggestion',
        { messages }
      );
    });

    it('should handle empty messages', async () => {
      const mockSuggestion = {
        reason: '',
        suggestion: ''
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          ok: true,
          data: mockSuggestion
        }
      });

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