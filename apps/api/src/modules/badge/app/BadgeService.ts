import { supabaseAdmin } from '../../../shared/infra/supabase.js';
import { Badge, MOCK_BADGES } from '@qupid/core';

export class BadgeService {
  async getAllBadges(): Promise<Badge[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('badges')
        .select('*')
        .order('category', { ascending: true })
        .order('rarity', { ascending: false });

      if (error) {
        console.warn('DB error fetching badges, using fallback:', error);
        return MOCK_BADGES;
      }

      // DB가 비어있으면 fallback 사용
      if (!data || data.length === 0) {
        console.log('No badges in DB, using fallback constants');
        return MOCK_BADGES;
      }

      return data;
    } catch (error) {
      console.warn('Error fetching badges, using fallback:', error);
      return MOCK_BADGES;
    }
  }

  async getUserBadges(userId: string): Promise<Badge[]> {
    const { data, error } = await supabaseAdmin
      .from('user_badges')
      .select(`
        badge_id,
        acquired_at,
        badges (*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user badges:', error);
      throw new Error('Failed to fetch user badges');
    }

    // Transform the data to include acquired status
    const userBadges = data?.map((item: any) => ({
      ...item.badges,
      acquired: true,
      acquired_at: item.acquired_at
    })) || [];

    // Get all badges to show both acquired and not acquired
    const allBadges = await this.getAllBadges();
    
    // Merge user badges with all badges
    return allBadges.map(badge => {
      const userBadge = userBadges.find((ub: any) => ub.id === badge.id);
      return {
        ...badge,
        acquired: !!userBadge,
        acquired_at: userBadge?.acquired_at
      };
    });
  }

  async awardBadge(userId: string, badgeId: string): Promise<void> {
    const { error } = await (supabaseAdmin as any)
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
        acquired_at: new Date().toISOString()
      })
      .single();

    if (error) {
      console.error('Error awarding badge:', error);
      throw new Error('Failed to award badge');
    }
  }
}