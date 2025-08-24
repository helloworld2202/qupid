-- RLS 상태 확인 스크립트

-- 각 테이블의 RLS 활성화 상태 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('personas', 'coaches', 'badges', 'users', 'conversations')
ORDER BY tablename;

-- personas 테이블의 정책 확인
SELECT 
    polname as policy_name,
    polcmd as command,
    polpermissive as permissive,
    polroles as roles
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'personas';

-- personas 테이블 데이터 수 확인
SELECT COUNT(*) as persona_count FROM public.personas;

-- coaches 테이블 데이터 수 확인
SELECT COUNT(*) as coach_count FROM public.coaches;