import { supabaseAdmin } from '../../../shared/infra/supabase.js';
import { Badge } from '@qupid/core';

export class BadgeService {
  async getAllBadges(): Promise<Badge[]> {
    const { data, error } = await supabaseAdmin
      .from('badges')
      .select('*')
      .order('category', { ascending: true })
      .order('rarity', { ascending: false });

    if (error) {
      console.error('Error fetching badges:', error);
      throw new Error('Failed to fetch badges');
    }

    return data || [];
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