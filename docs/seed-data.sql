-- Qupid Seed Data (Supabase Auth 사용자 생성 포함)
-- 이 스크립트는 auth.users와 public.users를 모두 생성합니다
-- ⚠️ 주의: 개발/테스트 환경에서만 사용하세요!

-- =====================================================
-- 0. AUTH USERS 생성 (테스트용)
-- =====================================================
-- Supabase Auth에 테스트 사용자 생성
-- 비밀번호는 모두 'test1234'로 설정

-- 테스트 사용자 1 (ID나 email이 이미 존재하면 건너뜀)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '11111111-1111-1111-1111-111111111111'::uuid OR email = 'test1@example.com') THEN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            aud,
            role
        ) VALUES (
            '11111111-1111-1111-1111-111111111111'::uuid,
            'test1@example.com',
            crypt('test1234', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            '{"name": "테스트 사용자"}'::jsonb,
            'authenticated',
            'authenticated'
        );
    END IF;
END $$;

-- 테스트 사용자 2 (ID나 email이 이미 존재하면 건너뜀)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '22222222-2222-2222-2222-222222222222'::uuid OR email = 'test2@example.com') THEN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            aud,
            role
        ) VALUES (
            '22222222-2222-2222-2222-222222222222'::uuid,
            'test2@example.com',
            crypt('test1234', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            '{"name": "테스트 사용자2"}'::jsonb,
            'authenticated',
            'authenticated'
        );
    END IF;
END $$;

-- 테스트 사용자 3 (튜토리얼 미완료, ID나 email이 이미 존재하면 건너뜀)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '33333333-3333-3333-3333-333333333333'::uuid OR email = 'test3@example.com') THEN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            aud,
            role
        ) VALUES (
            '33333333-3333-3333-3333-333333333333'::uuid,
            'test3@example.com',
            crypt('test1234', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            '{"name": "튜토리얼 테스트"}'::jsonb,
            'authenticated',
            'authenticated'
        );
    END IF;
END $$;

-- =====================================================
-- 이후 기존 seed-data.sql 내용과 동일
-- =====================================================

-- 1. AI PERSONAS
INSERT INTO public.personas (id, name, gender, age, mbti, personality, occupation, bio, interests, avatar, match_rate, difficulty, tags) VALUES
('persona-1', '김소연', 'female', 23, 'ENFP', '외향적이고 호기심많은', '대학생', 
 '게임하고 영화 보는 걸 좋아해요 ✨ RPG, 어드벤처 장르를 좋아하고, 마블 영화와 로맨스 영화를 즐겨봐요. 예쁜 카페 찾아다니는 것도 좋아해요!',
 ARRAY['게임', '영화', '카페', '음악'],
 'https://avatar.iran.liara.run/public/girl?username=SoyeonKim',
 95, 'Easy', ARRAY['게임', '영화', '활발함']),

('persona-2', '이미진', 'female', 25, 'ISFJ', '차분하고 배려심깊은', '도서관 사서',
 '조용한 카페에서 책 읽기를 좋아해요 📚 주로 소설을 읽어요. 추천해주실 책 있나요? 조용한 동네 카페에서 시간 보내는걸 좋아해요.',
 ARRAY['독서', '카페'],
 'https://avatar.iran.liara.run/public/girl?username=MijinLee',
 88, 'Medium', ARRAY['독서', '차분함', '힐링']),

('persona-3', '박예린', 'female', 24, 'INTJ', '논리적이고 지적인', '대학원생',
 '새로운 것을 배우는 게 즐거워요 🧠 제 전공 분야에 대해 이야기하는 걸 좋아하고, 다양한 주제에 대해 깊이 있는 대화를 나눠보고 싶어요.',
 ARRAY['과학', '토론'],
 'https://avatar.iran.liara.run/public/girl?username=YerinPark',
 82, 'Hard', ARRAY['학습', '분석적', '깊이있음']),

('persona-4', '최하늘', 'female', 26, 'INFP', '감성적이고 창의적인', 'UI 디자이너',
 '예쁜 것들을 보고 만드는 걸 좋아해요 🎨 직접 그림 그리는 것도, 전시회 가는 것도 좋아해요. 필름 카메라로 일상을 기록하는 걸 즐겨요.',
 ARRAY['미술', '사진'],
 'https://avatar.iran.liara.run/public/girl?username=HaneulChoi',
 79, 'Medium', ARRAY['예술', '감성적', '창의적']),

('persona-5', '강지우', 'female', 22, 'ESFP', '활동적이고 사교적인', '헬스 트레이너',
 '운동하고 맛있는 거 먹는 게 최고! 💪 같이 운동하면 정말 재밌을 거예요! 맛있는 다이어트 레시피도 많이 알고 있어요.',
 ARRAY['운동', '건강식'],
 'https://avatar.iran.liara.run/public/girl?username=JiwuKang',
 75, 'Easy', ARRAY['운동', '에너지', '긍정적']),

('persona-6', '이민준', 'male', 28, 'ISTJ', '차분하고 논리적인', '개발자',
 '조용하지만 깊은 대화를 나누는 걸 좋아합니다. 서로의 취미를 존중해 줄 수 있는 분이면 좋겠어요. 최근에 본 SF 영화에 대해 얘기하고 싶어요.',
 ARRAY['영화 감상', '코딩'],
 'https://avatar.iran.liara.run/public/boy?username=MinjunLee',
 88, 'Medium', ARRAY['영화', '코딩'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  gender = EXCLUDED.gender,
  age = EXCLUDED.age,
  mbti = EXCLUDED.mbti,
  personality = EXCLUDED.personality,
  occupation = EXCLUDED.occupation,
  bio = EXCLUDED.bio,
  interests = EXCLUDED.interests,
  avatar = EXCLUDED.avatar,
  match_rate = EXCLUDED.match_rate,
  difficulty = EXCLUDED.difficulty,
  tags = EXCLUDED.tags;

-- 2. AI COACHES
INSERT INTO public.coaches (id, name, specialty, tagline, bio, avatar, expertise_areas, coaching_style) VALUES
('coach-1', '이레나', '첫인상', '성공적인 첫 만남을 위한 대화 시작법',
 '안녕하세요, 첫인상 전문 코치 이레나입니다. 누구나 3분 안에 상대방에게 호감을 줄 수 있도록, 자연스럽고 매력적인 대화 시작법을 알려드릴게요.',
 'https://avatar.iran.liara.run/public/girl?username=Irena',
 ARRAY['대화 시작', '첫인사', '호감 형성'],
 '격려적이고 전문적인 코칭'),

('coach-2', '알렉스', '깊은 대화', '피상적인 대화를 넘어 진솔한 관계로',
 '저는 깊고 의미 있는 대화를 통해 관계를 발전시키는 방법을 코칭하는 알렉스입니다. 공통 관심사를 찾고, 생각과 감정을 공유하는 연습을 함께 해봐요.',
 'https://avatar.iran.liara.run/public/boy?username=Alex',
 ARRAY['깊은 대화', '감정 공유', '공통점 찾기'],
 '공감적이고 통찰력 있는 코칭'),

('coach-3', '클로이', '자신감', '어떤 상황에서도 당당하게 나를 표현하기',
 '자신감 코치 클로이입니다. 대화 중 불안감을 느끼거나 자기표현에 어려움을 겪는 분들을 도와드려요. 긍정적인 자기 대화와 당당한 표현법을 훈련합니다.',
 'https://avatar.iran.liara.run/public/girl?username=Chloe',
 ARRAY['자신감 향상', '불안 극복', '자기표현'],
 '지지적이고 긍정적인 코칭'),

('coach-4', '데이빗', '유머/위트', '대화를 즐겁게 만드는 유머 감각 키우기',
 '안녕하세요, 유머 코치 데이빗입니다. 대화를 더 즐겁고 유쾌하게 만들고 싶으신가요? 재치 있는 농담과 긍정적인 유머를 사용하는 방법을 함께 연습해봐요.',
 'https://avatar.iran.liara.run/public/boy?username=David',
 ARRAY['유머 사용', '위트', '재치있는 대화'],
 '유쾌하고 재치있는 코칭')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  specialty = EXCLUDED.specialty,
  tagline = EXCLUDED.tagline,
  bio = EXCLUDED.bio,
  avatar = EXCLUDED.avatar,
  expertise_areas = EXCLUDED.expertise_areas,
  coaching_style = EXCLUDED.coaching_style;

-- 3. BADGES
INSERT INTO public.badges (id, name, icon, description, category, rarity, requirement_type, requirement_value) VALUES
('badge-1', '꾸준함의 달인', '🏆', '7일 연속 대화 달성', '성장', 'Rare', 'streak_days', 7),
('badge-2', '첫인사 마스터', '👋', '첫 대화를 성공적으로 시작했어요.', '대화', 'Common', 'first_conversation', 1),
('badge-3', '질문왕', '🧐', '대화에서 질문 10회 이상 하기', '대화', 'Common', 'questions_asked', 10),
('badge-4', '공감의 달인', '❤️', '공감 점수 80점 이상 달성', '대화', 'Rare', 'empathy_score', 80),
('badge-5', '열정적인 대화가', '🔥', '하루에 3번 이상 대화하기', '성장', 'Rare', 'daily_conversations', 3),
('badge-6', '대화왕', '⏰', '50회 대화 달성', '성장', 'Epic', 'total_conversations', 50),
('badge-7', '페르소나 제작자', '✍️', '나만의 페르소나 생성', '특별', 'Rare', 'custom_persona', 1),
('badge-8', '히든 배지', '✨', '특별한 조건을 달성해보세요.', '특별', 'Epic', 'special_condition', 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  rarity = EXCLUDED.rarity,
  requirement_type = EXCLUDED.requirement_type,
  requirement_value = EXCLUDED.requirement_value;

-- 4. PUBLIC USERS (auth.users와 연결)
INSERT INTO public.users (id, name, user_gender, partner_gender, experience, confidence, difficulty, interests, is_tutorial_completed)
VALUES 
('11111111-1111-1111-1111-111111111111'::uuid, '테스트 사용자', 'male', 'female', '1-2번 정도', 3, 2, 
 ARRAY['게임', '영화', '음악', '운동'], true),
 
('22222222-2222-2222-2222-222222222222'::uuid, '테스트 사용자2', 'female', 'male', '몇 번 있어요', 4, 3,
 ARRAY['여행', '요리', '독서', '요가'], true),

('33333333-3333-3333-3333-333333333333'::uuid, '튜토리얼 테스트', 'male', 'female', '전혀 없어요', 2, 1,
 ARRAY['게임', '애니메이션'], false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  user_gender = EXCLUDED.user_gender,
  partner_gender = EXCLUDED.partner_gender,
  experience = EXCLUDED.experience,
  confidence = EXCLUDED.confidence,
  difficulty = EXCLUDED.difficulty,
  interests = EXCLUDED.interests,
  is_tutorial_completed = EXCLUDED.is_tutorial_completed;

-- 5. 성과 데이터
INSERT INTO public.performance_metrics (user_id, week_start, weekly_score, daily_scores, category_scores, total_time_minutes, session_count)
VALUES 
('11111111-1111-1111-1111-111111111111'::uuid, date_trunc('week', CURRENT_DATE)::date, 78, ARRAY[60, 65, 70, 68, 75, 72, 78],
 '{"친근함": 85, "호기심": 92, "공감력": 58, "유머": 60, "배려": 75, "적극성": 70}'::jsonb,
 135, 8),
 
('11111111-1111-1111-1111-111111111111'::uuid, date_trunc('week', CURRENT_DATE - INTERVAL '7 days')::date, 66, ARRAY[55, 58, 60, 62, 65, 63, 66],
 '{"친근함": 77, "호기심": 77, "공감력": 55, "유머": 55, "배려": 67, "적극성": 60}'::jsonb,
 95, 6)
ON CONFLICT (user_id, week_start) DO UPDATE SET
  weekly_score = EXCLUDED.weekly_score,
  daily_scores = EXCLUDED.daily_scores,
  category_scores = EXCLUDED.category_scores,
  total_time_minutes = EXCLUDED.total_time_minutes,
  session_count = EXCLUDED.session_count;

-- 6. 뱃지 획득
INSERT INTO public.user_badges (user_id, badge_id, progress_current, progress_total, featured, acquired_at)
VALUES 
('11111111-1111-1111-1111-111111111111'::uuid, 'badge-1', 7, 7, true, NOW()),
('11111111-1111-1111-1111-111111111111'::uuid, 'badge-2', 1, 1, false, NOW()),
('11111111-1111-1111-1111-111111111111'::uuid, 'badge-3', 10, 10, false, NOW()),
('11111111-1111-1111-1111-111111111111'::uuid, 'badge-4', 80, 80, false, NOW())
ON CONFLICT (user_id, badge_id) DO UPDATE SET
  progress_current = EXCLUDED.progress_current,
  progress_total = EXCLUDED.progress_total,
  featured = EXCLUDED.featured,
  acquired_at = EXCLUDED.acquired_at;

INSERT INTO public.user_badges (user_id, badge_id, progress_current, progress_total, featured)
VALUES
('11111111-1111-1111-1111-111111111111'::uuid, 'badge-5', 1, 3, false),
('11111111-1111-1111-1111-111111111111'::uuid, 'badge-6', 25, 50, false)
ON CONFLICT (user_id, badge_id) DO UPDATE SET
  progress_current = EXCLUDED.progress_current,
  progress_total = EXCLUDED.progress_total,
  featured = EXCLUDED.featured;

-- 7. 즐겨찾기
INSERT INTO public.favorites (user_id, persona_id)
VALUES 
('11111111-1111-1111-1111-111111111111'::uuid, 'persona-1'),
('11111111-1111-1111-1111-111111111111'::uuid, 'persona-3')
ON CONFLICT (user_id, persona_id) DO NOTHING;

-- 8. 대화 기록
INSERT INTO public.conversations (id, user_id, partner_type, partner_id, is_tutorial, status)
VALUES
('conv-1', '11111111-1111-1111-1111-111111111111'::uuid, 'persona', 'persona-1', false, 'completed'),
('conv-2', '11111111-1111-1111-1111-111111111111'::uuid, 'coach', 'coach-1', false, 'completed')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  partner_type = EXCLUDED.partner_type,
  partner_id = EXCLUDED.partner_id,
  is_tutorial = EXCLUDED.is_tutorial,
  status = EXCLUDED.status;

INSERT INTO public.messages (conversation_id, sender_type, content)
VALUES
('conv-1', 'user', '안녕하세요! 처음 뵙겠습니다'),
('conv-1', 'ai', '안녕하세요! 처음 뵙네요 😊'),
('conv-1', 'user', '혹시 게임 좋아하세요?'),
('conv-1', 'ai', '네! 저는 요즘 발로란트에 빠져있어요! RPG랑 어드벤처 게임도 좋아해요. 어떤 게임 좋아하세요?');

INSERT INTO public.conversation_analysis (conversation_id, overall_score, affinity_score, improvements, achievements, tips)
VALUES
('conv-1', 78, 85, 
 ARRAY['더 구체적인 질문하기', '감정 표현 늘리기'],
 ARRAY['자연스러운 인사', '적절한 리액션', '공통 관심사 발견'],
 ARRAY['상대방의 관심사에 대해 더 깊이 물어보세요', '자신의 경험을 공유하면 대화가 풍성해져요'])
ON CONFLICT (conversation_id) DO UPDATE SET
  overall_score = EXCLUDED.overall_score,
  affinity_score = EXCLUDED.affinity_score,
  improvements = EXCLUDED.improvements,
  achievements = EXCLUDED.achievements,
  tips = EXCLUDED.tips;

-- =====================================================
-- 테스트 계정 정보
-- =====================================================
-- Email: test1@example.com / Password: test1234 (남성, 튜토리얼 완료)
-- Email: test2@example.com / Password: test1234 (여성, 튜토리얼 완료)
-- Email: test3@example.com / Password: test1234 (남성, 튜토리얼 미완료)