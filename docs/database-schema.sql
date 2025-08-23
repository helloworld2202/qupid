-- Qupid Database Schema
-- PostgreSQL/Supabase

-- =====================================================
-- 1. USERS & AUTHENTICATION
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    user_gender VARCHAR(20) CHECK (user_gender IN ('male', 'female', 'other')),
    partner_gender VARCHAR(20) CHECK (partner_gender IN ('male', 'female', 'other')),
    experience VARCHAR(50),
    confidence INTEGER CHECK (confidence >= 1 AND confidence <= 5),
    difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
    interests TEXT[],
    is_tutorial_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. AI PERSONAS & COACHES
-- =====================================================

-- AI Personas table
CREATE TABLE IF NOT EXISTS public.personas (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    age INTEGER NOT NULL,
    mbti VARCHAR(4),
    personality VARCHAR(100),
    occupation VARCHAR(100),
    bio TEXT,
    interests TEXT[],
    avatar VARCHAR(500),
    match_rate INTEGER DEFAULT 50,
    difficulty VARCHAR(20) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Coaches table
CREATE TABLE IF NOT EXISTS public.coaches (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    tagline TEXT,
    bio TEXT,
    avatar VARCHAR(500),
    expertise_areas TEXT[],
    coaching_style TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CONVERSATIONS & MESSAGES
-- =====================================================

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    partner_type VARCHAR(20) CHECK (partner_type IN ('persona', 'coach')),
    partner_id VARCHAR(50) NOT NULL,
    is_tutorial BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned'))
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) CHECK (sender_type IN ('user', 'ai')),
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. ANALYSIS & PERFORMANCE
-- =====================================================

-- Conversation Analysis table
CREATE TABLE IF NOT EXISTS public.conversation_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    affinity_score INTEGER CHECK (affinity_score >= 0 AND affinity_score <= 100),
    improvements TEXT[],
    achievements TEXT[],
    tips TEXT[],
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    weekly_score INTEGER DEFAULT 0,
    daily_scores INTEGER[7],
    category_scores JSONB, -- {친근함: 85, 호기심: 92, ...}
    total_time_minutes INTEGER DEFAULT 0,
    session_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week_start)
);

-- =====================================================
-- 5. BADGES & ACHIEVEMENTS
-- =====================================================

-- Badges definition table
CREATE TABLE IF NOT EXISTS public.badges (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    rarity VARCHAR(20) CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary')),
    requirement_type VARCHAR(50),
    requirement_value INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id VARCHAR(50) NOT NULL REFERENCES public.badges(id),
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    progress_current INTEGER DEFAULT 0,
    progress_total INTEGER,
    featured BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, badge_id)
);

-- =====================================================
-- 6. USER PREFERENCES
-- =====================================================

-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    persona_id VARCHAR(50) NOT NULL REFERENCES public.personas(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, persona_id)
);

-- Learning Goals table
CREATE TABLE IF NOT EXISTS public.learning_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50),
    daily_conversation_target INTEGER DEFAULT 3,
    weekly_time_target_minutes INTEGER DEFAULT 45,
    focus_areas TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    daily_reminder BOOLEAN DEFAULT TRUE,
    reminder_time TIME DEFAULT '20:00:00',
    achievement_alerts BOOLEAN DEFAULT TRUE,
    weekly_report BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON public.messages(timestamp);
CREATE INDEX idx_performance_metrics_user_week ON public.performance_metrics(user_id, week_start);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own conversations" ON public.conversations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

-- Public read access for personas, coaches, and badges
CREATE POLICY "Anyone can view personas" ON public.personas
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view coaches" ON public.coaches
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view badges" ON public.badges
    FOR SELECT USING (true);

-- =====================================================
-- 9. FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_goals_updated_at BEFORE UPDATE ON public.learning_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON public.notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();