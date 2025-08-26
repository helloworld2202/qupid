import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationBell } from '../NotificationBell';

// Mock data
const mockNotifications = [
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
];

// Create mock functions
const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();
const mockUseNotifications = vi.fn(() => ({ data: mockNotifications }));
const mockUseUnreadCount = vi.fn(() => ({ data: 3 }));
const mockUseMarkAsRead = vi.fn(() => ({ mutateAsync: mockMarkAsRead }));
const mockUseMarkAllAsRead = vi.fn(() => ({ mutateAsync: mockMarkAllAsRead }));

// Mock the hooks module
vi.mock('../../hooks/useNotifications', () => ({
  useUnreadCount: () => mockUseUnreadCount(),
  useNotifications: () => mockUseNotifications(),
  useMarkAsRead: () => mockUseMarkAsRead(),
  useMarkAllAsRead: () => mockUseMarkAllAsRead()
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '1시간 전')
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
    
    // Reset mock implementations
    mockUseNotifications.mockReturnValue({ data: mockNotifications });
    mockUseUnreadCount.mockReturnValue({ data: 3 });
    mockUseMarkAsRead.mockReturnValue({ mutateAsync: mockMarkAsRead });
    mockUseMarkAllAsRead.mockReturnValue({ mutateAsync: mockMarkAllAsRead });
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
    
    // Bell icon should be visible
    const bellButton = screen.getByRole('button');
    expect(bellButton).toBeInTheDocument();
    
    // Unread count badge should show "3"
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should open dropdown when bell is clicked', async () => {
    const user = userEvent.setup();
    renderNotificationBell();

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    // Dropdown should open with notifications
    expect(screen.getByText('알림')).toBeInTheDocument();
    expect(screen.getByText('모두 읽음')).toBeInTheDocument();
    expect(screen.getByText('오늘의 연습 시간!')).toBeInTheDocument();
  });

  it('should close dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    renderNotificationBell();

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);
    
    // Dropdown should be open
    expect(screen.getByText('알림')).toBeInTheDocument();

    // Find the backdrop overlay and click it
    const backdrop = document.querySelector('.fixed.inset-0');
    if (backdrop) {
      await user.click(backdrop as Element);
    } else {
      // Fallback: click body
      await user.click(document.body);
    }

    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByText('알림')).not.toBeInTheDocument();
    }, { timeout: 2000 });
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
    renderNotificationBell();

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    const unreadNotification = screen.getByText('오늘의 연습 시간!');
    if (unreadNotification) {
      await user.click(unreadNotification);
      
      await waitFor(() => {
        expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1');
      });
    }
  });

  it('should mark all as read when button is clicked', async () => {
    const user = userEvent.setup();
    renderNotificationBell();

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    const markAllButton = screen.getByText('모두 읽음');
    await user.click(markAllButton);

    await waitFor(() => {
      expect(mockMarkAllAsRead).toHaveBeenCalledWith('user-123');
    });
  });

  it('should show empty state when no notifications', async () => {
    // Mock empty notifications
    mockUseNotifications.mockReturnValue({ data: [] });
    mockUseUnreadCount.mockReturnValue({ data: 0 });
    
    const user = userEvent.setup();
    renderNotificationBell();

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    expect(screen.getByText('새로운 알림이 없습니다')).toBeInTheDocument();
  });

  it('should show unread indicator for unread notifications', () => {
    renderNotificationBell();

    // Badge should be visible
    const badge = screen.getByText('3');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-[#F093B0]');
  });

  it('should display relative time for notifications', async () => {
    const user = userEvent.setup();
    renderNotificationBell();

    const bellButton = screen.getByRole('button');
    await user.click(bellButton);

    // Check if formatDistanceToNow was used
    const timeElements = screen.getAllByText('1시간 전');
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('should not show unread count badge when count is 0', () => {
    mockUseUnreadCount.mockReturnValue({ data: 0 });
    
    renderNotificationBell();

    // Badge should not be visible when count is 0
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should show 9+ when unread count exceeds 9', () => {
    mockUseUnreadCount.mockReturnValue({ data: 15 });
    
    renderNotificationBell();

    expect(screen.getByText('9+')).toBeInTheDocument();
  });
});