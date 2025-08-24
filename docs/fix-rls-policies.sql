-- RLS 정책 수정 스크립트
-- Service Role Key를 사용하는 백엔드에서도 데이터 접근 가능하도록 설정

-- =====================================================
-- 1. 기존 정책 제거
-- =====================================================

-- personas 테이블 정책 제거
DROP POLICY IF EXISTS "Anyone can view personas" ON public.personas;
DROP POLICY IF EXISTS "Allow public read access to personas" ON public.personas;

-- coaches 테이블 정책 제거
DROP POLICY IF EXISTS "Anyone can view coaches" ON public.coaches;
DROP POLICY IF EXISTS "Allow public read access to coaches" ON public.coaches;

-- badges 테이블 정책 제거
DROP POLICY IF EXISTS "Anyone can view badges" ON public.badges;
DROP POLICY IF EXISTS "Allow public read access to badges" ON public.badges;

-- =====================================================
-- 2. RLS 비활성화 (개발 환경용)
-- =====================================================

-- 개발 중에는 RLS를 비활성화하여 테스트를 용이하게 함
-- 프로덕션에서는 적절한 정책으로 교체 필요

ALTER TABLE public.personas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges DISABLE ROW LEVEL SECURITY;

-- 사용자별 데이터는 RLS 유지
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.conversation_analysis DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.performance_metrics DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_badges DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.learning_goals DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.notification_settings DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. 또는 더 안전한 방법: Service Role 접근 허용 정책
-- =====================================================

-- RLS를 유지하면서 Service Role의 접근을 허용하려면 아래 사용
-- (위의 DISABLE ROW LEVEL SECURITY 대신 사용)

-- -- personas 테이블
-- ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all access to personas" ON public.personas
--     FOR ALL USING (true)
--     WITH CHECK (true);

-- -- coaches 테이블
-- ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all access to coaches" ON public.coaches
--     FOR ALL USING (true)
--     WITH CHECK (true);

-- -- badges 테이블
-- ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all access to badges" ON public.badges
--     FOR ALL USING (true)
--     WITH CHECK (true);

-- =====================================================
-- 완료 메시지
-- =====================================================
-- RLS 정책이 수정되었습니다.
-- 개발 환경에서는 RLS가 비활성화되어 있습니다.
-- 프로덕션 배포 전에 적절한 보안 정책으로 교체하세요.