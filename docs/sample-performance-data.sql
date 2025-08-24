-- Sample Performance Data for Testing
-- 실제 사용자를 위한 샘플 성과 데이터 삽입

-- 1. 대화 분석 데이터 삽입
INSERT INTO public.conversation_analysis (
  conversation_id,
  overall_score,
  affinity_score,
  improvements,
  achievements,
  tips,
  analyzed_at
) VALUES 
  -- 이번 주 데이터
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 75, 80, 
   ARRAY['더 자주 질문하기', '상대방 말에 리액션 보이기'], 
   ARRAY['적극적인 대화 참여', '친근한 어투 사용'], 
   ARRAY['오픈 엔디드 질문을 활용해보세요'], 
   NOW() - INTERVAL '6 days'),
  
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 82, 85, 
   ARRAY['유머 감각 향상'], 
   ARRAY['공감 능력 우수', '대화 리드'], 
   ARRAY['상대방의 취미에 대해 물어보세요'], 
   NOW() - INTERVAL '4 days'),
  
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 88, 90, 
   ARRAY[''], 
   ARRAY['완벽한 대화 흐름', '높은 친밀도 형성'], 
   ARRAY['계속 이대로 하시면 됩니다!'], 
   NOW() - INTERVAL '2 days'),
  
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 92, 95, 
   ARRAY[''], 
   ARRAY['뛰어난 유머 감각', '자연스러운 대화 전환'], 
   ARRAY[''], 
   NOW() - INTERVAL '1 day'),
  
  -- 지난주 데이터 (비교용)
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, 65, 70, 
   ARRAY['대화 시작이 어색함', '주제 전환 필요'], 
   ARRAY['노력하는 모습'], 
   ARRAY['인사말을 더 자연스럽게'], 
   NOW() - INTERVAL '10 days'),
  
  ('550e8400-e29b-41d4-a716-446655440006'::uuid, 70, 72, 
   ARRAY['리액션 부족'], 
   ARRAY['경청 능력 향상'], 
   ARRAY['이모티콘을 적절히 사용해보세요'], 
   NOW() - INTERVAL '8 days');

-- 2. 대화 데이터 삽입 (conversation_analysis와 연결)
INSERT INTO public.conversations (
  id,
  user_id,
  partner_type,
  partner_id,
  started_at,
  ended_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 
   '13397f69-7e09-4c3b-84f0-97e623a11aa6'::uuid, 
   'persona', 'persona_1', 
   NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '25 minutes'),
  
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 
   '13397f69-7e09-4c3b-84f0-97e623a11aa6'::uuid, 
   'persona', 'persona_2', 
   NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '32 minutes'),
  
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 
   '13397f69-7e09-4c3b-84f0-97e623a11aa6'::uuid, 
   'persona', 'persona_3', 
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '28 minutes'),
  
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 
   '13397f69-7e09-4c3b-84f0-97e623a11aa6'::uuid, 
   'coach', 'coach_1', 
   NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '18 minutes'),
  
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, 
   '13397f69-7e09-4c3b-84f0-97e623a11aa6'::uuid, 
   'persona', 'persona_1', 
   NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '15 minutes'),
  
  ('550e8400-e29b-41d4-a716-446655440006'::uuid, 
   '13397f69-7e09-4c3b-84f0-97e623a11aa6'::uuid, 
   'persona', 'persona_2', 
   NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '20 minutes')
ON CONFLICT (id) DO NOTHING;

-- 3. 성과 메트릭 데이터 삽입
INSERT INTO public.performance_metrics (
  user_id,
  week_start,
  weekly_score,
  daily_scores,
  category_scores,
  total_time_minutes,
  session_count
) VALUES 
  -- 이번 주
  ('13397f69-7e09-4c3b-84f0-97e623a11aa6'::uuid,
   date_trunc('week', CURRENT_DATE)::date,
   84,
   ARRAY[75, 0, 82, 0, 88, 92, 0],
   '{"친근함": 85, "호기심": 92, "공감력": 78, "유머": 72, "배려": 80, "적극성": 75}'::jsonb,
   103,
   4),
  
  -- 지난주
  ('13397f69-7e09-4c3b-84f0-97e623a11aa6'::uuid,
   date_trunc('week', CURRENT_DATE - INTERVAL '1 week')::date,
   68,
   ARRAY[0, 65, 0, 70, 0, 0, 0],
   '{"친근함": 70, "호기심": 65, "공감력": 62, "유머": 58, "배려": 72, "적극성": 60}'::jsonb,
   35,
   2)
ON CONFLICT (user_id, week_start) DO UPDATE
SET 
  weekly_score = EXCLUDED.weekly_score,
  daily_scores = EXCLUDED.daily_scores,
  category_scores = EXCLUDED.category_scores,
  total_time_minutes = EXCLUDED.total_time_minutes,
  session_count = EXCLUDED.session_count;

-- 4. 몇 개의 메시지 샘플 추가 (대화 내용)
INSERT INTO public.messages (
  conversation_id,
  sender_type,
  content,
  timestamp
) 
SELECT 
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  CASE WHEN generate_series % 2 = 0 THEN 'user' ELSE 'ai' END,
  CASE 
    WHEN generate_series = 1 THEN '안녕하세요! 오늘 날씨가 좋네요'
    WHEN generate_series = 2 THEN '네 정말 좋아요! 이런 날엔 산책하기 딱이죠'
    WHEN generate_series = 3 THEN '맞아요, 혹시 좋아하는 산책 코스가 있나요?'
    WHEN generate_series = 4 THEN '한강공원을 자주 가요. 특히 저녁 노을이 예쁘거든요'
    ELSE '좋은 대화였어요!'
  END,
  NOW() - INTERVAL '6 days' + (generate_series * INTERVAL '2 minutes')
FROM generate_series(1, 5)
ON CONFLICT DO NOTHING;

COMMIT;