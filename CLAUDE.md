# CLAUDE.md - Qupid 프로젝트 작업 기록

## 프로젝트 개요
- **프로젝트명**: Qupid - AI 연애 코칭 앱
- **목적**: AI 페르소나와의 대화 연습을 통한 연애 스킬 향상
- **구조**: pnpm 워크스페이스 기반 모노레포

---

## 작업 기록

### 2024-12-23 - 대규모 리팩토링 완료

#### 1. AI 모델 마이그레이션
- **날짜**: 2024-12-23 15:30
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
- **날짜**: 2024-12-23 15:34
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
- **날짜**: 2024-12-23 15:58
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
- **날짜**: 2024-12-23 16:00
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
- **날짜**: 2024-12-23 16:10
- **문제/요구사항**: 빌드 및 개발 환경 최적화
- **해결/구현**:
  - concurrently를 통한 동시 실행
  - TypeScript 빌드 파이프라인 구성
  - 환경 변수 체계 정립
- **수정 파일**:
  - `package.json` - 루트 스크립트
  - `README.md` - 전체 문서 업데이트
  - `.env.example` - 환경 변수 템플릿

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

## 다음 작업 추천

1. **타입 에러 해결**: 일부 컴포넌트 props 타입 정리
2. **테스트 추가**: 
   - 단위 테스트 (Vitest)
   - E2E 테스트 (Playwright)
3. **CI/CD 구성**:
   - GitHub Actions
   - Docker 컨테이너화
4. **성능 최적화**:
   - 번들 사이즈 분석
   - 코드 스플리팅
5. **보안 강화**:
   - Rate limiting 세부 조정
   - API 키 관리 개선

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

*마지막 업데이트: 2024-12-23 16:15*