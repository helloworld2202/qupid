
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          name: string
          user_gender: "male" | "female"
          experience: string
          confidence: string
          difficulty: string
          interests: string[]
        }
        Insert: {
          id: string
          name: string
          user_gender: "male" | "female"
          experience: string
          confidence: string
          difficulty: string
          interests: string[]
        }
        Update: {
          name?: string
          user_gender?: "male" | "female"
          experience?: string
          confidence?: string
          difficulty?: string
          interests?: string[]
        }
      }
      personas: {
        Row: {
          id: string
          created_at: string
          name: string
          age: number
          gender: "male" | "female"
          job: string
          mbti: string
          avatar: string
          intro: string
          tags: string[]
          match_rate: number
          system_instruction: string
          personality_traits: string[]
          interests: Json
          conversation_preview: Json
        }
        Insert: {
          name: string
          age: number
          gender: "male" | "female"
          job: string
          mbti: string
          avatar: string
          intro: string
          tags: string[]
          match_rate: number
          system_instruction: string
          personality_traits: string[]
          interests: Json
          conversation_preview: Json
        }
        Update: {
          name?: string
          age?: number
          gender?: "male" | "female"
          job?: string
          mbti?: string
          avatar?: string
          intro?: string
          tags?: string[]
          match_rate?: number
          system_instruction?: string
          personality_traits?: string[]
          interests?: Json
          conversation_preview?: Json
        }
      }
      favorites: {
        Row: {
          user_id: string
          persona_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          persona_id: string
        }
      }
      badges: {
        Row: {
            id: string
            created_at: string
            icon: string
            name: string
            description: string
            category: '대화' | '성장' | '특별'
            rarity: 'Common' | 'Rare' | 'Epic'
        }
        Insert: {
            icon: string
            name: string
            description: string
            category: '대화' | '성장' | '특별'
            rarity: 'Common' | 'Rare' | 'Epic'
        }
        Update: {
            icon?: string
            name?: string
            description?: string
            category?: '대화' | '성장' | '특별'
            rarity?: 'Common' | 'Rare' | 'Epic'
        }
      }
      user_badges: {
        Row: {
            id: number
            user_id: string
            badge_id: string
            created_at: string
        }
        Insert: {
            user_id: string
            badge_id: string
        }
      }
      analyses: {
        Row: {
            id: number
            user_id: string
            persona_id: string
            created_at: string
            analysis_data: Json
        },
        Insert: {
            user_id: string
            persona_id: string
            analysis_data: Json
        },
        Update: {
            analysis_data?: Json
        }
      }
    }
    Views: {}
    Functions: {}
  }
}
