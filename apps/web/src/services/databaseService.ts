
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserProfile, Persona, Badge, ConversationAnalysis, PerformanceData } from '@qupid/core';
import { Json, Database } from '../types/database.types';

type NewUserProfile = Pick<UserProfile, 
  'name' | 
  'user_gender' | 
  'experience' | 
  'confidence' | 
  'difficulty' | 
  'interests'
>;

// A robust helper to parse fields that might be JSON strings or already objects.
const parseJsonField = <T>(field: Json | null | undefined, defaultValue: T): T => {
    if (!field) {
        return defaultValue;
    }
    // If it's already an array/object, return it. (handles auto-parsing by Supabase client)
    if (typeof field === 'object' && field !== null) {
        return field as T;
    }
    // If it's a string, try to parse it.
    if (typeof field === 'string') {
        try {
            return JSON.parse(field) as T;
        } catch (e) {
            console.error("Failed to parse JSON string from DB:", field, e);
            return defaultValue;
        }
    }
    // Fallback for unexpected types
    return defaultValue;
};


// == Profile Management ==
export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: 'exact one row not found'
    console.error('Error fetching profile:', error);
    return null;
  }
  return data as UserProfile | null;
};

export const createProfile = async (userId: string, profileData: NewUserProfile): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured) return null;

  const dbProfile: Database['public']['Tables']['profiles']['Insert'] = {
      id: userId,
      name: profileData.name,
      user_gender: profileData.user_gender,
      experience: profileData.experience,
      confidence: profileData.confidence,
      difficulty: profileData.difficulty,
      interests: profileData.interests,
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert(dbProfile)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }
  return data as UserProfile | null;
};

// == Persona Management ==
export const getPersonas = async (): Promise<Persona[]> => {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('personas').select('*');
    if (error) {
        console.error('Error fetching personas:', error);
        return [];
    }
    // The JSON/Array columns may be strings or objects, so we parse/check them robustly.
    return data.map(p => ({
        ...p,
        interests: parseJsonField<Persona['interests']>(p.interests, []),
        conversation_preview: parseJsonField<Persona['conversation_preview']>(p.conversation_preview, []),
        personality_traits: Array.isArray(p.personality_traits) ? p.personality_traits : [],
        tags: Array.isArray(p.tags) ? p.tags : [],
    }));
};

// == Favorites Management ==
export const getFavorites = async (userId: string): Promise<string[]> => {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('favorites').select('persona_id').eq('user_id', userId);
    if(error) {
        console.error('Error fetching favorites:', error);
        return [];
    }
    return data.map(fav => fav.persona_id);
}

export const toggleFavorite = async (userId: string, personaId: string, isCurrentlyFavorite: boolean) => {
    if (!isSupabaseConfigured) return;
    if(isCurrentlyFavorite) {
        // Remove from favorites
        const { error } = await supabase.from('favorites').delete().match({ user_id: userId, persona_id: personaId });
        if (error) console.error("Error removing favorite:", error);
    } else {
        // Add to favorites
        const newFavorite: Database['public']['Tables']['favorites']['Insert'] = { user_id: userId, persona_id: personaId };
        const { error } = await supabase.from('favorites').insert(newFavorite);
        if (error) console.error("Error adding favorite:", error);
    }
}

// == Badge Management ==
export const getBadgesForUser = async (userId: string): Promise<Badge[]> => {
    if (!isSupabaseConfigured) return [];
    // This would be a more complex query in a real app, likely a DB function (RPC)
    // to join badges and user_badges and calculate progress.
    // For now, we'll fetch all badges and the ones the user has.
    
    const { data: allBadges, error: badgesError } = await supabase.from('badges').select('*');
    if (badgesError) {
        console.error('Error fetching all badges:', badgesError);
        return [];
    }

    const { data: userBadgeLinks, error: userBadgesError } = await supabase.from('user_badges').select('badge_id').eq('user_id', userId);
     if (userBadgesError) {
        console.error('Error fetching user badges:', userBadgesError);
        return []; // Return all badges but none acquired
    }
    
    const userBadgeIds = new Set(userBadgeLinks.map(b => b.badge_id));
    
    return allBadges.map(b => ({
        ...b,
        acquired: userBadgeIds.has(b.id),
        // Progress would need another table or logic
    })) as Badge[];
};


// == Analysis & Performance ==
export const saveAnalysis = async (userId: string, personaId: string, analysis: ConversationAnalysis): Promise<void> => {
    if (!isSupabaseConfigured) return;
    
    const newAnalysis: Database['public']['Tables']['analyses']['Insert'] = {
        user_id: userId,
        persona_id: personaId,
        analysis_data: analysis as unknown as Json,
    };
    
    const { error } = await supabase.from('analyses').insert(newAnalysis);
    if(error) {
        console.error("Error saving analysis:", error);
    }
};

export const getPerformanceData = async (userId: string): Promise<PerformanceData> => {
    // This is a placeholder. In a real application, this data would be
    // calculated on the backend, likely through a database view or function (RPC),
    // based on the saved analyses for the user.
    return {
        weeklyScore: 78,
        scoreChange: 12,
        scoreChangePercentage: 18,
        dailyScores: [60, 65, 70, 68, 75, 72, 78],
        radarData: {
            labels: ['친근함', '호기심', '공감력', '유머', '배려', '적극성'],
            datasets: [{
            label: '이번 주',
            data: [85, 92, 58, 60, 75, 70],
            backgroundColor: 'rgba(240, 147, 176, 0.2)',
            borderColor: 'rgba(240, 147, 176, 1)',
            borderWidth: 2,
            }]
        },
        stats: {
            totalTime: '2시간 15분',
            sessionCount: 8,
            avgTime: '17분',
            longestSession: { time: '32분', persona: '김소연님과' },
            preferredType: '활발한 성격 (60%)'
        },
        categoryScores: [
            { title: '친근함', emoji: '😊', score: 85, change: 8, goal: 90 },
            { title: '호기심', emoji: '🤔', score: 92, change: 15, goal: 90 },
            { title: '공감력', emoji: '💬', score: 58, change: 3, goal: 70 },
        ]
    };
};
