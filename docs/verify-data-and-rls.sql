-- 데이터 및 RLS 상태 완전 확인

-- 1. 각 테이블의 데이터 수 확인 (RLS 무시)
SELECT 'personas' as table_name, COUNT(*) as count FROM public.personas
UNION ALL
SELECT 'coaches', COUNT(*) FROM public.coaches  
UNION ALL
SELECT 'badges', COUNT(*) FROM public.badges
UNION ALL
SELECT 'users', COUNT(*) FROM public.users;

-- 2. RLS 상태 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('personas', 'coaches', 'badges', 'users')
ORDER BY tablename;

-- 3. 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('personas', 'coaches', 'badges');

-- 4. 샘플 데이터 직접 조회
SELECT id, name FROM public.personas LIMIT 3;
SELECT id, name FROM public.coaches LIMIT 3;