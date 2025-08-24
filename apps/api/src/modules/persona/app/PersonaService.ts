import { db } from '../../../config/supabase';
import { Persona } from '@qupid/core';

export class PersonaService {
  /**
   * 모든 페르소나 조회
   */
  async getAllPersonas(): Promise<Persona[]> {
    const dbPersonas = await db.getPersonas();
    
    return dbPersonas.map(p => ({
      id: p.id,
      name: p.name,
      gender: p.gender as 'male' | 'female',
      age: p.age,
      mbti: p.mbti,
      personality: p.personality,
      occupation: p.occupation,
      bio: p.bio,
      interests: p.interests,
      avatar: p.avatar,
      match_rate: p.match_rate,
      difficulty: p.difficulty,
      tags: p.tags
    }));
  }

  /**
   * 특정 페르소나 조회
   */
  async getPersonaById(id: string): Promise<Persona | null> {
    const dbPersona = await db.getPersona(id);
    
    if (!dbPersona) {
      return null;
    }

    return {
      id: dbPersona.id,
      name: dbPersona.name,
      gender: dbPersona.gender as 'male' | 'female',
      age: dbPersona.age,
      mbti: dbPersona.mbti,
      personality: dbPersona.personality,
      occupation: dbPersona.occupation,
      bio: dbPersona.bio,
      interests: dbPersona.interests,
      avatar: dbPersona.avatar,
      match_rate: dbPersona.match_rate,
      difficulty: dbPersona.difficulty,
      tags: dbPersona.tags
    };
  }

  /**
   * 성별로 페르소나 필터링
   */
  async getPersonasByGender(gender: 'male' | 'female'): Promise<Persona[]> {
    const allPersonas = await this.getAllPersonas();
    return allPersonas.filter(p => p.gender === gender);
  }

  /**
   * 추천 페르소나 조회 (매칭률 기반)
   */
  async getRecommendedPersonas(userGender: string, limit: number = 5): Promise<Persona[]> {
    const targetGender = userGender === 'female' ? 'male' : 'female';
    const personas = await this.getPersonasByGender(targetGender);
    
    // 매칭률 기준 정렬
    return personas
      .sort((a, b) => b.match_rate - a.match_rate)
      .slice(0, limit);
  }
}