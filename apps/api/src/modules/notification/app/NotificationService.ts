import supabaseAdmin from '../../../config/supabase.js';

export interface Notification {
  id: string;
  userId: string;
  type: 'practice_reminder' | 'achievement' | 'coaching' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

export class NotificationService {
  /**
   * 알림 생성
   */
  async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<string> {
    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        is_read: false,
        data,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }

    return notification.id;
  }

  /**
   * 사용자 알림 목록 조회
   */
  async getUserNotifications(
    userId: string,
    onlyUnread: boolean = false
  ): Promise<Notification[]> {
    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (onlyUnread) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to get notifications:', error);
      throw error;
    }

    return (data || []).map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.is_read,
      data: n.data,
      createdAt: new Date(n.created_at)
    }));
  }

  /**
   * 알림 읽음 처리
   */
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * 모든 알림 읽음 처리
   */
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  /**
   * 알림 삭제
   */
  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  /**
   * 연습 알림 생성 (스케줄러에서 호출)
   */
  async createPracticeReminder(userId: string): Promise<void> {
    await this.createNotification(
      userId,
      'practice_reminder',
      '오늘의 연습 시간이에요! 💪',
      '연애 대화 실력을 향상시킬 시간입니다. 지금 바로 연습을 시작해보세요!',
      { action: 'start_practice' }
    );
  }

  /**
   * 성과 달성 알림
   */
  async createAchievementNotification(
    userId: string,
    achievement: string,
    badgeId?: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'achievement',
      '새로운 성과 달성! 🎉',
      achievement,
      { badgeId }
    );
  }

  /**
   * 코칭 알림
   */
  async createCoachingNotification(
    userId: string,
    coachingTip: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'coaching',
      'AI 코치의 팁 💡',
      coachingTip,
      { source: 'ai_coach' }
    );
  }

  /**
   * 알림 설정 가져오기
   */
  async getNotificationSettings(userId: string): Promise<{
    practiceReminder: boolean;
    achievementAlerts: boolean;
    coachingTips: boolean;
    systemNotices: boolean;
    reminderTime?: string;
  }> {
    const { data, error } = await supabaseAdmin
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // not found error
      console.error('Failed to get notification settings:', error);
      throw error;
    }

    return {
      practiceReminder: data?.practice_reminder ?? true,
      achievementAlerts: data?.achievement_alerts ?? true,
      coachingTips: data?.coaching_tips ?? true,
      systemNotices: data?.system_notices ?? true,
      reminderTime: data?.reminder_time ?? '20:00'
    };
  }

  /**
   * 알림 설정 업데이트
   */
  async updateNotificationSettings(
    userId: string,
    settings: Partial<{
      practiceReminder: boolean;
      achievementAlerts: boolean;
      coachingTips: boolean;
      systemNotices: boolean;
      reminderTime: string;
    }>
  ): Promise<void> {
    const dbSettings = {
      user_id: userId,
      practice_reminder: settings.practiceReminder,
      achievement_alerts: settings.achievementAlerts,
      coaching_tips: settings.coachingTips,
      system_notices: settings.systemNotices,
      reminder_time: settings.reminderTime,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabaseAdmin
      .from('notification_settings')
      .upsert(dbSettings, { onConflict: 'user_id' });

    if (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  }

  /**
   * 읽지 않은 알림 개수
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }

    return count || 0;
  }
}