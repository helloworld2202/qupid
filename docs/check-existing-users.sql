-- 기존 auth.users 확인 스크립트

-- 현재 존재하는 테스트 사용자들 확인
SELECT id, email, created_at 
FROM auth.users 
WHERE email IN ('test1@example.com', 'test2@example.com', 'test3@example.com')
ORDER BY email;

-- 전체 사용자 수 확인
SELECT COUNT(*) as total_users FROM auth.users;