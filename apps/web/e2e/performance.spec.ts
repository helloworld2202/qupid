import { test, expect } from '@playwright/test';
import { TestUtils } from './helpers/test-utils';

test.describe('Performance Tests', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
    await utils.startAsGuest();
  });

  test('should load home page within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('should render persona list quickly', async ({ page }) => {
    const startTime = Date.now();
    await utils.navigateToTab('home');
    await page.waitForSelector('[data-testid*="persona-card"]');
    const renderTime = Date.now() - startTime;
    
    expect(renderTime).toBeLessThan(1000);
    
    // 모든 페르소나 카드가 렌더링되었는지 확인
    const personaCards = await page.locator('[data-testid*="persona-card"]').count();
    expect(personaCards).toBe(6);
  });

  test('should handle rapid message sending', async ({ page }) => {
    await utils.startChat(0);
    
    // 빠르게 여러 메시지 보내기
    for (let i = 0; i < 5; i++) {
      await utils.sendMessage(`빠른 메시지 ${i + 1}`);
      await page.waitForTimeout(100);
    }
    
    // 모든 메시지가 표시되는지 확인
    for (let i = 0; i < 5; i++) {
      await expect(page.locator(`text=빠른 메시지 ${i + 1}`)).toBeVisible();
    }
  });

  test('should handle multiple tab switches smoothly', async ({ page }) => {
    const tabs = ['home', 'performance', 'coaching', 'my'] as const;
    
    // 빠르게 탭 전환
    for (let i = 0; i < 10; i++) {
      const tab = tabs[i % tabs.length];
      await utils.navigateToTab(tab);
      await page.waitForTimeout(100);
    }
    
    // 마지막 탭이 제대로 표시되는지 확인
    await expect(page.locator('[data-testid="tab-my"]')).toHaveClass(/active/);
  });

  test('should lazy load images efficiently', async ({ page }) => {
    await utils.navigateToTab('home');
    
    // 초기 이미지 로드 확인
    const images = page.locator('img');
    const imageCount = await images.count();
    
    // 이미지가 로드되었는지 확인
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toBeVisible();
      
      // 이미지가 실제로 로드되었는지 확인
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('should handle offline mode gracefully', async ({ page, context }) => {
    // 오프라인 모드로 전환
    await context.setOffline(true);
    
    // 페이지 새로고침 시도
    await page.reload().catch(() => {});
    
    // 오프라인 메시지 표시 확인
    await expect(page.locator('text=인터넷 연결을 확인해주세요')).toBeVisible({ timeout: 10000 });
    
    // 다시 온라인으로
    await context.setOffline(false);
    await page.reload();
    
    // 정상 작동 확인
    await expect(page.locator('text=AI 페르소나')).toBeVisible();
  });

  test('should handle large conversation history', async ({ page }) => {
    // Mock 대량의 대화 데이터
    const mockConversations = Array.from({ length: 100 }, (_, i) => ({
      id: `conv-${i}`,
      messages: [
        { sender: 'user', text: `메시지 ${i}` },
        { sender: 'ai', text: `응답 ${i}` }
      ],
      score: Math.floor(Math.random() * 100)
    }));
    
    await utils.setMockData('conversationHistory', mockConversations);
    
    // 성과 탭으로 이동
    await utils.navigateToTab('performance');
    
    // 대화 히스토리 섹션 확인
    await page.click('text=대화 기록');
    
    // 스크롤 성능 테스트
    const scrollContainer = page.locator('[data-testid="history-container"]');
    await scrollContainer.evaluate(el => {
      el.scrollTop = el.scrollHeight;
    });
    
    // 스크롤 후에도 반응성 유지 확인
    await page.click('text=홈');
    await expect(page.locator('text=AI 페르소나')).toBeVisible({ timeout: 1000 });
  });

  test('should optimize bundle size', async ({ page }) => {
    // 네트워크 탭 모니터링을 통한 번들 사이즈 확인
    const resources: number[] = [];
    
    page.on('response', response => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        const headers = response.headers();
        const size = parseInt(headers['content-length'] || '0');
        resources.push(size);
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 전체 리소스 크기 계산
    const totalSize = resources.reduce((sum, size) => sum + size, 0);
    const totalSizeMB = totalSize / (1024 * 1024);
    
    // 번들 사이즈가 5MB 미만인지 확인
    expect(totalSizeMB).toBeLessThan(5);
  });

  test('should handle memory leaks in long sessions', async ({ page }) => {
    // 긴 세션 시뮬레이션
    for (let i = 0; i < 10; i++) {
      // 채팅 시작
      await utils.startChat(i % 6);
      
      // 메시지 몇 개 보내기
      for (let j = 0; j < 3; j++) {
        await utils.sendMessage(`테스트 메시지 ${j}`);
        await page.waitForTimeout(500);
      }
      
      // 대화 종료
      await utils.endConversation();
      await page.waitForTimeout(500);
      
      // 홈으로 돌아가기
      await page.click('text=확인');
    }
    
    // 메모리 사용량 체크 (Chrome DevTools Protocol)
    const metrics = await page.evaluate(() => {
      return (performance as any).memory;
    });
    
    if (metrics) {
      const usedMemoryMB = metrics.usedJSHeapSize / (1024 * 1024);
      // 메모리 사용량이 200MB 미만인지 확인
      expect(usedMemoryMB).toBeLessThan(200);
    }
  });
});