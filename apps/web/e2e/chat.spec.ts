import { test, expect } from '@playwright/test';

test.describe('Chat Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // 게스트 모드로 시작
    await page.goto('/');
    await page.click('text=게스트로 시작하기');
    
    // 온보딩 건너뛰기
    await page.waitForSelector('text=시작하기', { timeout: 5000 });
    await page.click('text=시작하기');
  });

  test('should complete tutorial chat', async ({ page }) => {
    // 튜토리얼 시작
    await expect(page.locator('text=튜토리얼')).toBeVisible();
    
    // 메시지 입력
    const messageInput = page.locator('input[placeholder*="메시지"]');
    await messageInput.fill('안녕하세요!');
    await messageInput.press('Enter');
    
    // 메시지가 표시되는지 확인
    await expect(page.locator('text=안녕하세요!')).toBeVisible();
    
    // AI 응답 대기
    await page.waitForSelector('.ai-message', { timeout: 10000 });
    
    // 실시간 피드백 확인
    await expect(page.locator('text=좋아요!')).toBeVisible({ timeout: 5000 });
    
    // 더 많은 메시지 보내기
    await messageInput.fill('오늘 날씨가 좋네요');
    await messageInput.press('Enter');
    
    await messageInput.fill('주말에 뭐 하실 계획이세요?');
    await messageInput.press('Enter');
    
    // 튜토리얼 완료 버튼 대기
    await page.waitForSelector('text=튜토리얼 완료', { timeout: 15000 });
    await page.click('text=튜토리얼 완료');
    
    // 분석 결과 표시
    await expect(page.locator('text=대화 분석 결과')).toBeVisible();
  });

  test('should start chat with persona', async ({ page }) => {
    // 홈으로 이동 (튜토리얼 건너뛰기)
    await page.click('text=건너뛰기');
    
    // 페르소나 선택
    await page.click('[data-testid="persona-card-0"]');
    
    // 채팅 시작 버튼
    await page.click('text=대화 시작');
    
    // 채팅 화면 확인
    await expect(page.locator('text=온라인')).toBeVisible();
    
    // 메시지 보내기
    const messageInput = page.locator('input[placeholder*="메시지"]');
    await messageInput.fill('안녕하세요! 만나서 반갑습니다.');
    await messageInput.press('Enter');
    
    // 메시지 표시 확인
    await expect(page.locator('text=안녕하세요! 만나서 반갑습니다.')).toBeVisible();
    
    // AI 응답 대기
    await page.waitForSelector('.ai-message', { timeout: 10000 });
  });

  test('should show coach hint', async ({ page }) => {
    // 채팅 화면으로 이동
    await page.click('text=건너뛰기');
    await page.click('[data-testid="persona-card-0"]');
    await page.click('text=대화 시작');
    
    // 몇 개 메시지 보내기
    const messageInput = page.locator('input[placeholder*="메시지"]');
    await messageInput.fill('안녕하세요');
    await messageInput.press('Enter');
    
    await page.waitForSelector('.ai-message', { timeout: 10000 });
    
    // 코치 힌트 버튼 클릭
    await page.click('text=💬 힌트');
    
    // 코치 제안 표시 확인
    await expect(page.locator('text=코치 제안')).toBeVisible();
    
    // 제안 내용 확인
    await expect(page.locator('text=더 구체적인 질문')).toBeVisible({ timeout: 10000 });
  });

  test('should analyze conversation style', async ({ page }) => {
    // 채팅 화면으로 이동
    await page.click('text=건너뛰기');
    await page.click('[data-testid="persona-card-0"]');
    await page.click('text=대화 시작');
    
    // 여러 메시지 보내기 (스타일 분석 버튼이 나타나려면 3개 이상)
    const messageInput = page.locator('input[placeholder*="메시지"]');
    
    for (let i = 0; i < 4; i++) {
      await messageInput.fill(`메시지 ${i + 1}`);
      await messageInput.press('Enter');
      await page.waitForTimeout(1000); // AI 응답 대기
    }
    
    // 스타일 분석 버튼 확인
    await expect(page.locator('text=💡 스타일 분석')).toBeVisible();
    
    // 스타일 분석 버튼 클릭
    await page.click('text=💡 스타일 분석');
    
    // 분석 모달 확인
    await expect(page.locator('text=대화 스타일 분석')).toBeVisible();
    await expect(page.locator('text=당신의 대화 스타일')).toBeVisible();
  });

  test('should end conversation and show analysis', async ({ page }) => {
    // 채팅 화면으로 이동
    await page.click('text=건너뛰기');
    await page.click('[data-testid="persona-card-0"]');
    await page.click('text=대화 시작');
    
    // 메시지 몇 개 보내기
    const messageInput = page.locator('input[placeholder*="메시지"]');
    
    await messageInput.fill('안녕하세요!');
    await messageInput.press('Enter');
    await page.waitForTimeout(2000);
    
    await messageInput.fill('오늘 뭐 하셨어요?');
    await messageInput.press('Enter');
    await page.waitForTimeout(2000);
    
    // 뒤로 버튼 클릭 (대화 종료)
    await page.click('[data-testid="back-button"]');
    
    // 분석 결과 표시
    await expect(page.locator('text=대화 분석')).toBeVisible();
    
    // 점수 표시
    await expect(page.locator('text=전체 점수')).toBeVisible();
    await expect(page.locator('text=친근함')).toBeVisible();
    await expect(page.locator('text=호기심')).toBeVisible();
    await expect(page.locator('text=공감력')).toBeVisible();
  });
});