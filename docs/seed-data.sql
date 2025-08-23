-- Qupid Seed Data
-- 초기 데이터 시딩 스크립트

-- =====================================================
-- 1. AI PERSONAS (페르소나 데이터)
-- =====================================================

INSERT INTO public.personas (id, name, gender, age, mbti, personality, occupation, bio, interests, avatar, match_rate, difficulty, tags) VALUES
('persona-1', '김소연', 'female', 25, 'ENFJ', '밝고 활발한', '마케팅 매니저', 
 '항상 긍정적인 에너지를 가지고 있어요! 새로운 사람들과 대화하는 걸 좋아하고, 특히 맛집 탐방이나 여행 이야기를 나누는 걸 즐겨요.',
 ARRAY['맛집 탐방', '여행', '요가', '독서'],
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
 85, 'Easy', ARRAY['친근함', '긍정적', '대화 주도']),

('persona-2', '이지은', 'female', 28, 'ISFJ', '차분하고 따뜻한', '초등학교 교사',
 '아이들을 가르치는 일을 하고 있어요. 조용한 카페에서 책 읽는 걸 좋아하고, 주말엔 베이킹을 즐겨해요.',
 ARRAY['독서', '베이킹', '카페 투어', '클래식 음악'],
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
 72, 'Medium', ARRAY['따뜻함', '경청', '공감']),

('persona-3', '박서윤', 'female', 26, 'ENTP', '지적이고 호기심 많은', 'UX 디자이너',
 '디자인과 기술을 사랑하는 디자이너예요. 새로운 아이디어를 생각하고 토론하는 걸 좋아해요.',
 ARRAY['디자인', '스타트업', '테크', '영화'],
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
 78, 'Hard', ARRAY['창의적', '논리적', '도전적']),

('persona-4', '최하늘', 'female', 24, 'ISFP', '감성적이고 예술적인', '일러스트레이터',
 '그림 그리는 걸 좋아하는 프리랜서 일러스트레이터예요. 조용하지만 깊은 대화를 즐겨요.',
 ARRAY['그림', '전시회', '인디음악', '사진'],
 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
 65, 'Medium', ARRAY['예술적', '섬세함', '진솔함']),

('persona-5', '정민지', 'female', 27, 'ESTJ', '자신감 있고 주도적인', '변호사',
 '일에 대한 열정이 넘치는 변호사예요. 운동을 좋아하고 목표 지향적인 성격이에요.',
 ARRAY['피트니스', '와인', '경제', '자기계발'],
 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
 70, 'Hard', ARRAY['리더십', '목표지향', '직설적']),

-- 남성 페르소나 추가
('persona-6', '강준호', 'male', 29, 'INTJ', '분석적이고 전략적인', '소프트웨어 엔지니어',
 '기술과 혁신을 좋아하는 개발자입니다. 복잡한 문제를 해결하는 것을 즐깁니다.',
 ARRAY['프로그래밍', '체스', 'SF소설', '하이킹'],
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
 75, 'Hard', ARRAY['논리적', '전략적', '독립적']),

('persona-7', '이도현', 'male', 26, 'ESFP', '유머러스하고 사교적인', '광고 PD',
 '재미있는 것을 좋아하고 사람들과 어울리는 것을 즐깁니다. 파티의 분위기 메이커예요!',
 ARRAY['파티', '음악', '스포츠', '게임'],
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
 80, 'Easy', ARRAY['유머', '사교적', '즉흥적']),

('persona-8', '박서준', 'male', 31, 'INFP', '로맨틱하고 이상주의적인', '작가',
 '감성적인 글을 쓰는 작가입니다. 깊은 대화와 의미 있는 관계를 추구합니다.',
 ARRAY['문학', '영화', '커피', '여행'],
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
 68, 'Medium', ARRAY['로맨틱', '창의적', '공감능력']);

-- =====================================================
-- 2. AI COACHES (코치 데이터)
-- =====================================================

INSERT INTO public.coaches (id, name, specialty, tagline, bio, avatar, expertise_areas, coaching_style) VALUES
('coach-1', '민서', '공감력', '상대방의 마음을 읽는 공감 전문가',
 '10년간 심리상담사로 일하며 수많은 연애 상담을 진행했어요. 상대방의 감정을 이해하고 공감하는 방법을 알려드릴게요.',
 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
 ARRAY['감정 읽기', '공감 표현', '경청 스킬'],
 '따뜻하고 이해심 많은 상담 스타일'),

