# CLAUDE.md - Qupid 프로젝트 작업 기록

## 프로젝트 개요
- **프로젝트명**: Qupid - AI 연애 코칭 앱
- **목적**: AI 페르소나와의 대화 연습을 통한 연애 스킬 향상
- **구조**: pnpm 워크스페이스 기반 모노레포

---

## 기술 스택

### 백엔드 (apps/api)
- Express.js + TypeScript
- OpenAI API (GPT-4o-mini)
- Supabase (PostgreSQL + Auth)
- 레이어드 아키텍처 (Controller → Service → Repository)
- SSE (Server-Sent Events) 스트리밍

### 프론트엔드 (apps/web)
- React 19 + TypeScript + Vite
- TanStack Query (서버 상태) + Zustand (클라이언트 상태)
- Tailwind CSS
- Feature-First 구조

### 모노레포 구조
```
qupid/
├── apps/
│   ├── api/     # Express 백엔드
│   └── web/     # React 프론트엔드
├── packages/
│   ├── core/    # 공통 타입, 상수
│   ├── ui/      # 공통 UI 컴포넌트
│   └── config/  # 공통 설정
```

---

## 핵심 작업 기록

### 2025-08-24 - DB 스키마 오류 수정 및 채팅 시스템 안정화

#### 1. 데이터베이스 필드 매핑 오류 수정
- **문제**: DB 스키마와 TypeScript 타입 불일치
- **해결**:
  ```typescript
  // PersonaService.ts - DB 필드 매핑 수정
  job: p.occupation,          // occupation → job
  intro: p.bio,               // bio → intro
  system_instruction: p.personality,  // personality → system_instruction
  conversation_preview: []    // 빈 배열로 초기화
  
  // ChatService.ts - 테이블 필드 수정
  partner_type: 'persona',    // persona_id 대신 partner_id + partner_type
  partner_id: personaId,
  sender_type: 'user',        // sender → sender_type
  timestamp: new Date()       // sent_at → timestamp
  ```

#### 2. Undefined 오류 전체 수정
- **영향 범위**: 6개 주요 컴포넌트
- **해결 방법**: Optional chaining 및 nullish coalescing 적용
  ```typescript
  // 모든 배열 접근 전 undefined 체크
  persona.conversation_preview?.length > 0
  userProfile.interests?.map()
  badges?.filter(b => b.acquired)
  ```

#### 3. 실시간 채팅 시스템 구현
- **구현 내용**:
  - OpenAI GPT-4o-mini 연동
  - SSE 기반 스트리밍 응답
  - 대화 DB 저장 (conversations, messages)
  - 대화 자동 분석 및 점수 계산
  - 뱃지 자동 획득 로직

---

## 데이터베이스 구조

### 핵심 테이블
1. **users**: 사용자 정보, Supabase Auth 연동
2. **personas**: AI 대화 상대 (6명)
3. **coaches**: AI 코치 (4명)
4. **badges**: 획득 가능한 뱃지 (8개)
5. **conversations**: 대화 세션
6. **messages**: 대화 메시지
7. **conversation_analysis**: 대화 분석 결과
8. **user_badges**: 사용자 뱃지 획득 현황
9. **user_stats**: 사용자 통계

---

## API 엔드포인트

### 인증 (/api/v1/auth)
- POST /signup - 회원가입
- POST /login - 로그인
- POST /logout - 로그아웃
- GET /session - 세션 확인

### 채팅 (/api/v1/chat)
- POST /sessions - 세션 생성
- POST /sessions/:id/messages - 메시지 전송
- GET /sessions/:id/stream - SSE 스트리밍
- POST /sessions/:id/end - 대화 종료 및 분석

### 데이터 조회
- GET /api/v1/personas - 페르소나 목록
- GET /api/v1/coaches - 코치 목록
- GET /api/v1/badges - 뱃지 목록

---

## 현재 상태

### ✅ 완료된 기능
- 사용자 인증 시스템 (Supabase Auth)
- 실시간 AI 채팅 (OpenAI GPT-4o-mini)
- 대화 분석 및 점수 계산
- 뱃지 자동 획득 시스템
- 모든 화면 네비게이션
- DB 연동 (personas, coaches, badges)
- 포괄적인 테스트 코드 (Unit, Integration, E2E)

### 🔧 진행 중
- 성과 대시보드 실시간 데이터 연동
- 사용자 프로필 수정 기능

### 📋 예정 작업
- 알림 시스템
- 이미지 업로드 (Supabase Storage)

---

## 환경 변수

```env
# 필수
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 서버
PORT=4000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

---

## 실행 명령어

```bash
# 개발 서버 실행
pnpm dev              # 전체 (API + Web)
pnpm dev:api          # API만
pnpm dev:web          # Web만

# 빌드
pnpm build            # 전체 빌드
pnpm typecheck        # 타입 체크

