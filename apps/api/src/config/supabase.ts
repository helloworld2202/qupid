import { createClient } from '@supabase/supabase-js';
import { config } from './index';

// Supabase 클라이언트 생성
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// 데이터베이스 타입 정의
export interface DbUser {
  id: string;
  name: string;
  user_gender: 'male' | 'female' | 'other';
  partner_gender: 'male' | 'female' | 'other';
  experience: string;
  confidence: number;
  difficulty: number;
  interests: string[];
  is_tutorial_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbPersona {
  id: string;
  name: string;
  gender: string;
  age: number;
  mbti: string;
  personality: string;
  occupation: string;
  bio: string;
  interests: string[];
  avatar: string;
  match_rate: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  created_at: string;
}

export interface DbCoach {
  id: string;
  name: string;
  specialty: string;
  tagline: string;
  bio: string;
  avatar: string;
  expertise_areas: string[];
  coaching_style: string;
  created_at: string;
}

export interface DbConversation {
  id: string;
  user_id: string;
  partner_type: 'persona' | 'coach';
  partner_id: string;
  is_tutorial: boolean;
  started_at: string;
  ended_at?: string;
  status: 'active' | 'completed' | 'abandoned';
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export interface DbConversationAnalysis {
  id: string;
  conversation_id: string;
  overall_score: number;
  affinity_score: number;
  improvements: string[];
  achievements: string[];
  tips: string[];
  analyzed_at: string;
}

export interface DbPerformanceMetrics {
  id: string;
  user_id: string;
  week_start: string;
  weekly_score: number;
  daily_scores: number[];
  category_scores: Record<string, number>;
  total_time_minutes: number;
  session_count: number;
  created_at: string;
}

export interface DbBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  requirement_type: string;
  requirement_value: number;
  created_at: string;
}

export interface DbUserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  acquired_at: string;
  progress_current: number;
  progress_total?: number;
  featured: boolean;
}

export interface DbFavorite {
  id: string;
  user_id: string;
  persona_id: string;
  created_at: string;
}

// 데이터베이스 헬퍼 함수들
export const db = {
  // Users
  async getUser(userId: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return data;
  },

  async createUser(user: Partial<DbUser>): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    return data;
  },

  // Personas
  async getPersonas(): Promise<DbPersona[]> {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching personas:', error);
      return [];
    }
    return data || [];
  },

  async getPersona(personaId: string): Promise<DbPersona | null> {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('id', personaId)
      .single();
    
    if (error) {
      console.error('Error fetching persona:', error);
      return null;
    }
    return data;
  },

  // Coaches
  async getCoaches(): Promise<DbCoach[]> {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching coaches:', error);
      return [];
    }
    return data || [];
  },

  // Conversations
  async createConversation(conversation: Partial<DbConversation>): Promise<DbConversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .insert(conversation)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
    return data;
  },

  async updateConversation(conversationId: string, updates: Partial<DbConversation>): Promise<DbConversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', conversationId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating conversation:', error);
      return null;
    }
    return data;
  },

  // Messages
  async createMessage(message: Partial<DbMessage>): Promise<DbMessage | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating message:', error);
      return null;
    }
    return data;
  },

  async getMessages(conversationId: string): Promise<DbMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp');
    
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    return data || [];
  },

  // Performance Metrics
  async getPerformanceMetrics(userId: string, weekStart?: string): Promise<DbPerformanceMetrics | null> {
    const query = supabase
      .from('performance_metrics')
      .select('*')
      .eq('user_id', userId);
    
    if (weekStart) {
      query.eq('week_start', weekStart);
    } else {
      query.order('week_start', { ascending: false }).limit(1);
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      console.error('Error fetching performance metrics:', error);
      return null;
    }
    return data;
  },

  // Badges
  async getBadges(): Promise<DbBadge[]> {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('category');
    
    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }
    return data || [];
  },

  async getUserBadges(userId: string): Promise<DbUserBadge[]> {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
    return data || [];
  },

  // Favorites
  async getFavorites(userId: string): Promise<DbFavorite[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
    return data || [];
  },

  async toggleFavorite(userId: string, personaId: string): Promise<boolean> {
    // 먼저 존재하는지 확인
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('persona_id', personaId)
      .single();
    
    if (existing) {
      // 삭제
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);
      
      return !error;
    } else {
      // 추가
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, persona_id: personaId });
      
      return !error;
    }
  }
};

export default supabase;