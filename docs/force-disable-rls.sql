-- RLS 강제 비활성화 및 모든 정책 삭제

-- 1. 모든 정책 삭제
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('personas', 'coaches', 'badges', 'users')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 2. RLS 강제 비활성화
ALTER TABLE public.personas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 3. 권한 부여 (Service Role에게 모든 권한)
GRANT ALL ON public.personas TO service_role;
GRANT ALL ON public.coaches TO service_role;
GRANT ALL ON public.badges TO service_role;
GRANT ALL ON public.users TO service_role;

-- 4. 권한 부여 (authenticated 사용자에게도)
GRANT ALL ON public.personas TO authenticated;
GRANT ALL ON public.coaches TO authenticated;
GRANT ALL ON public.badges TO authenticated;
GRANT ALL ON public.users TO authenticated;

-- 5. 권한 부여 (anon 사용자에게도)
GRANT ALL ON public.personas TO anon;
GRANT ALL ON public.coaches TO anon;
GRANT ALL ON public.badges TO anon;
GRANT ALL ON public.users TO anon;

-- 6. 상태 확인
SELECT 
    tablename,
    rowsecurity as "RLS Status"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('personas', 'coaches', 'badges', 'users');

-- 7. 테스트 쿼리
SELECT COUNT(*) as count, 'personas' as table_name FROM public.personas
UNION ALL
SELECT COUNT(*), 'coaches' FROM public.coaches
UNION ALL
SELECT COUNT(*), 'badges' FROM public.badges;