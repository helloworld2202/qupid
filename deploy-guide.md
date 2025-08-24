# Qupid 배포 가이드

## 🚨 중요: CORS 설정 관련 주의사항

**Railway 환경 변수의 `ALLOWED_ORIGINS`에는 반드시 다음 URL들을 포함해야 합니다:**
- Vercel 프리뷰 URL: `https://qupid-[hash]-[username].vercel.app`
- Vercel 프로덕션 URL: `https://qupid.vercel.app` (커스텀 도메인 설정 시)
- 로컬 개발: `http://localhost:5173`

여러 origin을 쉼표(,)로 구분하여 입력하세요.

## 🚀 Quick Start (Vercel + Railway)

### 1. Frontend 배포 (Vercel)

#### 1-1. Vercel 프로젝트 생성
1. [Vercel](https://vercel.com) 가입 및 GitHub 연동
2. "New Project" → GitHub 레포지토리 선택
3. 설정:
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: pnpm build:web
   Output Directory: apps/web/dist
   Install Command: pnpm install
   ```

#### 1-2. Vercel 환경 변수 설정
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. 다음 변수 추가:
   ```
   VITE_API_URL=https://qupid-production.up.railway.app/api/v1
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxxxx
   ```
3. **중요**: Production, Preview, Development 모두 체크하여 모든 환경에 적용

#### 1-3. Vercel Token 생성 (CI/CD용)
1. [Vercel Dashboard](https://vercel.com/account/tokens) → "Create Token"
2. Token 이름 입력 (예: "GitHub Actions")
3. Scope: "Full Account" 선택
4. 생성된 토큰 복사 (한 번만 표시됨!)

#### 1-4. Vercel Project ID 확인
1. Vercel Dashboard → Your Project → Settings → General
2. 다음 정보 복사:
   - **Project ID**: `prj_xxxxx`
   - **Org ID**: `team_xxxxx` 또는 개인 계정 ID

### 2. Backend 배포 (Railway)

#### 2-1. Railway 프로젝트 생성
1. [Railway](https://railway.app) 가입 (GitHub 로그인 추천)
2. "New Project" → "Deploy from GitHub repo"
3. 레포지토리 선택 및 권한 부여
4. **중요**: 서비스 이름을 "qupid"로 설정 (모노레포 구조이므로 필수)

#### 2-2. Railway 환경 변수 설정
1. Railway Dashboard → Your Project → Variables
2. "Add Variable" 클릭하여 추가:
   ```
   PORT=4000
   NODE_ENV=production
   OPENAI_API_KEY=sk-xxxxx
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJxxxxx
   SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
   ALLOWED_ORIGINS=https://qupid-805i54i0x-daseul22s-projects.vercel.app,https://qupid.vercel.app,http://localhost:5173
   ```

#### 2-3. Railway Token 생성 (CI/CD용)
1. [Railway Dashboard](https://railway.app/account/tokens) → "Create Token"
2. Token 이름 입력 (예: "GitHub Actions")
3. 생성된 토큰 복사

#### 2-4. Railway 배포 URL 확인
1. 배포 완료 후 Railway Dashboard → Settings → Domains
2. 생성된 URL 복사 (예: `qupid-api.up.railway.app`)
3. 이 URL을 Vercel의 `VITE_API_URL`에 업데이트

### 3. 데이터베이스 (Supabase)

이미 설정되어 있음 - 환경 변수만 확인

---

## 🔄 GitHub Actions 자동 배포 설정

### 1. GitHub Secrets 설정

#### 1-1. GitHub Repository로 이동
1. Your Repository → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭

#### 1-2. 필요한 Secrets 추가

**Vercel 관련:**
```
VERCEL_TOKEN=xxx          # Vercel에서 생성한 토큰
VERCEL_ORG_ID=xxx         # Vercel 프로젝트 설정에서 확인
VERCEL_PROJECT_ID=xxx     # Vercel 프로젝트 설정에서 확인
```

**Railway 관련:**
```
RAILWAY_TOKEN=xxx         # Railway에서 생성한 토큰
```

**환경 변수:**
```
VITE_SUPABASE_URL=xxx
VITE_SUPABASE_ANON_KEY=xxx
VITE_API_URL=xxx          # Railway 배포 후 받은 URL
```

### 2. 자동 배포 활성화

#### 2-1. GitHub Actions 확인
1. Repository → Actions 탭
2. `.github/workflows/deploy.yml` 워크플로우 확인
3. 초록색 체크 표시가 나타나면 성공

#### 2-2. 배포 트리거
- **자동**: `main` 브랜치에 push 시
- **수동**: Actions 탭 → Deploy to Production → Run workflow

### 3. 배포 상태 모니터링

#### 3-1. GitHub Actions에서 확인
- Actions 탭에서 실시간 로그 확인
- 각 단계별 성공/실패 여부 확인

#### 3-2. 각 플랫폼에서 확인
- **Vercel**: Dashboard → Deployments
- **Railway**: Dashboard → Deployments

---

## 🔧 대체 옵션

### Option A: Netlify + Fly.io

**Frontend (Netlify):**
```bash
# netlify.toml
[build]
  command = "pnpm build:web"
  publish = "apps/web/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Backend (Fly.io):**
```bash
# fly.toml 생성
fly launch --dockerfile apps/api/Dockerfile
fly secrets set OPENAI_API_KEY=xxx
fly deploy
```

### Option B: AWS 전체 스택

**필요 서비스:**
- S3 + CloudFront (Frontend)
- EC2/ECS (Backend)
- RDS/Aurora (Database)
- Route53 (DNS)

**장점:** 완전한 제어, 엔터프라이즈 규모
**단점:** 복잡도 높음, 비용 관리 필요

---

## 📝 배포 체크리스트

### 배포 전

- [ ] 환경 변수 모두 설정
- [ ] `.env.production` 파일 생성
- [ ] CORS 설정 확인 (ALLOWED_ORIGINS)
- [ ] 빌드 테스트 (`pnpm build`)

### 배포 후

- [ ] 헬스체크 엔드포인트 확인
- [ ] 로그 모니터링 설정
- [ ] SSL 인증서 확인
- [ ] 도메인 연결 (선택사항)

---

## 🔐 보안 체크리스트

1. **환경 변수**

   - 절대 코드에 하드코딩 금지
   - `.env` 파일은 `.gitignore`에 포함

2. **API 보안**

   - Rate limiting 활성화
   - CORS 정확히 설정
   - Helmet.js 미들웨어 사용 중

3. **Supabase RLS**
   - Row Level Security 정책 확인
   - Service Role Key는 백엔드에만

---

## 💰 비용 예상

### 기본 운영 비용

- **Vercel**: 무료 (100GB 대역폭/월)
- **Railway**: 월 $5~ (사용량 기반 과금)
- **Supabase**: 무료 (500MB DB, 50,000 MAU)
- **총 예상 비용**: 월 $5~10

### 유료 플랜 업그레이드 시점

- 월 사용자 1만명 이상
- API 호출 100만건/월 이상
- 스토리지 1GB 이상
- 동시 접속자 100명 이상

---

## 🛠 트러블슈팅

### 1. CORS 오류

**증상**: "Access to fetch at ... has been blocked by CORS policy"

**해결**:
```javascript
// apps/api/src/server.ts
const allowedOrigins = [
  process.env.ALLOWED_ORIGINS,
  "http://localhost:5173" // 개발용
].filter(Boolean)
```

### 2. 환경 변수 못 읽음

**증상**: `undefined` 값으로 API 호출 실패

**해결**:
- Vercel: Project Settings → Environment Variables → 재배포
- Railway: Variables 탭 → Raw Editor로 한번에 추가
- GitHub Actions: Secrets 정확히 설정됐는지 확인

### 3. SSE 연결 끊김

**증상**: 채팅 중 연결이 자주 끊김

**해결**:
- Railway는 SSE 완벽 지원
- Nginx 사용 시: `proxy_buffering off;` 설정
- Timeout 30초 이상으로 설정

### 4. GitHub Actions 실패

**증상**: Actions 탭에 빨간색 X 표시

**해결**:
1. Actions 로그 확인
2. Secrets 모두 설정됐는지 확인
3. pnpm 버전 확인 (10.15.0)
4. 수동으로 재실행: "Re-run all jobs"

### 5. Railway 빌드 실패

**증상**: "Build failed" 메시지

**해결**:
1. Dockerfile 경로 확인
2. 환경 변수 모두 설정됐는지 확인
3. Railway 로그 확인
4. 로컬에서 Docker 빌드 테스트:
   ```bash
   docker build -f apps/api/Dockerfile .
   ```

### 6. Railway "Multiple services found" 에러

**증상**: CLI에서 "Multiple services found. Please specify a service via the `--service` flag"

**해결**:
1. Railway Dashboard에서 서비스 이름을 "qupid"로 설정
2. CLI 명령에 `--service qupid` 추가:
   ```bash
   railway up --service qupid
   ```
3. GitHub Actions에서도 동일하게 적용 (이미 수정됨)

---

## 📞 지원

문제 발생 시:

1. 각 플랫폼 문서 확인
2. GitHub Issues에 문의
3. 커뮤니티 Discord/Slack 활용
