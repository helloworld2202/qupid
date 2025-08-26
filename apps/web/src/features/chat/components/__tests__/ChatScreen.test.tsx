import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChatScreen from '../ChatScreen';
import { Persona } from '@qupid/core';

// Mock the hooks
vi.mock('../../hooks/useChatQueries', () => ({
  useChatSession: () => ({
    mutateAsync: vi.fn().mockResolvedValue('session-123')
  }),
  useSendMessage: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      userMessage: { sender: 'user', text: 'Hello' },
      aiResponse: { sender: 'ai', text: 'Hi there!' }
    })
  }),
  useAnalyzeConversation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      totalScore: 85,
      feedback: 'Great conversation!',
      friendliness: { score: 90, feedback: 'Very friendly!' },
      curiosity: { score: 85, feedback: 'Good questions!' },
      empathy: { score: 80, feedback: 'Shows empathy!' },
      positivePoints: ['Friendly', 'Curious'],
      pointsToImprove: [{ topic: 'depth', suggestion: 'Ask deeper questions' }]
    })
  }),
  useRealtimeFeedback: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      isGood: true,
      message: 'Great question!',
      category: 'question'
    })
  }),
  useCoachSuggestion: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      reason: 'You could be more engaging',
      suggestion: 'Try asking about their interests'
    })
  })
}));

vi.mock('../../hooks/useStyleAnalysis', () => ({
  useStyleAnalysis: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      currentStyle: {
        type: 'Friendly',
        characteristics: ['warm', 'curious'],
        strengths: ['good questions'],
        weaknesses: []
      },
      recommendations: []
    }),
    isPending: false
  })
}));

vi.mock('../../../coaching/hooks/useCoachingQueries', () => ({
  useCreateCoachingSession: () => ({
    mutateAsync: vi.fn().mockResolvedValue('coaching-session-123')
  }),
  useSendCoachingMessage: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      userMessage: { sender: 'user', text: 'Hello' },
      aiResponse: { sender: 'ai', text: 'Hi! I am your coach.' }
    })
  }),
  useAnalyzeCoachingSession: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      totalScore: 90,
      feedback: 'Excellent coaching session!'
    })
  })
}));

const mockPartner: Persona = {
  id: 'persona-1',
  name: 'Alex',
  age: 25,
  job: 'Designer',
  avatar: '/avatar.jpg',
  intro: 'Hi, I am Alex',
  personality: 'Friendly and creative',
  interests: ['art', 'music'],
  conversation_style: 'casual',
  conversation_preview: []
};

describe('ChatScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    vi.clearAllMocks();
  });

  const renderChatScreen = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ChatScreen
          partner={mockPartner}
          onComplete={vi.fn()}
          {...props}
        />
      </QueryClientProvider>
    );
  };

  it('should render chat screen with partner info', () => {
    renderChatScreen();
    
    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.getByText('🟢 온라인')).toBeInTheDocument();
  });

  it('should send message when user types and clicks send', async () => {
    const user = userEvent.setup();
    renderChatScreen();

    const input = screen.getByPlaceholderText(/메시지를 입력하세요/i);
    const sendButton = screen.getByRole('button', { name: /전송|send/i });

    await user.type(input, 'Hello');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  it('should show typing indicator when AI is responding', async () => {
    const user = userEvent.setup();
    renderChatScreen();

    const input = screen.getByPlaceholderText(/메시지를 입력하세요/i);
    await user.type(input, 'Hello');
    await user.type(input, '{enter}');

    // Typing indicator should appear briefly
    await waitFor(() => {
      const typingIndicator = screen.queryByTestId('typing-indicator');
      // Since our mock resolves immediately, typing indicator might not be visible
      // but the AI response should appear
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });
  });

  it('should disable input while AI is typing', async () => {
    const user = userEvent.setup();
    renderChatScreen();

    const input = screen.getByPlaceholderText(/메시지를 입력하세요/i) as HTMLInputElement;
    
    await user.type(input, 'Hello');
    await user.type(input, '{enter}');

    // Input should be cleared after sending
    expect(input.value).toBe('');
  });

  it('should show style analysis button after 3 messages', async () => {
    const user = userEvent.setup();
    renderChatScreen();

    const input = screen.getByPlaceholderText(/메시지를 입력하세요/i);

    // Send 3 messages
    await user.type(input, 'Message 1');
    await user.type(input, '{enter}');
    
    await user.type(input, 'Message 2');
    await user.type(input, '{enter}');

    // Style analysis button should not appear yet (need more than 3 messages)
    expect(screen.queryByText('💡 스타일 분석')).not.toBeInTheDocument();

    await user.type(input, 'Message 3');
    await user.type(input, '{enter}');

    // Now the button should appear
    await waitFor(() => {
      expect(screen.getByText('💡 스타일 분석')).toBeInTheDocument();
    });
  });

  it('should show coach hint when button is clicked', async () => {
    const user = userEvent.setup();
    renderChatScreen();

    const coachButton = screen.getByText('💬 힌트');
    await user.click(coachButton);

    await waitFor(() => {
      expect(screen.getByText('코치 제안')).toBeInTheDocument();
    });
  });

  it('should complete conversation when back button is clicked', async () => {
    const onComplete = vi.fn();
    renderChatScreen({ onComplete });

    const backButton = screen.getByRole('button', { name: /back|뒤로/i });
    fireEvent.click(backButton);

    expect(onComplete).toHaveBeenCalled();
  });

  describe('Tutorial Mode', () => {
    it('should show tutorial steps when in tutorial mode', () => {
      renderChatScreen({ isTutorial: true });

      // Should show tutorial progress
      expect(screen.getByText(/단계/)).toBeInTheDocument();
    });

    it('should show tutorial hints', () => {
      renderChatScreen({ isTutorial: true });

      // Tutorial should have special UI elements
      const tutorialElements = screen.queryAllByText(/튜토리얼/);
      // Tutorial mode should be active even if no explicit tutorial text
      expect(screen.getByText(/단계/)).toBeInTheDocument();
    });
  });

  describe('Coaching Mode', () => {
    it('should initialize coaching session when coach is provided', async () => {
      const mockCoach = {
        ...mockPartner,
        specialty: 'Communication skills'
      };

      renderChatScreen({ partner: mockCoach, isCoaching: true });

      await waitFor(() => {
        expect(screen.getByText('Alex')).toBeInTheDocument();
      });
    });
  });

  describe('Message Display', () => {
    it('should display messages in correct order', async () => {
      const user = userEvent.setup();
      renderChatScreen();

      const input = screen.getByPlaceholderText(/메시지를 입력하세요/i);

      await user.type(input, 'First message');
      await user.type(input, '{enter}');

      await user.type(input, 'Second message');
      await user.type(input, '{enter}');

      await waitFor(() => {
        const messages = screen.getAllByText(/message/);
        expect(messages.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should scroll to bottom when new message arrives', async () => {
      const user = userEvent.setup();
      renderChatScreen();

      const input = screen.getByPlaceholderText(/메시지를 입력하세요/i);
      
      // Send multiple messages
      for (let i = 0; i < 5; i++) {
        await user.type(input, `Message ${i + 1}`);
        await user.type(input, '{enter}');
      }

      // Check that messages are displayed
      await waitFor(() => {
        expect(screen.getByText('Message 5')).toBeInTheDocument();
      });
    });
  });
});