('coach-2', '준영', '대화 스킬', '자연스러운 대화를 이끄는 커뮤니케이션 전문가',
 '방송작가 출신으로 스토리텔링과 대화 기술에 전문성을 가지고 있어요. 어색한 침묵 없이 대화를 이어가는 비법을 전수해드려요.',
 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
 ARRAY['대화 시작', '주제 전환', '스토리텔링'],
 '실용적이고 즉시 적용 가능한 팁 제공'),

('coach-3', '하은', '매력 어필', '자신의 매력을 200% 발산하는 방법',
 '이미지 컨설턴트로 활동하며 많은 사람들의 숨겨진 매력을 찾아드렸어요. 당신만의 특별한 매력 포인트를 발견하고 어필하는 방법을 코칭해드려요.',
 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400',
 ARRAY['첫인상 관리', '매력 포인트 발굴', '자신감 향상'],
 '긍정적이고 동기부여가 되는 코칭');

-- =====================================================
-- 3. BADGES (뱃지 정의)
-- =====================================================

INSERT INTO public.badges (id, name, icon, description, category, rarity, requirement_type, requirement_value) VALUES
('badge-1', '대화 초보자', '🌱', '첫 대화 완료', '대화', 'Common', 'conversations', 1),
('badge-2', '대화 중급자', '🌿', '10회 대화 완료', '대화', 'Common', 'conversations', 10),
('badge-3', '대화 마스터', '🌳', '50회 대화 완료', '대화', 'Rare', 'conversations', 50),
('badge-4', '호감도 마스터', '💖', '호감도 80% 달성', '성과', 'Rare', 'affinity_score', 80),
('badge-5', '연속 대화왕', '🔥', '7일 연속 대화', '성장', 'Epic', 'streak_days', 7),
('badge-6', '완벽주의자', '💯', '분석 점수 100점 달성', '성과', 'Epic', 'perfect_score', 100),
('badge-7', '탐험가', '🗺️', '모든 페르소나와 대화', '탐험', 'Legendary', 'all_personas', 1),
('badge-8', '성장왕', '📈', '주간 성장률 50% 이상', '성장', 'Rare', 'weekly_growth', 50),
('badge-9', '인기스타', '⭐', '5명 이상 즐겨찾기', '소셜', 'Common', 'favorites', 5),
('badge-10', '학습왕', '🎓', '모든 코치와 상담 완료', '학습', 'Epic', 'all_coaches', 1);

-- =====================================================
-- 4. 테스트 사용자 (개발용)
-- =====================================================

-- 테스트 사용자는 Supabase Auth를 통해 생성 후 
-- 해당 UUID를 사용하여 users 테이블에 추가
-- 예시:
-- INSERT INTO public.users (id, name, user_gender, partner_gender, experience, confidence, difficulty, interests, is_tutorial_completed)
-- VALUES 
-- ('auth-user-uuid-here', '테스트 사용자', 'male', 'female', '없음', 3, 2, 
--  ARRAY['게임', '영화', '음악'], false);

-- =====================================================
-- 5. 샘플 성과 데이터 (테스트용)
-- =====================================================

-- 테스트 사용자의 성과 데이터
-- INSERT INTO public.performance_metrics (user_id, week_start, weekly_score, daily_scores, category_scores, total_time_minutes, session_count)
-- VALUES 
-- ('auth-user-uuid-here', '2025-08-18', 78, ARRAY[60, 65, 70, 68, 75, 72, 78],
--  '{"친근함": 85, "호기심": 92, "공감력": 58, "유머": 60, "배려": 75, "적극성": 70}'::jsonb,
--  135, 8);

-- =====================================================
-- 6. 기본 설정값
-- =====================================================

-- 모든 사용자에게 기본 알림 설정이 자동으로 생성되도록 하는 함수
CREATE OR REPLACE FUNCTION create_default_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notification_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_user_notification_settings
AFTER INSERT ON public.users
FOR EACH ROW EXECUTE FUNCTION create_default_notification_settings();

-- =====================================================
-- 7. 성과 데이터 자동 생성 함수
-- =====================================================

-- 새로운 주의 성과 데이터를 자동으로 생성
CREATE OR REPLACE FUNCTION create_weekly_performance_metrics()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    current_week_start DATE := date_trunc('week', CURRENT_DATE)::date;
BEGIN
    FOR user_record IN SELECT id FROM public.users
    LOOP
        INSERT INTO public.performance_metrics (user_id, week_start, daily_scores)
        VALUES (user_record.id, current_week_start, ARRAY[0,0,0,0,0,0,0])
        ON CONFLICT (user_id, week_start) DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 매주 월요일에 실행되도록 스케줄링 (Supabase Cron Job으로 설정 필요)
-- SELECT cron.schedule('weekly-performance-metrics', '0 0 * * 1', 'SELECT create_weekly_performance_metrics();');