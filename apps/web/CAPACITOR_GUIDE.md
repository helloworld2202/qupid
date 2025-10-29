# 📱 Capacitor iOS 앱 출시 가이드

Qupid 앱이 Capacitor로 성공적으로 설정되었습니다! 🎉

## ✅ 완료된 작업

- [x] Capacitor 및 필수 플러그인 설치
- [x] iOS 플랫폼 프로젝트 생성
- [x] API URL 환경 변수 설정
- [x] 빌드 최적화 (코드 스플리팅, 번들 압축)
- [x] 에러 바운더리 추가

## 📁 프로젝트 구조

```
apps/web/
├── capacitor.config.ts      # Capacitor 설정
├── ios/                      # iOS 네이티브 프로젝트 (Xcode)
├── dist/                     # 빌드된 웹 앱
└── src/
    ├── config/api.ts         # API URL 설정 (앱/웹 자동 감지)
    └── ...
```

## 🚀 다음 단계 (Mac에서 진행)

### 1. Xcode 설치
```bash
# App Store에서 Xcode 다운로드 (무료)
# 설치 후 Xcode 실행하여 라이센스 동의
```

### 2. CocoaPods 의존성 설치
```bash
cd apps/web/ios/App
pod install
```

### 3. Xcode로 프로젝트 열기
```bash
cd apps/web
pnpm exec cap open ios
```

### 4. Xcode에서 설정

#### a) 팀 및 서명 설정
1. Xcode에서 프로젝트 선택
2. "Signing & Capabilities" 탭
3. Team: Apple Developer Account 선택
4. Bundle Identifier 확인: `com.qupid.app`

#### b) 앱 정보 설정
1. "General" 탭
2. Display Name: `Qupid`
3. Version: `1.0.0`
4. Build: `1`

#### c) 앱 아이콘 추가 (필수!)
```
apps/web/ios/App/App/Assets.xcassets/AppIcon.appiconset/

필요한 크기:
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 120x120 (iPhone)
- 87x87 (iPhone)
- 80x80 (iPad)
- 60x60 (iPhone)
- 58x58 (iPad)
- 40x40 (iPhone/iPad)
- 29x29 (iPhone/iPad)
- 20x20 (iPhone/iPad)

온라인 도구: https://www.appicon.co (자동 생성)
```

### 5. 시뮬레이터에서 테스트
```bash
# Xcode에서:
1. 상단 바에서 시뮬레이터 선택 (예: iPhone 15 Pro)
2. ▶️ 버튼 클릭 또는 Cmd+R
3. 앱이 시뮬레이터에서 실행됨
```

### 6. 실제 기기에서 테스트
```bash
1. iPhone을 USB로 Mac에 연결
2. Xcode 상단에서 연결된 기기 선택
3. ▶️ 버튼 클릭
4. iPhone에서 "신뢰" 확인
```

## 🌐 API 서버 배포 (필수!)

현재 앱은 `localhost:4000`을 사용하는데, 실제 기기에서는 작동하지 않습니다.

### Railway에 API 배포

```bash
# Railway CLI 설치
npm install -g railway

# Railway 로그인
railway login

# 프로젝트 생성 및 배포
cd apps/api
railway init
railway up

# 배포된 URL 확인 (예: https://qupid-api.railway.app)
railway status
```

### API URL 업데이트
`apps/web/src/config/api.ts` 파일에서:
```typescript
// 실제 Railway URL로 변경
return 'https://qupid-api.railway.app/api/v1';
```

## 📲 App Store 제출

### 1. Apple Developer Account 가입
- https://developer.apple.com
- 비용: $99/년

### 2. App Store Connect 설정
1. https://appstoreconnect.apple.com 접속
2. "My Apps" → "+" → "New App"
3. 앱 정보 입력:
   - Name: Qupid
   - Primary Language: Korean
   - Bundle ID: com.qupid.app
   - SKU: QUPID001

