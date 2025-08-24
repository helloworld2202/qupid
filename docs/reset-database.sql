-- Qupid Database Reset Script
-- ⚠️ 경고: 이 스크립트는 모든 데이터를 삭제합니다!
-- 실행 전 반드시 백업하세요.

-- =====================================================
-- 1. 트리거 제거 (외래 키 제약 회피를 위해 먼저 실행)
-- =====================================================

DROP TRIGGER IF EXISTS create_user_notification_settings ON public.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_personas_updated_at ON public.personas;
DROP TRIGGER IF EXISTS update_coaches_updated_at ON public.coaches;
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
DROP TRIGGER IF EXISTS update_performance_metrics_updated_at ON public.performance_metrics;

-- =====================================================
-- 2. 모든 데이터 삭제 (순서 중요: 외래 키 종속성 고려)
-- =====================================================

-- 메시지 및 대화 분석 데이터
TRUNCATE TABLE public.messages CASCADE;
TRUNCATE TABLE public.conversation_analysis CASCADE;
TRUNCATE TABLE public.conversations CASCADE;

-- 사용자 관련 데이터
TRUNCATE TABLE public.user_badges CASCADE;
TRUNCATE TABLE public.favorites CASCADE;
TRUNCATE TABLE public.performance_metrics CASCADE;
TRUNCATE TABLE public.notification_settings CASCADE;

-- 마스터 데이터
TRUNCATE TABLE public.users CASCADE;
TRUNCATE TABLE public.personas CASCADE;
TRUNCATE TABLE public.coaches CASCADE;
TRUNCATE TABLE public.badges CASCADE;

-- =====================================================
-- 3. 시퀀스 리셋 (자동 증가 ID 초기화)
-- =====================================================

-- messages 테이블의 시퀀스 리셋 (id가 serial인 경우)
ALTER SEQUENCE IF EXISTS messages_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS conversation_analysis_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS user_badges_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS favorites_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS performance_metrics_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS notification_settings_id_seq RESTART WITH 1;

-- =====================================================
-- 4. 함수 재생성 (필요한 경우)
-- =====================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 알림 설정 자동 생성 함수
CREATE OR REPLACE FUNCTION create_default_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notification_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 주간 성과 데이터 자동 생성 함수
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

-- =====================================================
-- 5. 트리거 재생성
-- =====================================================

-- users 테이블 트리거
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER create_user_notification_settings
AFTER INSERT ON public.users
FOR EACH ROW EXECUTE FUNCTION create_default_notification_settings();

-- personas 테이블 트리거
CREATE TRIGGER update_personas_updated_at
BEFORE UPDATE ON public.personas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- coaches 테이블 트리거
CREATE TRIGGER update_coaches_updated_at
BEFORE UPDATE ON public.coaches
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- conversations 테이블 트리거
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- performance_metrics 테이블 트리거
CREATE TRIGGER update_performance_metrics_updated_at
BEFORE UPDATE ON public.performance_metrics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. RLS 정책 확인 (필요한 경우 재설정)
-- =====================================================

-- RLS가 활성화되어 있다면 정책도 확인
DO $$
BEGIN
    -- personas 테이블 RLS
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'personas' AND schemaname = 'public') THEN
        ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow public read access to personas" ON public.personas;
        CREATE POLICY "Allow public read access to personas" ON public.personas
            FOR SELECT USING (true);
    END IF;
    
    -- coaches 테이블 RLS
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'coaches' AND schemaname = 'public') THEN
        ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow public read access to coaches" ON public.coaches;
        CREATE POLICY "Allow public read access to coaches" ON public.coaches
            FOR SELECT USING (true);
    END IF;
    
    -- badges 테이블 RLS
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'badges' AND schemaname = 'public') THEN
        ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow public read access to badges" ON public.badges;
        CREATE POLICY "Allow public read access to badges" ON public.badges
            FOR SELECT USING (true);
    END IF;
END $$;

-- =====================================================
-- 완료 메시지
-- =====================================================
-- 데이터베이스 리셋 완료!
-- 이제 seed-data.sql을 실행하여 새로운 데이터를 입력할 수 있습니다.
-- 
-- 실행 순서:
-- 1. reset-database.sql (현재 파일) - 모든 데이터 삭제
-- 2. seed-data.sql - 새로운 테스트 데이터 입력