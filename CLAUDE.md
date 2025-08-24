# CLAUDE.md - Qupid 프로젝트 작업 기록

## 프로젝트 개요
- **프로젝트명**: Qupid - AI 연애 코칭 앱
- **목적**: AI 페르소나와의 대화 연습을 통한 연애 스킬 향상
- **구조**: pnpm 워크스페이스 기반 모노레포
- **원본 프로젝트 경로**: `/Users/simdaseul/Downloads/qupid-origin/`
  - 리팩토링 전 원본 코드 백업 위치
  - 문제 발생 시 참고용

---

## 작업 기록

### 2025-08-23 - 대규모 리팩토링 완료

#### 1. AI 모델 마이그레이션
- **날짜**: 2025-08-23 15:30
- **문제/요구사항**: Gemini AI를 OpenAI GPT로 변경
- **해결/구현**: 
  - `services/openaiService.ts` 생성
  - GPT-4o-mini를 기본 모델로 설정
  - DALL-E 3 이미지 생성 통합
  - 기존 프롬프트 로직 100% 유지
- **수정 파일**: 
  - `services/openaiService.ts` - 새로 생성
  - `components/ChatScreen.tsx` - OpenAI 서비스 사용
  - `components/StylingCoach.tsx` - OpenAI 서비스 사용
- **테스트**: API 응답 포맷 동일, 기능 정상 작동

#### 2. 모노레포 구조 전환 (Phase 0)
- **날짜**: 2025-08-23 15:34
- **문제/요구사항**: 프로젝트 확장성을 위한 모노레포 구조 필요
- **해결/구현**:
  - pnpm workspace 설정
  - 디렉토리 구조: `apps/`, `packages/`
  - 공통 패키지 분리 (@qupid/core, @qupid/ui, @qupid/config)
- **수정 파일**:
  - `pnpm-workspace.yaml` - 워크스페이스 설정
  - `packages/core/` - 타입 및 상수 이동
  - `packages/ui/` - Icons 컴포넌트 이동
- **영향범위**: 모든 import 경로 변경 필요

#### 3. 백엔드 리팩토링 (Phase 1)
- **날짜**: 2025-08-23 15:58
- **문제/요구사항**: 가이드라인에 따른 레이어드 아키텍처 적용
- **해결/구현**:
  - Express 서버 구축 (`apps/api`)
  - 모듈 구조: chat, styling, shared
  - Controller → Service → Repository 패턴
  - 표준 에러 처리 (AppError)
- **수정 파일**:
  - `apps/api/src/server.ts` - Express 서버
  - `apps/api/src/modules/chat/` - 채팅 모듈
  - `apps/api/src/shared/` - 공용 모듈
- **API 엔드포인트**: `/api/v1/chat/*`, `/api/v1/styling/*`

#### 4. 프론트엔드 리팩토링 (Phase 2)
- **날짜**: 2025-08-23 16:00
- **문제/요구사항**: Feature-First 구조 적용 및 현대적 상태 관리
- **해결/구현**:
  - 디렉토리 재구성: features/, shared/, app/
  - TanStack Query + Zustand 도입
  - React Hook Form + Zod 통합
  - 25개 컴포넌트 기능별 재분류
- **수정 파일**:
  - `src/features/` - 기능별 컴포넌트 이동
  - `src/shared/stores/` - Zustand 스토어
  - `src/App.tsx` - 새로운 구조 적용
- **상태 관리**: 서버 상태(React Query), 클라이언트 상태(Zustand) 분리

#### 5. 최종 통합 (Phase 3)
- **날짜**: 2025-08-23 16:10
- **문제/요구사항**: 빌드 및 개발 환경 최적화
- **해결/구현**:
  - concurrently를 통한 동시 실행
  - TypeScript 빌드 파이프라인 구성
  - 환경 변수 체계 정립
- **수정 파일**:
  - `package.json` - 루트 스크립트
  - `README.md` - 전체 문서 업데이트
  - `.env.example` - 환경 변수 템플릿

### 2025-08-23 - UI/UX 원본 복원 작업

#### 6. 하드코딩 기반 UI 복원
- **날짜**: 2025-08-23 18:30
- **문제/요구사항**: 리팩토링 후 원본 UI/UX와 동일하게 복원 필요
- **해결/구현**:
  - 모든 화면에 원본과 동일한 하드코딩 데이터 적용
  - 애니메이션 버그 수정 (온보딩 텍스트 유지)
  - 네비게이션 플로우 완벽 복원
  - 동적 뒤로가기 네비게이션 시스템 구현
