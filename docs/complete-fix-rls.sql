-- 완전한 RLS 수정 스크립트
-- 개발 환경에서 API 서버가 데이터에 접근할 수 있도록 설정

-- =====================================================
-- 1. 기존 정책 모두 제거
-- =====================================================

-- personas 테이블의 모든 정책 제거
DROP POLICY IF EXISTS "Anyone can view personas" ON public.personas;
DROP POLICY IF EXISTS "Allow public read access to personas" ON public.personas;
DROP POLICY IF EXISTS "Allow all access to personas" ON public.personas;

-- coaches 테이블의 모든 정책 제거
DROP POLICY IF EXISTS "Anyone can view coaches" ON public.coaches;
DROP POLICY IF EXISTS "Allow public read access to coaches" ON public.coaches;
DROP POLICY IF EXISTS "Allow all access to coaches" ON public.coaches;

-- badges 테이블의 모든 정책 제거
DROP POLICY IF EXISTS "Anyone can view badges" ON public.badges;
DROP POLICY IF EXISTS "Allow public read access to badges" ON public.badges;
DROP POLICY IF EXISTS "Allow all access to badges" ON public.badges;

-- =====================================================
-- 2. RLS 완전 비활성화 (개발 환경용)
-- =====================================================

-- 공개 데이터 테이블 RLS 비활성화
ALTER TABLE public.personas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges DISABLE ROW LEVEL SECURITY;

-- 사용자 데이터 테이블도 개발 환경에서는 비활성화
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_analysis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. 상태 확인
-- =====================================================

-- RLS 상태 확인
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- 완료 메시지
-- =====================================================
-- 모든 테이블의 RLS가 비활성화되었습니다.
-- 개발 환경에서 자유롭게 데이터에 접근할 수 있습니다.
-- ⚠️ 주의: 프로덕션 배포 전에 반드시 적절한 RLS 정책을 다시 활성화하세요!