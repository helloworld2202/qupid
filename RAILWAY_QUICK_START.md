# 🚂 Railway 빠른 시작 가이드 (CLI 없이!)

## 📋 준비물
- GitHub 계정 ✅
- Railway 계정 (GitHub으로 로그인 가능)
- 환경 변수 값들 (아래 참고)

## 🚀 5분 배포 가이드

### 1단계: Railway 계정 생성 (1분)
1. https://railway.app 접속
2. "Login" → "Login with GitHub" 클릭
3. GitHub 권한 승인

### 2단계: 프로젝트 연결 (1분)
1. Railway 대시보드에서 "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. `helloworld2202/qupid` 저장소 선택
   - 저장소가 안 보이면 "Configure GitHub App" 클릭하여 권한 부여
4. 저장소 선택 후 "Deploy Now" 클릭

### 3단계: 환경 변수 설정 (2분)
배포가 시작되면 실패할 겁니다 - 정상입니다! 환경 변수가 없어서입니다.

1. Railway 대시보드 → 방금 만든 프로젝트 클릭
2. "Variables" 탭 클릭
3. "RAW Editor" 버튼 클릭 (한번에 입력 가능)
4. 다음 내용 복사 & 붙여넣기:

```
PORT=4000
NODE_ENV=production
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
ALLOWED_ORIGINS=https://qupid.vercel.app,capacitor://localhost,http://localhost,http://localhost:5173
```

> ⚠️ **중요**: Railway 대시보드에서 실제 값을 입력하세요.
> 실제 키 값은 로컬의 `.env.local` 파일에서 확인할 수 있습니다.

5. 우측 상단 "Deploy" 또는 "Update Variables" 클릭

### 4단계: 배포 완료 대기 (5-10분)
1. "Deployments" 탭에서 진행상황 확인
2. 로그에서 "Build successful" 메시지 확인
3. 완료되면 "Settings" → "Networking" 탭 이동
4. "Generate Domain" 클릭
5. 생성된 URL 복사 (예: `qupid-production.up.railway.app`)

### 5단계: API URL 업데이트 (1분)

**Railway URL을 앱에 반영:**

파일: `apps/web/src/config/api.ts`
```typescript
export const getApiUrl = (): string => {
  if (isCapacitorApp()) {
    // ⬇️ 이 부분을 Railway에서 받은 URL로 변경
    return 'https://qupid-production.up.railway.app/api/v1';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
};
```

저장 후 GitHub에 푸시:
```bash
git add apps/web/src/config/api.ts
git commit -m "Update API URL to Railway production"
git push
```

### 6단계: iOS 앱 다시 빌드 (1분)
```bash
cd apps/web
pnpm build
pnpm exec cap sync ios
```

이제 Xcode에서 시뮬레이터 실행하면 실제 API와 연결됩니다! 🎉

## 🧪 테스트

Railway 배포 확인:
```bash
# 헬스체크
curl https://your-railway-url.up.railway.app/health

# 페르소나 목록 (실제 데이터)
curl https://your-railway-url.up.railway.app/api/v1/personas
```

## 💰 비용

**Railway 무료 플랜**:
- $5 무료 크레딧/월 (신용카드 등록 필요)
- 약 500시간 실행 가능
- 이후 시간당 $0.01

**Hobby 플랜** ($5/월):
- 500시간 무료
- 추가 사용량만 과금
- 대부분의 작은 앱은 $5 안에 해결

## ⚠️ 주의사항

1. **신용카드 필요**: 무료 크레딧 받으려면 카드 등록 필수
2. **자동 재배포**: main 브랜치에 push하면 자동으로 재배포됨
3. **로그 확인**: 문제 발생 시 "Deployments" → 최신 배포 → "View Logs"

## 🔄 업데이트 방법

코드 수정 후:
```bash
git add .
git commit -m "Update feature"
git push
```

Railway가 자동으로 감지하고 재배포합니다!

## 🐛 문제 해결

### "Dockerfile not found" 에러
- railway.json에 경로 지정됨 (apps/api/Dockerfile) ✅
- 문제 없을 것입니다

### 빌드 실패
- "Deployments" → 로그 확인
- 대부분 환경 변수 누락 문제
- Variables 탭에서 모든 변수 확인

### "Cannot connect to database" 에러
- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 확인
- Supabase 대시보드에서 값 재확인

### CORS 에러
- ALLOWED_ORIGINS에 Vercel URL 추가
- 쉼표(,) 구분 확인
- 공백 없어야 함

## 🎯 다음 단계

1. ✅ Railway 배포 완료
2. ⬜ Xcode 시뮬레이터에서 테스트
3. ⬜ 실제 iPhone에서 테스트
4. ⬜ App Store 제출 준비

---

**문제 발생 시**: Railway Discord 커뮤니티 또는 GitHub Issues에 문의하세요!