- **주요 수정사항**:
  1. **온보딩 애니메이션 수정**
     - `tailwind.config.js`: forwards 애니메이션 추가
     - `OnboardingFlow.tsx`: animationFillMode 적용
  2. **튜토리얼 플로우 수정**
     - 튜토리얼 완료 시 홈으로 이동 (분석 화면 스킵)
  3. **뱃지 시스템 복원**
     - Badge 타입 구조 수정 (acquired, rarity, category 추가)
     - 하드코딩된 뱃지 데이터 적용
  4. **Performance 데이터 복원**
     - 모든 화면에 완전한 PerformanceData 구조 적용
     - Chart.js 연동 정상화
  5. **네비게이션 시스템 개선**
     - previousScreen 추적 시스템 구현
     - AICoach vs Persona 구분 로직 추가
     - 동적 뒤로가기 버튼 동작
  6. **코칭 기능 복원**
     - AI 코치 채팅 플로우 구현
     - 코칭 분석 후 올바른 탭 복귀
- **수정 파일**:
  - `src/App.tsx` - 네비게이션 로직 전면 개선
  - `src/shared/components/HomeScreen.tsx` - 하드코딩 데이터
  - `src/features/coaching/components/CoachingTabScreen.tsx` - 코칭 데이터
  - `src/features/analytics/components/PerformanceDetailScreen.tsx` - 성과 데이터
- **테스트 완료**: 모든 화면 전환 및 데이터 표시 정상 작동

### 2025-08-24 - 데이터베이스 연동 작업

#### 7. 데이터베이스 설계 및 초기 설정
- **날짜**: 2025-08-24 10:20
- **문제/요구사항**: 하드코딩 데이터를 실제 데이터베이스로 전환
- **해결/구현**:
  - PostgreSQL 스키마 설계 (9개 테이블)
  - Supabase 연동 및 RLS 정책 설정
  - 시드 데이터 생성 (personas: 6, coaches: 4, badges: 8)
- **수정 파일**:
  - `docs/database-schema.sql` - 전체 DB 스키마
  - `docs/seed-data.sql` - 초기 데이터
  - `docs/grant-all-permissions.sql` - 권한 설정
- **해결된 이슈**: 
  - 레거시 API 키 문제 해결
  - RLS 권한 문제 해결 (grant-all-permissions.sql)

#### 8. API 엔드포인트 구현
- **날짜**: 2025-08-24 14:00
- **문제/요구사항**: 데이터베이스와 연동된 API 엔드포인트 필요
- **해결/구현**:
  - PersonaService, CoachService 구현
  - Badge API 엔드포인트 추가
  - User API 기본 구조 구현
- **수정 파일**:
  - `apps/api/src/modules/persona/` - 페르소나 API
  - `apps/api/src/modules/coaching/` - 코칭 API
  - `apps/api/src/modules/badge/` - 뱃지 API
  - `apps/api/src/modules/user/` - 사용자 API
- **API 엔드포인트**:
  - `/api/v1/personas` - 페르소나 목록
  - `/api/v1/coaches` - 코치 목록
  - `/api/v1/badges` - 뱃지 목록
  - `/api/v1/users/:id/badges` - 사용자 뱃지

#### 9. 프론트엔드 API 통합
- **날짜**: 2025-08-24 15:00
- **문제/요구사항**: 하드코딩 데이터를 실제 API 호출로 전환
- **해결/구현**:
  - React Query 훅 생성 (usePersonas, useCoaches, useBadges)
  - HomeScreen, ChatTabScreen API 연동
  - BadgesScreen 실제 데이터 표시
- **수정 파일**:
  - `apps/web/src/shared/hooks/usePersonas.ts` - 페르소나 훅
  - `apps/web/src/shared/hooks/useCoaches.ts` - 코치 훅
  - `apps/web/src/shared/hooks/useBadges.ts` - 뱃지 훅
  - `apps/web/src/shared/hooks/useUser.ts` - 사용자 훅
- **완료된 통합**:
  - ✅ 페르소나 목록 실시간 조회
  - ✅ 코치 목록 실시간 조회
  - ✅ 뱃지 데이터 연동

#### 10. 사용자 인증 시스템 구현
- **날짜**: 2025-08-24 16:30
- **문제/요구사항**: Supabase Auth 기반 인증 시스템 필요
- **해결/구현**:
  - AuthService 구현 (회원가입, 로그인, 토큰 관리)
  - 로그인/회원가입 화면 구현 (디자인 가이드 준수)
  - 인증 상태에 따른 라우팅 처리
  - 로그아웃 기능 추가
- **수정 파일**:
  - `apps/api/src/modules/auth/` - 인증 모듈
  - `apps/web/src/features/auth/components/LoginScreen.tsx` - 로그인 화면
  - `apps/web/src/features/auth/components/SignupScreen.tsx` - 회원가입 화면
  - `apps/web/src/App.tsx` - 인증 라우팅 추가
