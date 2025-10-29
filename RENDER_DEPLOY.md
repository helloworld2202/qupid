# 🚀 Render.com 배포 가이드 (Railway 대체)

## 왜 Render.com?
- ✅ **무료 플랜** 있음 (750시간/월)
- ✅ Railway와 거의 동일한 사용성
- ✅ GitHub 자동 배포
- ✅ PostgreSQL 무료 제공 (이미 Supabase 쓰니 불필요)
- ⚠️ Cold start: 15분 미사용 시 슬립 → 첫 요청 느림 (5-10초)

## 🚀 배포 단계 (5분)

### 1. Render.com 가입
1. https://render.com 접속
2. "Get Started for Free" 클릭
3. GitHub 계정으로 로그인

### 2. 새 Web Service 생성
1. 대시보드에서 "New +" → "Web Service" 클릭
2. GitHub 저장소 연결:
   - "Connect GitHub" 클릭
   - `helloworld2202/qupid` 선택
3. 설정 입력:
   ```
   Name: qupid-api
   Region: Oregon (US West) 또는 Singapore (가까움)
   Branch: main
   Root Directory: (비워둠)
   Runtime: Docker
   ```
4. Build Command: (자동 감지됨 - Dockerfile 사용)
5. Start Command: (자동 감지됨)

### 3. 환경 변수 설정
"Environment" 탭에서 추가:
```
NODE_ENV=production
PORT=4000
OPENAI_API_KEY=sk-proj-...
SUPABASE_URL=https://gscokweepuxwanajecsp.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
ALLOWED_ORIGINS=https://qupid-web.vercel.app,capacitor://localhost,http://localhost
```

### 4. 배포!
- "Create Web Service" 클릭
- 자동으로 빌드 시작 (5-10분 소요)
- 완료되면 URL 생성: `https://qupid-api.onrender.com`

### 5. API URL 업데이트

**`apps/web/src/config/api.ts`** 수정:
```typescript
export const getApiUrl = (): string => {
  if (isCapacitorApp()) {
    return 'https://qupid-api.onrender.com/api/v1'; // ⬅️ 이 부분 수정
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
};
```

### 6. 웹 앱 다시 빌드 & 배포
```bash
cd apps/web
pnpm build
pnpm exec cap sync ios

# Vercel에 자동 배포 (git push 시)
git add .
git commit -m "Update API URL for production"
git push
```

### 7. 테스트
```bash
# API 헬스체크
curl https://qupid-api.onrender.com/health

# 페르소나 목록 조회
curl https://qupid-api.onrender.com/api/v1/personas
```

## 🔄 자동 배포 설정
- main 브랜치에 push하면 자동 배포
- Pull Request 생성 시 프리뷰 환경 자동 생성

## 💰 비용
**무료 플랜**:
- 750시간/월 (31일 계속 실행 가능)
- 512MB RAM
- Cold start 있음 (15분 후 슬립)

**유료 플랜** ($7/월):
- Cold start 없음
- 더 많은 RAM
- 커스텀 도메인

## ⚠️ Cold Start 해결 방법
무료 플랜에서 Cold Start를 방지하려면:

### 옵션 1: Cron Job (외부 서비스)
- UptimeRobot (무료): https://uptimerobot.com
- 5분마다 API 핑 → 슬립 방지

### 옵션 2: GitHub Actions로 Keep-Alive
`.github/workflows/keep-alive.yml` 생성:
```yaml
name: Keep Render Alive
on:
  schedule:
    - cron: '*/14 * * * *' # 14분마다 실행
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: curl https://qupid-api.onrender.com/health
```

### 옵션 3: 유료 플랜 ($7/월)
- Cold start 완전히 제거
- 항상 빠른 응답

## 🆚 Render vs Railway

| 기능 | Render (무료) | Railway (무료) |
|------|---------------|----------------|
| 비용 | $0 | $0 (월 500시간) |
| Cold Start | 있음 (15분) | 없음 |
| 자동 배포 | ✅ | ✅ |
| 설정 난이도 | 쉬움 | 쉬움 |
| 무료 시간 | 750시간/월 | 500시간/월 |

## 📝 다음 단계
1. ✅ Render에 API 배포
2. ✅ API URL 업데이트
3. ✅ iOS 시뮬레이터에서 테스트
4. ⬜ 실제 iPhone에서 테스트
5. ⬜ App Store 제출

---

**문제 발생 시**: Render 대시보드 → Logs 탭에서 에러 확인