### 3. Archive 및 Upload (Xcode)
```bash
1. Xcode 상단: Product → Destination → Any iOS Device
2. Product → Archive
3. 완료되면 Organizer 창 열림
4. "Distribute App" → "App Store Connect" → "Upload"
5. 인증서 및 프로필 자동 생성 (자동 서명)
6. Upload 완료 (5-10분 소요)
```

### 4. App Store Connect에서 앱 정보 입력

필수 항목:
- [ ] 앱 스크린샷 (5-8장)
  - iPhone 6.9" (1290x2796)
  - iPhone 6.7" (1290x2796)
- [ ] 앱 설명 (한국어)
- [ ] 키워드
- [ ] 개인정보 처리방침 URL
- [ ] 지원 URL
- [ ] 카테고리: Social Networking

### 5. 심사 제출
1. "Submit for Review" 버튼
2. 심사 대기 (보통 1-3일)
3. 승인되면 자동 출시 (또는 수동 출시 선택)

## 🔄 업데이트 방법

### 방법 1: 웹 코드만 변경 (심사 없음)
```bash
# 코드 수정
cd apps/web
pnpm build

# Vercel에 배포
git push

# 끝! 사용자가 앱 열면 자동 업데이트
```

### 방법 2: 네이티브 변경 (심사 필요)
```bash
# 코드 수정
cd apps/web
pnpm build
pnpm exec cap sync

# Xcode에서 버전 업데이트
# Version: 1.0.0 → 1.1.0
# Build: 1 → 2

# Archive → Upload → 심사 제출
```

## 💡 유용한 명령어

```bash
# 웹 앱 빌드
cd apps/web
pnpm build

# iOS 프로젝트 동기화
pnpm exec cap sync ios

# Xcode 열기
pnpm exec cap open ios

# 라이브 리로드 개발 (시뮬레이터)
pnpm exec cap run ios

# 플러그인 업데이트
pnpm exec cap update
```

## 🐛 문제 해결

### "xcode-select: error: tool 'xcodebuild' requires Xcode"
```bash
# Xcode 설치 확인
xcode-select --print-path

# Xcode 경로 설정
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### "pod install failed"
```bash
cd apps/web/ios/App
pod install --repo-update
```

### "Developer Disk Image not found" (실제 기기 테스트)
- Xcode를 최신 버전으로 업데이트
- 또는 iOS 버전을 다운그레이드

### API 연결 오류
1. Railway에 API가 배포되었는지 확인
2. `apps/web/src/config/api.ts`의 URL 확인
3. CORS 설정 확인 (`apps/api/.env`의 ALLOWED_ORIGINS)

## 📚 추가 리소스

- [Capacitor 공식 문서](https://capacitorjs.com/docs)
- [iOS App Store 출시 가이드](https://developer.apple.com/app-store/submissions/)
- [Ionic Appflow (Live Updates)](https://ionic.io/appflow)
- [앱 아이콘 생성 도구](https://www.appicon.co/)

## 🎯 체크리스트

### 출시 전
- [ ] API 서버 Railway에 배포
- [ ] 앱 아이콘 추가 (1024x1024)
- [ ] 스플래시 스크린 이미지
- [ ] 개인정보 처리방침 페이지
- [ ] 실제 기기에서 테스트
- [ ] 모든 기능 작동 확인

### App Store
- [ ] Apple Developer Account ($99/년)
- [ ] 앱 스크린샷 준비
- [ ] 앱 설명 작성
- [ ] 심사 제출
- [ ] 승인 대기

## 🆘 도움이 필요하면

1. Capacitor 커뮤니티: https://ionic.io/community
2. GitHub Issues: https://github.com/ionic-team/capacitor/issues
3. Stack Overflow: [capacitor] 태그

---

**축하합니다!** 🎉
Qupid 앱이 iOS 앱으로 변환되었습니다!

다음 단계는 Mac에서 Xcode를 열고 시뮬레이터에서 테스트하는 것입니다.
