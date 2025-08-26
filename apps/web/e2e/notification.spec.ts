import { test, expect } from '@playwright/test';

test.describe('Notification System', () => {
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

  test('should show notification bell', async ({ page }) => {
    // 알림 벨 아이콘 확인
    await expect(page.locator('[data-testid="notification-bell"]')).toBeVisible();
  });

  test('should open notification dropdown', async ({ page }) => {
    // 알림 벨 클릭
    await page.click('[data-testid="notification-bell"]');
    
    // 알림 드롭다운 확인
    await expect(page.locator('text=알림')).toBeVisible();
    
    // 알림이 없을 때 메시지
    await expect(page.locator('text=새로운 알림이 없습니다')).toBeVisible();
  });

  test('should show notification count badge', async ({ page }) => {
    // 테스트 알림 생성 (API 호출 모킹 필요)
    await page.evaluate(() => {
      // localStorage를 사용하여 알림 시뮬레이션
      localStorage.setItem('mockNotifications', JSON.stringify([
        { id: '1', title: '연습 시간!', message: '오늘도 연습해볼까요?', isRead: false },
        { id: '2', title: '새로운 성과!', message: '첫 대화를 완료했어요!', isRead: false }
      ]));
    });
    
    // 페이지 새로고침
    await page.reload();
    
    // 알림 개수 뱃지 확인
    const badge = page.locator('[data-testid="notification-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('2');
  });

  test('should mark notification as read', async ({ page }) => {
    // 테스트 알림 생성
    await page.evaluate(() => {
      localStorage.setItem('mockNotifications', JSON.stringify([
        { id: '1', title: '연습 시간!', message: '오늘도 연습해볼까요?', isRead: false }
      ]));
    });
    
    await page.reload();
    
    // 알림 벨 클릭
    await page.click('[data-testid="notification-bell"]');
    
    // 알림 항목 클릭
    await page.click('text=연습 시간!');
    
    // 읽음 처리 확인 (배경색 변경)
    const notification = page.locator('text=연습 시간!').locator('..');
    await expect(notification).not.toHaveClass(/bg-pink-50/);
  });

  test('should mark all as read', async ({ page }) => {
    // 테스트 알림 생성
    await page.evaluate(() => {
      localStorage.setItem('mockNotifications', JSON.stringify([
        { id: '1', title: '알림 1', message: '메시지 1', isRead: false },
        { id: '2', title: '알림 2', message: '메시지 2', isRead: false },
        { id: '3', title: '알림 3', message: '메시지 3', isRead: false }
      ]));
    });
    
    await page.reload();
    
    // 알림 벨 클릭
    await page.click('[data-testid="notification-bell"]');
    
    // 모두 읽음 버튼 클릭
    await page.click('text=모두 읽음');
    
    // 알림 뱃지가 사라졌는지 확인
    await expect(page.locator('[data-testid="notification-badge"]')).not.toBeVisible();
  });

  test('should navigate to notification settings', async ({ page }) => {
    // MY 탭으로 이동
    await page.click('[data-testid="tab-my"]');
    
    // 알림 설정 클릭
    await page.click('text=알림 설정');
    
    // 알림 설정 화면 확인
    await expect(page.locator('text=알림 설정')).toBeVisible();
    await expect(page.locator('text=연습 알림')).toBeVisible();
    await expect(page.locator('text=성과 알림')).toBeVisible();
    await expect(page.locator('text=코칭 팁')).toBeVisible();
    await expect(page.locator('text=시스템 알림')).toBeVisible();
  });

  test('should toggle notification settings', async ({ page }) => {
    // MY 탭으로 이동
    await page.click('[data-testid="tab-my"]');
    
    // 알림 설정으로 이동
    await page.click('text=알림 설정');
    
    // 연습 알림 토글
    const practiceToggle = page.locator('[data-testid="practice-reminder-toggle"]');
    await practiceToggle.click();
    
    // 토글 상태 확인
    await expect(practiceToggle).toHaveAttribute('aria-checked', 'false');
    
    // 다시 토글
    await practiceToggle.click();
    await expect(practiceToggle).toHaveAttribute('aria-checked', 'true');
  });

  test('should show achievement notification after completing chat', async ({ page }) => {
    // 채팅 화면으로 이동
    await page.click('[data-testid="persona-card-0"]');
    await page.click('text=대화 시작');
    
    // 메시지 보내기
    const messageInput = page.locator('input[placeholder*="메시지"]');
    
    for (let i = 0; i < 5; i++) {
      await messageInput.fill(`안녕하세요 ${i + 1}`);
      await messageInput.press('Enter');
      await page.waitForTimeout(1000);
    }
    
    // 대화 종료
    await page.click('[data-testid="back-button"]');
    
    // 분석 화면에서 확인 클릭
    await page.click('text=확인');
    
    // 알림 벨에 새로운 알림 표시
    await expect(page.locator('[data-testid="notification-badge"]')).toBeVisible();
    
    // 알림 확인
    await page.click('[data-testid="notification-bell"]');
    await expect(page.locator('text=대화를 완료했어요')).toBeVisible();
  });
});