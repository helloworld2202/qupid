import { db } from '../../../config/supabase';
import { AICoach } from '@qupid/core';

export class CoachService {
  /**
   * 모든 코치 조회
   */
  async getAllCoaches(): Promise<AICoach[]> {
    const dbCoaches = await db.getCoaches();
    
    return dbCoaches.map(c => ({
      id: c.id,
      name: c.name,
      specialty: c.specialty,
      tagline: c.tagline,
      bio: c.bio,
      avatar: c.avatar,
      expertise_areas: c.expertise_areas,
      coaching_style: c.coaching_style
    }));
  }

  /**
   * 특정 코치 조회
   */
  async getCoachById(id: string): Promise<AICoach | null> {
    const coaches = await this.getAllCoaches();
    return coaches.find(c => c.id === id) || null;
  }

  /**
   * 전문 분야로 코치 필터링
   */
  async getCoachesBySpecialty(specialty: string): Promise<AICoach[]> {
    const allCoaches = await this.getAllCoaches();
    return allCoaches.filter(c => 
      c.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  }
}