import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationBell } from '../NotificationBell';

// Mock the hooks
vi.mock('../../hooks/useNotifications', () => ({
  useUnreadCount: vi.fn(() => ({
    data: 3
  })),
  useNotifications: vi.fn(() => ({
    data: [
      {
        id: 'notif-1',
        userId: 'user-123',
        type: 'practice_reminder',
        title: '오늘의 연습 시간!',
        message: '연애 대화 실력을 향상시킬 시간입니다.',
        isRead: false,
        createdAt: new Date('2024-01-01T10:00:00')
      },
      {
        id: 'notif-2',
        userId: 'user-123',
        type: 'achievement',
        title: '새로운 성과!',
        message: '첫 대화를 완료했어요!',
        isRead: false,
        createdAt: new Date('2024-01-01T09:00:00')
      },
      {
        id: 'notif-3',
        userId: 'user-123',
        type: 'coaching',
        title: 'AI 코치의 팁',
        message: '질문을 더 많이 해보세요.',
        isRead: true,
        createdAt: new Date('2024-01-01T08:00:00')
      }
    ]
  })),
  useMarkAsRead: () => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined)
  }),
  useMarkAllAsRead: () => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined)
  })
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '1시간 전')
}));

vi.mock('date-fns/locale', () => ({
  ko: {}
}));

describe('NotificationBell', () => {
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

  const renderNotificationBell = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <NotificationBell userId="user-123" />
      </QueryClientProvider>
    );
  };

  it('should render bell icon with unread count', () => {
    renderNotificationBell();
    
    expect(screen.getByText('🔔')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Unread count badge
  });

  it('should open dropdown when bell is clicked', async () => {
    const user = userEvent.setup();
    renderNotificationBell();

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    expect(screen.getByText('알림')).toBeInTheDocument();
    expect(screen.getByText('오늘의 연습 시간!')).toBeInTheDocument();
    expect(screen.getByText('새로운 성과!')).toBeInTheDocument();
  });

  it('should close dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    renderNotificationBell();

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);
    
    expect(screen.getByText('알림')).toBeInTheDocument();

    // Click outside (on the backdrop)
    const backdrop = document.querySelector('.fixed.inset-0');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    await waitFor(() => {
      expect(screen.queryByText('알림')).not.toBeInTheDocument();
    });
  });

  it('should show correct notification icons', async () => {
    const user = userEvent.setup();
    renderNotificationBell();

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    expect(screen.getByText('💪')).toBeInTheDocument(); // practice_reminder
    expect(screen.getByText('🎉')).toBeInTheDocument(); // achievement
    expect(screen.getByText('💡')).toBeInTheDocument(); // coaching
  });

  it('should mark notification as read when clicked', async () => {
    const user = userEvent.setup();
    const { useMarkAsRead } = await import('../../hooks/useNotifications');
    const markAsReadMock = vi.fn().mockResolvedValue(undefined);
    (useMarkAsRead as any).mockReturnValue({
      mutateAsync: markAsReadMock
    });

    renderNotificationBell();

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    const unreadNotification = screen.getByText('오늘의 연습 시간!').closest('div[class*="border-b"]');
    if (unreadNotification) {
      await user.click(unreadNotification);
      expect(markAsReadMock).toHaveBeenCalledWith('notif-1');
    }
  });

  it('should mark all as read when button is clicked', async () => {
    const user = userEvent.setup();
    const { useMarkAllAsRead } = await import('../../hooks/useNotifications');
    const markAllAsReadMock = vi.fn().mockResolvedValue(undefined);
    (useMarkAllAsRead as any).mockReturnValue({
      mutateAsync: markAllAsReadMock
    });

    renderNotificationBell();

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    const markAllButton = screen.getByText('모두 읽음');
    await user.click(markAllButton);

    expect(markAllAsReadMock).toHaveBeenCalledWith('user-123');
  });

  it('should show empty state when no notifications', async () => {
    const user = userEvent.setup();
    const { useNotifications } = await import('../../hooks/useNotifications');
    (useNotifications as any).mockReturnValue({
      data: []
    });

    renderNotificationBell();

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    expect(screen.getByText('새로운 알림이 없습니다')).toBeInTheDocument();
  });

  it('should show unread indicator for unread notifications', async () => {
    const user = userEvent.setup();
    renderNotificationBell();

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    // Check for unread notification styling (pink background)
    const unreadNotifications = document.querySelectorAll('.bg-pink-50');
    expect(unreadNotifications.length).toBe(2); // 2 unread notifications
  });

  it('should display relative time for notifications', async () => {
    const user = userEvent.setup();
    renderNotificationBell();

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    // formatDistanceToNow is mocked to return '1시간 전'
    const timeTags = screen.getAllByText('1시간 전');
    expect(timeTags.length).toBeGreaterThan(0);
  });

  it('should not show unread count badge when count is 0', () => {
    const { useUnreadCount } = require('../../hooks/useNotifications');
    (useUnreadCount as any).mockReturnValue({
      data: 0
    });

    renderNotificationBell();
    
    expect(screen.getByText('🔔')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument(); // Should not show 0 badge
  });

  it('should show 9+ when unread count exceeds 9', () => {
    const { useUnreadCount } = require('../../hooks/useNotifications');
    (useUnreadCount as any).mockReturnValue({
      data: 15
    });

    renderNotificationBell();
    
    expect(screen.getByText('9+')).toBeInTheDocument();
  });
});