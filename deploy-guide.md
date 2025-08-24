# Qupid 배포 가이드

## 🚀 Quick Start (Vercel + Railway)

### 1. Frontend 배포 (Vercel)

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
4. 환경 변수 추가:
   ```
   VITE_API_URL=https://your-api.railway.app
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 2. Backend 배포 (Railway)

1. [Railway](https://railway.app) 가입
2. "New Project" → "Deploy from GitHub repo"
3. 환경 변수 설정:
   ```
   PORT=4000
   NODE_ENV=production
   OPENAI_API_KEY=your-key
   SUPABASE_URL=your-url
   SUPABASE_ANON_KEY=your-key
   SUPABASE_SERVICE_ROLE_KEY=your-key
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
4. 배포 시작

### 3. 데이터베이스 (Supabase)

이미 설정되어 있음 - 환경 변수만 확인

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

### 무료 티어

- **Vercel**: 100GB 대역폭/월
- **Railway**: $5 크레딧/월
- **Supabase**: 500MB DB, 50,000 MAU

### 유료 전환 시점

- 월 사용자 1만명 이상
- API 호출 100만건/월 이상
- 스토리지 1GB 이상

---

## 🛠 트러블슈팅

### 1. CORS 오류

```javascript
// apps/api/src/server.ts
const allowedOrigins = [
  process.env.ALLOWED_ORIGINS,
  "http://localhost:5173" // 개발용
].filter(Boolean)
```

### 2. 환경 변수 못 읽음

- Vercel: Project Settings → Environment Variables
- Railway: Variables 탭에서 추가

### 3. SSE 연결 끊김

- Railway는 SSE 지원함
- Timeout 설정 확인 (30초 이상)

---

## 📞 지원

문제 발생 시:

1. 각 플랫폼 문서 확인
2. GitHub Issues에 문의
3. 커뮤니티 Discord/Slack 활용
