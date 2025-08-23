# Qupid - AI 연애 코칭 앱

AI 페르소나와의 대화 연습을 통해 연애 스킬을 향상시키는 풀스택 애플리케이션입니다.

## 🏗️ 프로젝트 구조

모노레포 구조로 구성된 풀스택 애플리케이션:

```
qupid/
├── apps/
│   ├── web/       # React 프론트엔드
│   └── api/       # Express 백엔드 서버
├── packages/
│   ├── core/      # 공용 타입 및 상수
│   ├── ui/        # 공용 UI 컴포넌트
│   └── config/    # 공용 설정 파일
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- pnpm 10.15+

### 설치

```bash
# 의존성 설치
pnpm install
```

### 환경 설정

1. 루트 디렉토리에 `.env.local` 파일 생성:

```env
# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# Supabase
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Server
NODE_ENV=development
PORT=4000
ALLOWED_ORIGINS=http://localhost:5173
```

2. `apps/web/.env.local` 파일 생성:

```env
VITE_API_URL=http://localhost:4000/api/v1
```

### 개발 서버 실행

```bash
# 백엔드와 프론트엔드 동시 실행
pnpm dev

# 또는 개별 실행
pnpm dev:api  # 백엔드 (http://localhost:4000)
pnpm dev:web  # 프론트엔드 (http://localhost:5173)
```

## 🛠️ 기술 스택

### 백엔드 (`apps/api`)
- **프레임워크**: Express.js with TypeScript
- **AI 모델**: OpenAI GPT-4o-mini (채팅), DALL-E 3 (이미지 생성)
- **데이터베이스**: Supabase (PostgreSQL)
- **아키텍처**: 레이어드 아키텍처 (Controller → Service → Repository)

### 프론트엔드 (`apps/web`)
- **프레임워크**: React 19 with TypeScript
- **빌드 도구**: Vite
- **스타일링**: Tailwind CSS
- **상태 관리**: 
  - TanStack Query (서버 상태)
  - Zustand (클라이언트 상태)
- **폼 관리**: React Hook Form + Zod

### 공통
- **패키지 매니저**: pnpm workspaces
- **타입 시스템**: TypeScript (strict mode)
- **코드 품질**: ESLint, Prettier

## 📁 주요 디렉토리 구조

### 백엔드 (`apps/api/src`)
```
modules/
├── chat/         # 채팅 기능
├── styling/      # 스타일링 조언
└── shared/       # 공용 모듈 (middleware, errors, config)
```

### 프론트엔드 (`apps/web/src`)
```
features/
├── chat/         # 채팅 기능
├── onboarding/   # 온보딩
├── profile/      # 프로필 관리
├── coaching/     # 코칭 기능
└── analytics/    # 분석 기능
shared/
├── components/   # 공용 컴포넌트
├── stores/       # Zustand 스토어
└── api/          # API 클라이언트
```

## 🔌 API 엔드포인트

### Chat API
- `POST /api/v1/chat/sessions` - 채팅 세션 생성
- `POST /api/v1/chat/sessions/:id/messages` - 메시지 전송
- `GET /api/v1/chat/sessions/:id` - 세션 정보 조회
- `POST /api/v1/chat/analyze` - 대화 분석
- `POST /api/v1/chat/feedback` - 실시간 피드백
- `POST /api/v1/chat/coach-suggestion` - 코칭 제안

### Styling API
- `POST /api/v1/styling/advice` - 스타일링 조언 및 이미지 생성

## 📝 스크립트

```bash
# 개발
pnpm dev          # 전체 개발 서버 실행
pnpm dev:web      # 웹 개발 서버만
pnpm dev:api      # API 서버만

# 빌드
pnpm build        # 전체 빌드
pnpm build:web    # 웹 빌드
pnpm build:api    # API 빌드

# 기타
pnpm typecheck    # TypeScript 타입 체크
pnpm lint         # ESLint 실행
pnpm clean        # 빌드 파일 및 node_modules 삭제
```

## 🏛️ 아키텍처 원칙

1. **레이어드 아키텍처**: Controller → Service → Repository 패턴
2. **Feature-First 구조**: 기능별로 모듈 구성
3. **타입 우선**: TypeScript strict mode + Zod 런타임 검증
4. **의존성 주입**: Constructor injection 패턴
5. **표준 에러 처리**: AppError 클래스로 에러 통합 관리

## 📄 라이선스

Private

## 🤝 기여

내부 프로젝트로 외부 기여는 받지 않습니다.

---

Built with ❤️ using React, TypeScript, and OpenAI