- **API 엔드포인트**:
  - `/api/v1/auth/signup` - 회원가입
  - `/api/v1/auth/login` - 로그인
  - `/api/v1/auth/logout` - 로그아웃
  - `/api/v1/auth/session` - 세션 확인

---

## 기술 스택 현황

### 백엔드
- Express.js + TypeScript
- OpenAI API (GPT-4o-mini, DALL-E 3)
- Supabase (PostgreSQL)
- 레이어드 아키텍처

### 프론트엔드
- React 19 + TypeScript
- Vite
- TanStack Query + Zustand
- Tailwind CSS
- Feature-First 구조

### 인프라
- pnpm workspaces (모노레포)
- TypeScript strict mode
- ESLint + Prettier

---

## 환경 변수 요구사항

```env
# 필수 API 키
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 서버 설정
PORT=4000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

---

## 현재 상태 및 완료 사항

### 완료된 작업 (2025-08-24)
✅ **데이터베이스 연동 및 인증 시스템 완료**
- Supabase PostgreSQL 데이터베이스 구축
- 9개 테이블 스키마 설계 및 생성
- 시드 데이터 삽입 (personas: 6, coaches: 4, badges: 8)
- API 엔드포인트 구현 (personas, coaches, badges, auth)
- React Query 훅 생성 및 연동
- Supabase Auth 기반 인증 시스템 구현
- 로그인/회원가입 화면 구현

### 작동 확인된 기능
- ✅ 사용자 인증 (로그인/회원가입/로그아웃)
- ✅ 온보딩 및 튜토리얼 플로우
- ✅ 홈 화면 (실제 페르소나, 뱃지 데이터)
- ✅ 채팅 탭 (실제 페르소나 목록)
- ✅ 코칭 탭 (실제 코치 목록)
- ✅ 뱃지 화면 (실제 뱃지 데이터)
- ✅ 성과 분석 대시보드 (하드코딩)
- ✅ 프로필 및 설정
- ✅ 모든 네비게이션 플로우

### 현재 실행 중인 서비스
- 🟢 API 서버: http://localhost:4000
- 🟢 웹 서버: http://localhost:5173
- 🟢 데이터베이스: Supabase (연결 완료)

## 남은 작업 목록

### 우선순위 높음
1. ~~**사용자 인증 시스템**~~ ✅ 완료 (2025-08-24)
   - ~~Supabase Auth 통합~~
   - ~~로그인/회원가입 화면 구현~~
   - ~~JWT 토큰 관리~~
   - ~~세션 유지 로직~~

2. **실제 채팅 기능 구현**
   - OpenAI API 연동 (GPT-4o-mini)
   - 대화 스트리밍 응답
   - 메시지 저장 (conversations, messages 테이블)
   - 대화 히스토리 조회

3. **대화 분석 및 성과 계산**
   - 대화 후 자동 분석 로직
   - 성과 점수 실시간 계산
   - conversation_analysis 테이블 활용
   - 통계 데이터 집계

### 우선순위 중간
4. **뱃지 획득 로직**
   - 조건별 자동 뱃지 부여
   - user_badges 테이블 연동
   - 획득 알림 시스템

5. **사용자 프로필 완전 연동**
   - 프로필 수정 API
   - 즐겨찾기 기능 (user_favorites)
   - 프로필 이미지 업로드

6. **성과 대시보드 실시간화**
   - Chart.js 실제 데이터 연동
   - 주간/월간 통계 계산
   - 카테고리별 점수 분석

### 우선순위 낮음
7. **이미지 관리**
   - Supabase Storage 연동
   - 프로필/페르소나 이미지 업로드
   - 이미지 최적화

8. **알림 시스템**
   - 실시간 알림 (웹소켓)
   - 푸시 알림 설정
   - 알림 히스토리

9. **테스트 및 최적화**
   - 단위 테스트 작성
   - E2E 테스트
   - 성능 최적화

---

## 주의사항

- **API 키 관리**: 절대 커밋하지 말 것
- **타입 안정성**: strict mode 유지 필수
- **import 경로**: 모노레포 alias 사용 (@qupid/*)
- **상태 관리**: 서버/클라이언트 상태 명확히 분리

---

## 명령어 참고

```bash
# 개발
pnpm dev              # 전체 실행
pnpm dev:api          # API만
pnpm dev:web          # 웹만

# 빌드
pnpm build            # 전체 빌드
pnpm typecheck        # 타입 체크

# 유지보수
pnpm clean            # 클린업
pnpm install:all      # 의존성 재설치
```

---

*마지막 업데이트: 2025-08-24 16:45*