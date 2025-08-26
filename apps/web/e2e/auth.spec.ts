import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should start as guest mode', async ({ page }) => {
    // 게스트 모드로 시작
    await expect(page.locator('text=게스트로 시작하기')).toBeVisible();
    
    // 게스트로 시작 클릭
    await page.click('text=게스트로 시작하기');
    
    // 온보딩 화면으로 이동
    await expect(page.locator('text=큐피드와 함께')).toBeVisible();
  });

  test('should complete onboarding flow', async ({ page }) => {
    // 게스트로 시작
    await page.click('text=게스트로 시작하기');
    
    // 온보딩 단계 1
    await expect(page.locator('text=큐피드와 함께')).toBeVisible();
    await page.click('text=다음');
    
    // 온보딩 단계 2
    await expect(page.locator('text=AI 페르소나와')).toBeVisible();
    await page.click('text=다음');
    
    // 온보딩 단계 3
    await expect(page.locator('text=실시간 피드백')).toBeVisible();
    await page.click('text=시작하기');
    
    // 튜토리얼 화면으로 이동
    await expect(page.locator('text=튜토리얼')).toBeVisible();
  });

  test('should show login/signup modal when accessing protected features', async ({ page }) => {
    // 게스트로 시작
    await page.click('text=게스트로 시작하기');
    
    // 온보딩 건너뛰기
    await page.click('text=시작하기');
    
    // 홈 화면에서 MY 탭 클릭
    await page.click('[data-testid="tab-my"]');
    
    // 프로필 편집 클릭 시 회원가입 유도
    await page.click('text=편집');
    
    // 회원가입 모달 표시 확인
    await expect(page.locator('text=회원가입이 필요합니다')).toBeVisible();
  });

  test('should handle signup flow', async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.click('text=회원가입');
    
    // 이메일 입력
    await page.fill('input[type="email"]', 'test@example.com');
    
    // 비밀번호 입력
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="passwordConfirm"]', 'TestPassword123!');
    
    // 이름 입력
    await page.fill('input[name="name"]', '테스트유저');
    
    // 성별 선택
    await page.click('text=남성');
    
    // 선호 성별 선택
    await page.click('text=여성');
    
    // 관심사 선택
    await page.click('text=영화');
    await page.click('text=음악');
    
    // 회원가입 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 회원가입 성공 후 홈으로 이동
    await page.waitForURL('**/home', { timeout: 10000 });
    await expect(page.locator('text=홈')).toBeVisible();
  });

  test('should handle login flow', async ({ page }) => {
    // 로그인 페이지로 이동
    await page.click('text=로그인');
    
    // 이메일 입력
    await page.fill('input[type="email"]', 'test@example.com');
    
    // 비밀번호 입력
    await page.fill('input[type="password"]', 'TestPassword123!');
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 로그인 성공 후 홈으로 이동
    await page.waitForURL('**/home', { timeout: 10000 });
    await expect(page.locator('text=홈')).toBeVisible();
  });

  test('should handle logout', async ({ page }) => {
    // 먼저 게스트로 시작
    await page.click('text=게스트로 시작하기');
    await page.click('text=시작하기');
    
    // MY 탭으로 이동
    await page.click('[data-testid="tab-my"]');
    
    // 로그아웃 클릭
    await page.click('text=로그아웃');
    
    // 확인 다이얼로그
    await page.click('text=확인');
    
    // 로그인 화면으로 돌아가기
    await expect(page.locator('text=로그인')).toBeVisible();
  });
});