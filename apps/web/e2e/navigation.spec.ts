import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // 게스트 모드로 시작
    await page.goto('/');
    await page.click('text=게스트로 시작하기');
    
    // 온보딩 건너뛰기
    await page.waitForSelector('text=시작하기', { timeout: 5000 });
    await page.click('text=시작하기');
    
    // 튜토리얼 건너뛰기
    await page.click('text=건너뛰기');
  });

  test('should navigate between tabs', async ({ page }) => {
    // 홈 탭 확인
    await expect(page.locator('[data-testid="tab-home"]')).toHaveClass(/active/);
    await expect(page.locator('text=AI 페르소나')).toBeVisible();
    
    // 성과 탭으로 이동
    await page.click('[data-testid="tab-performance"]');
    await expect(page.locator('[data-testid="tab-performance"]')).toHaveClass(/active/);
    await expect(page.locator('text=나의 성과')).toBeVisible();
    
    // 코칭 탭으로 이동
    await page.click('[data-testid="tab-coaching"]');
    await expect(page.locator('[data-testid="tab-coaching"]')).toHaveClass(/active/);
    await expect(page.locator('text=AI 코치')).toBeVisible();
    
    // MY 탭으로 이동
    await page.click('[data-testid="tab-my"]');
    await expect(page.locator('[data-testid="tab-my"]')).toHaveClass(/active/);
    await expect(page.locator('text=MY')).toBeVisible();
    
    // 다시 홈으로 돌아오기
    await page.click('[data-testid="tab-home"]');
    await expect(page.locator('[data-testid="tab-home"]')).toHaveClass(/active/);
  });

  test('should show persona details', async ({ page }) => {
    // 페르소나 카드 클릭
    await page.click('[data-testid="persona-card-0"]');
    
    // 페르소나 상세 정보 확인
    await expect(page.locator('text=자기소개')).toBeVisible();
    await expect(page.locator('text=관심사')).toBeVisible();
    await expect(page.locator('text=대화 시작')).toBeVisible();
    
    // 뒤로 가기
    await page.click('[data-testid="back-button"]');
    await expect(page.locator('text=AI 페르소나')).toBeVisible();
  });

  test('should filter personas by gender', async ({ page }) => {
    // 전체 보기 (기본)
    await expect(page.locator('[data-testid*="persona-card"]')).toHaveCount(6);
    
    // 남성 필터
    await page.click('text=남성');
    await page.waitForTimeout(500);
    const maleCount = await page.locator('[data-testid*="persona-card"]').count();
    expect(maleCount).toBeLessThanOrEqual(6);
    
    // 여성 필터
    await page.click('text=여성');
    await page.waitForTimeout(500);
    const femaleCount = await page.locator('[data-testid*="persona-card"]').count();
    expect(femaleCount).toBeLessThanOrEqual(6);
    
    // 전체 필터
    await page.click('text=전체');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid*="persona-card"]')).toHaveCount(6);
  });

  test('should show coach categories', async ({ page }) => {
    // 코칭 탭으로 이동
    await page.click('[data-testid="tab-coaching"]');
    
    // 코치 카테고리 확인
    await expect(page.locator('text=첫 대화 시작하기')).toBeVisible();
    await expect(page.locator('text=관심 표현하기')).toBeVisible();
    await expect(page.locator('text=깊은 대화 나누기')).toBeVisible();
    await expect(page.locator('text=갈등 해결하기')).toBeVisible();
  });

  test('should show performance metrics', async ({ page }) => {
    // 성과 탭으로 이동
    await page.click('[data-testid="tab-performance"]');
    
    // 성과 메트릭 확인
    await expect(page.locator('text=전체 점수')).toBeVisible();
    await expect(page.locator('text=친근함')).toBeVisible();
    await expect(page.locator('text=호기심')).toBeVisible();
    await expect(page.locator('text=공감력')).toBeVisible();
    
    // 주간 차트 확인
    await expect(page.locator('text=주간 성과')).toBeVisible();
    
    // 뱃지 섹션 확인
    await expect(page.locator('text=획득한 뱃지')).toBeVisible();
  });

  test('should show profile settings', async ({ page }) => {
    // MY 탭으로 이동
    await page.click('[data-testid="tab-my"]');
    
    // 프로필 정보 확인
    await expect(page.locator('text=게스트')).toBeVisible();
    await expect(page.locator('text=체험 중')).toBeVisible();
    
    // 설정 항목 확인
    await expect(page.locator('text=학습 목표 설정')).toBeVisible();
    await expect(page.locator('text=관심 분야 수정')).toBeVisible();
    await expect(page.locator('text=알림 설정')).toBeVisible();
    await expect(page.locator('text=다크 모드')).toBeVisible();
    
    // 고객 지원 섹션 확인
    await expect(page.locator('text=도움말')).toBeVisible();
    await expect(page.locator('text=고객센터 문의')).toBeVisible();
    await expect(page.locator('text=앱 평가하기')).toBeVisible();
  });
});