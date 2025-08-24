# Qupid 데이터베이스 설정 가이드

## 📋 개요

Qupid 앱의 데이터베이스를 Supabase PostgreSQL로 설정하는 가이드입니다.

## 🚀 빠른 시작

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입/로그인
2. 새 프로젝트 생성
3. 프로젝트 설정에서 다음 정보 확인:
   - Project URL (SUPABASE_URL)
   - Anon public key (SUPABASE_ANON_KEY)
   - Service role key (SUPABASE_SERVICE_ROLE_KEY)

### 2. 환경 변수 설정

`.env` 파일에 다음 추가:

```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 데이터베이스 마이그레이션

#### 옵션 A: SQL 에디터 사용 (권장)

1. Supabase 대시보드 > SQL Editor
2. 다음 순서대로 SQL 파일 실행:
   - `docs/database-schema.sql` - 스키마 생성
   - `docs/fix-rls-policies.sql` - RLS 정책 수정 (개발용)
   - `docs/seed-data.sql` - 시드 데이터 입력 (auth.users 포함)

#### 옵션 B: 스크립트 사용

```bash
# 의존성 설치
pnpm install

# 마이그레이션 실행
pnpm migrate:db
```

## 📊 데이터베이스 구조

### 핵심 테이블

#### 1. **users** - 사용자 프로필
- `id`: UUID (auth.users 참조)
- `name`: 이름
- `user_gender`: 성별
- `interests`: 관심사 배열
- `is_tutorial_completed`: 튜토리얼 완료 여부

#### 2. **personas** - AI 페르소나
- `id`: 고유 ID
- `name`: 이름
- `mbti`: MBTI 타입
- `personality`: 성격
- `bio`: 소개
- `match_rate`: 매칭률

#### 3. **coaches** - AI 코치
- `id`: 고유 ID
- `name`: 이름
- `specialty`: 전문 분야
- `tagline`: 캐치프레이즈
- `expertise_areas`: 전문 영역

#### 4. **conversations** - 대화 세션
- `id`: UUID
- `user_id`: 사용자 ID
- `partner_type`: 'persona' 또는 'coach'
- `partner_id`: 상대방 ID
- `status`: 대화 상태

#### 5. **messages** - 대화 메시지
- `id`: UUID
- `conversation_id`: 대화 ID
- `sender_type`: 'user' 또는 'ai'
- `content`: 메시지 내용

#### 6. **performance_metrics** - 성과 데이터
- `user_id`: 사용자 ID
- `week_start`: 주 시작일
- `weekly_score`: 주간 점수
- `daily_scores`: 일별 점수 배열
- `category_scores`: 카테고리별 점수 (JSON)

#### 7. **badges** - 뱃지 정의
- `id`: 뱃지 ID
- `name`: 뱃지 이름
- `icon`: 이모지 아이콘
- `rarity`: 희귀도

#### 8. **user_badges** - 획득한 뱃지
- `user_id`: 사용자 ID
- `badge_id`: 뱃지 ID
- `acquired_at`: 획득 시간
- `progress_current/total`: 진행도

## 🔒 보안 설정

### Row Level Security (RLS)

모든 테이블에 RLS가 활성화되어 있습니다:

- **users**: 자신의 데이터만 조회/수정 가능
- **conversations/messages**: 자신의 대화만 조회 가능
- **personas/coaches/badges**: 모든 사용자 조회 가능
- **user_badges/favorites**: 자신의 데이터만 조회/수정 가능

### API 키 사용

- **Frontend**: `SUPABASE_ANON_KEY` 사용
- **Backend**: `SUPABASE_SERVICE_ROLE_KEY` 사용

## 🌱 시드 데이터

초기 데이터 포함 내용:

- **8개 페르소나**: 다양한 MBTI와 성격
- **3명 코치**: 공감력, 대화 스킬, 매력 어필 전문
- **10개 뱃지**: Common ~ Legendary 등급
- **테스트 사용자**: 
  - ID: `11111111-1111-1111-1111-111111111111`
  - Email: `test1@example.com`
  - Password: `test1234`

### 데이터베이스 초기화

필요시 데이터를 완전히 초기화:
```sql
-- 1. docs/reset-database.sql 실행 (모든 데이터 삭제)
-- 2. 위의 마이그레이션 단계 재실행
```

## 🛠️ 유용한 SQL 쿼리

### 사용자의 최근 대화 조회

```sql
SELECT c.*, p.name as partner_name
FROM conversations c
LEFT JOIN personas p ON c.partner_id = p.id
WHERE c.user_id = 'user-uuid'
ORDER BY c.started_at DESC
LIMIT 10;
```

### 주간 성과 데이터 조회

```sql
SELECT * FROM performance_metrics
WHERE user_id = 'user-uuid'
  AND week_start = date_trunc('week', CURRENT_DATE)::date;
```

### 인기 페르소나 통계

```sql
SELECT partner_id, COUNT(*) as conversation_count
FROM conversations
WHERE partner_type = 'persona'
GROUP BY partner_id
ORDER BY conversation_count DESC;
```

## 📝 마이그레이션 관리

### 새 마이그레이션 추가

1. `docs/migrations/` 폴더에 날짜별 SQL 파일 생성
2. 예: `2025-08-24-add-new-feature.sql`
3. Supabase SQL Editor에서 실행

### 롤백

각 마이그레이션에 대응하는 롤백 스크립트 작성:
- `2025-08-24-add-new-feature-rollback.sql`

## 🔧 트러블슈팅

### 일반적인 문제

1. **"permission denied for table" 오류**
   - 원인: RLS(Row Level Security)가 활성화되어 있음
   - 해결: 
     - `docs/fix-rls-policies.sql` 실행하여 RLS 비활성화
     - 또는 Supabase 대시보드 > Authentication > Policies에서 직접 수정
   - 참고: Service Role Key를 사용해도 RLS가 활성화되면 접근 제한됨

2. **데이터가 조회되지 않음**
   - 원인: 시드 데이터가 입력되지 않음
   - 해결: `docs/seed-data.sql` 실행 확인
   - 테스트: `curl http://localhost:4000/api/v1/personas`

3. **중복 키 오류**
   - 해결: UNIQUE 제약 조건 확인

4. **권한 오류**
   - 해결: Supabase 대시보드에서 직접 SQL 실행

## 📚 추가 리소스

- [Supabase 문서](https://supabase.com/docs)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)