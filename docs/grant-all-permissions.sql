-- 모든 권한 부여 스크립트

-- 1. 모든 역할에 대해 스키마 사용 권한 부여
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. 모든 테이블에 대한 모든 권한 부여
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 3. 기본 권한 설정
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

-- 4. 특정 테이블에 대한 명시적 권한 부여
GRANT ALL ON public.personas TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.coaches TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.badges TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.conversations TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.messages TO postgres, anon, authenticated, service_role;

-- 5. RLS 완전 비활성화 재확인
ALTER TABLE public.personas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- 6. 권한 확인
SELECT 
    tablename,
    tableowner,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'SELECT') as can_select,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'INSERT') as can_insert,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'UPDATE') as can_update,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'DELETE') as can_delete
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('personas', 'coaches', 'badges', 'users');

-- 7. 데이터 확인
SELECT 'personas' as table_name, COUNT(*) as count FROM public.personas
UNION ALL
SELECT 'coaches', COUNT(*) FROM public.coaches
UNION ALL
SELECT 'badges', COUNT(*) FROM public.badges;