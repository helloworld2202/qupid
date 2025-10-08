# Supabase 프로젝트 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속
2. "New Project" 클릭
3. 프로젝트 이름: `qupid`
4. 데이터베이스 비밀번호 설정
5. 지역 선택 (Asia Northeast - Tokyo 권장)

## 2. 환경 변수 설정

프로젝트 생성 후 다음 정보를 `.env.local`에 설정:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 3. 데이터베이스 스키마 설정

```sql
-- 사용자 프로필 테이블
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  user_gender TEXT NOT NULL CHECK (user_gender IN ('male', 'female')),
  partner_gender TEXT NOT NULL CHECK (partner_gender IN ('male', 'female')),
  experience TEXT NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence BETWEEN 1 AND 5),
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  interests TEXT[] NOT NULL DEFAULT '{}',
  is_tutorial_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 대화 테이블
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  partner_type TEXT NOT NULL CHECK (partner_type IN ('persona', 'coach')),
  partner_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  analysis_data JSONB
);

-- 메시지 테이블
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 페르소나 테이블
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  avatar TEXT,
  personality TEXT NOT NULL,
  occupation TEXT NOT NULL,
  education TEXT NOT NULL,
  location TEXT NOT NULL,
  height TEXT NOT NULL,
  body_type TEXT NOT NULL,
  interests TEXT[] NOT NULL DEFAULT '{}',
  values TEXT[] NOT NULL DEFAULT '{}',
  communication_style TEXT NOT NULL,
  dating_style TEXT NOT NULL,
  appearance_style TEXT NOT NULL,
  speech_pattern TEXT NOT NULL,
  lifestyle TEXT NOT NULL,
  special_notes TEXT[] DEFAULT '{}',
  big_five_scores JSONB NOT NULL,
  conversation_style TEXT NOT NULL,
  is_tutorial BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 레벨 시스템 테이블
CREATE TABLE user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  achievements TEXT[] DEFAULT '{}',
  unlocked_features TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 업적 테이블
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. RLS (Row Level Security) 설정

```sql
-- 사용자 프로필 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid()::text = id::text);

-- 대화 RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 메시지 RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages from own conversations" ON messages FOR SELECT USING (
  conversation_id IN (
    SELECT id FROM conversations WHERE user_id::text = auth.uid()::text
  )
);
CREATE POLICY "Users can create messages in own conversations" ON messages FOR INSERT WITH CHECK (
  conversation_id IN (
    SELECT id FROM conversations WHERE user_id::text = auth.uid()::text
  )
);
```

## 5. 테스트 데이터 삽입

```sql
-- 테스트 사용자 프로필
INSERT INTO user_profiles (email, name, user_gender, partner_gender, experience, confidence, difficulty, interests) VALUES
('test@example.com', '테스트 사용자', 'male', 'female', '없음', 3, 2, ARRAY['여행', '음악', '영화']);

-- 테스트 페르소나
INSERT INTO personas (name, age, gender, personality, occupation, education, location, height, body_type, interests, values, communication_style, dating_style, appearance_style, speech_pattern, lifestyle, big_five_scores, conversation_style) VALUES
('김서현', 25, 'female', 'ENFP', '초등학교 교사', '교육학 학사', '서울 강남구', '163cm', '보통', ARRAY['캠핑', '베이킹', '넷플릭스 시청'], ARRAY['가정 지향적', '따뜻한 인간관계 중시'], '따뜻하고 격려하는 말투, 이모티콘 자주 사용', '친구 같은 관계 선호, 솔직한 소통 중시', '내추럴', '맞아요~, 우와!, 정말요? 자주 사용', '아침형, 밖돌이, 계획형', '{"openness": 8, "conscientiousness": 7, "extraversion": 9, "agreeableness": 8, "neuroticism": 4}', '따뜻하고 격려하는 말투로 대화하는 교사입니다. 공감 능력이 높고 자연스러운 대화를 좋아해요.');
```