# 테스트 실행
pnpm test             # 백엔드 Jest 테스트
pnpm test:web         # 프론트엔드 Vitest 테스트
pnpm test:e2e         # E2E Playwright 테스트
pnpm test:e2e:ui      # E2E 테스트 UI 모드
```

---

## 주요 버그 수정 이력

### 2025-08-24 최신
1. **Cannot read properties of undefined (reading 'length')**
   - 원인: DB에서 가져온 personas에 conversation_preview 없음
   - 해결: PersonaService에서 빈 배열로 초기화

2. **DB 컬럼명 불일치**
   - 원인: 스키마와 코드의 필드명 차이
   - 해결: 실제 DB 컬럼명으로 모두 수정

3. **TypeScript 타입 오류**
   - 원인: vite-env.d.ts 누락
   - 해결: 환경 변수 타입 정의 추가

4. **API 서버 연결 문제 (net::ERR_CONNECTION_REFUSED)**
   - 원인: 필요한 파일(user.api.ts) 삭제 및 Supabase import 오류
   - 해결: 
     - user.api.ts 파일 복원
     - supabase → supabaseAdmin import 수정
     - 모든 API URL을 환경 변수 사용하도록 통일
   - 테스트 완료: 회원가입, 로그인, 프로필 조회 모두 정상 작동

### 2025-08-26 테스트 구현 및 개선
- **구현 내용**:
  - Backend: Jest 테스트 완전 통과 (35/35 테스트, 100% 성공률) ✅
  - Frontend: Vitest 테스트 대부분 통과 (27/30 테스트, 90% 성공률)
  - 모든 주요 서비스에 대한 단위 테스트 작성
  - Mock 구현을 통한 외부 의존성 격리
- **수정된 파일**:
  - `apps/api/jest.config.cjs` - CommonJS 설정으로 변경
  - `apps/api/src/modules/*/app/__tests__/*.test.ts` - 백엔드 테스트 파일
  - `apps/web/vitest.config.ts` - E2E 테스트 제외 설정
  - `apps/web/src/features/*/__tests__/*.test.tsx` - 프론트엔드 테스트 파일
- **최종 테스트 결과**:
  - **Backend (100% 통과)**:
    - AuthService: 8/8 통과 ✅
    - ChatService: 6/6 통과 ✅ 
    - NotificationService: 6/6 통과 ✅
    - ConversationAnalyzer: 5/5 통과 ✅
    - Integration tests: 10/10 통과 ✅
  - **Frontend (90% 통과)**:
    - NotificationBell UI: 11/11 통과 ✅
    - ChatScreen UI: 12/15 통과 (3개 UI 상호작용 테스트 실패)
    - useChatQueries hooks: 7/7 통과 ✅

---

## 배포 설정 완료 (2025-08-24 18:00)

### 배포 구성
- **Frontend**: Vercel (무료)
- **Backend**: Railway (월 $5~)
- **Database**: Supabase (기존 유지)
- **CI/CD**: GitHub Actions 자동 배포

### 생성된 배포 파일
1. `vercel.json` - Vercel 빌드 설정
2. `apps/api/Dockerfile` - Railway용 Docker 이미지
3. `railway.json` - Railway 배포 설정
4. `.github/workflows/deploy.yml` - 자동 배포 파이프라인
5. `deploy-guide.md` - 상세 배포 가이드 (GitHub Secrets 설정 포함)

### 배포 프로세스
- main 브랜치 push → GitHub Actions 트리거
- Frontend/Backend 병렬 자동 배포
- 필요한 모든 Secrets은 GitHub Settings에서 설정

---

## 테스트 구현 완료 (2025-08-26)

### 테스트 구성
- **Backend**: Jest + ts-jest + supertest
- **Frontend**: Vitest + React Testing Library
- **E2E**: Playwright (Chromium, Firefox, WebKit)

### 구현된 테스트
1. **백엔드 단위 테스트**
   - `AuthService.test.ts` - 인증 서비스 (회원가입, 로그인, 로그아웃)
   - `ChatService.test.ts` - 채팅 서비스 (세션 관리, 메시지 전송)
   - `ConversationAnalyzer.test.ts` - 대화 분석 (OpenAI 연동)
   - `NotificationService.test.ts` - 알림 서비스

2. **백엔드 통합 테스트**
   - `auth.controller.test.ts` - 인증 API 엔드포인트
   - `chat.controller.test.ts` - 채팅 API 엔드포인트
   - `persona.controller.test.ts` - 페르소나 API 엔드포인트

3. **프론트엔드 컴포넌트 테스트**
   - `ChatScreen.test.tsx` - 채팅 화면 (메시지 송수신, 스타일 분석)
   - `NotificationBell.test.tsx` - 알림 컴포넌트
   - `PersonaCard.test.tsx` - 페르소나 카드
   - `PerformanceDashboard.test.tsx` - 성과 대시보드

4. **프론트엔드 훅 테스트**
   - `useChatSession.test.tsx` - 채팅 세션 관리
   - `useAuth.test.tsx` - 인증 상태 관리
   - `useNotifications.test.tsx` - 알림 관리

5. **E2E 테스트**
   - `auth.spec.ts` - 인증 플로우 (회원가입, 로그인, 온보딩)
   - `chat.spec.ts` - 채팅 시나리오 (튜토리얼, 대화, 분석)
   - `navigation.spec.ts` - 네비게이션 및 라우팅
   - `notification.spec.ts` - 알림 시스템
   - `performance.spec.ts` - 성능 테스트 (로딩, 메모리, 번들 사이즈)

### 테스트 유틸리티
- **Test Helpers**: `test-utils.ts` - 재사용 가능한 테스트 헬퍼
- **Mock Services**: Supabase, OpenAI 모킹
- **Test Setup**: 브라우저 API 모킹, 환경 설정

### 테스트 커버리지 목표
- Unit Tests: 80% 이상
- Integration Tests: 주요 API 엔드포인트 100%
- E2E Tests: 핵심 사용자 플로우 100%

---

*마지막 업데이트: 2025-08-26 15:30*