import { Page } from '@playwright/test';

export class TestUtils {
  constructor(private page: Page) {}

  /**
   * 게스트 모드로 앱 시작 및 온보딩 완료
   */
  async startAsGuest() {
    await this.page.goto('/');
    await this.page.click('text=게스트로 시작하기');
    
    // 온보딩 건너뛰기
    await this.page.waitForSelector('text=시작하기', { timeout: 5000 });
    await this.page.click('text=시작하기');
    
    // 튜토리얼 건너뛰기
    if (await this.page.locator('text=건너뛰기').isVisible()) {
      await this.page.click('text=건너뛰기');
    }
  }

  /**
   * 로그인
   */
  async login(email: string, password: string) {
    await this.page.goto('/');
    await this.page.click('text=로그인');
    
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('**/home', { timeout: 10000 });
  }

  /**
   * 회원가입
   */
  async signup(userData: {
    email: string;
    password: string;
    name: string;
    gender: '남성' | '여성';
    preferredGender: '남성' | '여성';
    interests: string[];
  }) {
    await this.page.goto('/');
    await this.page.click('text=회원가입');
    
    await this.page.fill('input[type="email"]', userData.email);
    await this.page.fill('input[name="password"]', userData.password);
    await this.page.fill('input[name="passwordConfirm"]', userData.password);
    await this.page.fill('input[name="name"]', userData.name);
    
    await this.page.click(`text=${userData.gender}`);
    await this.page.click(`text=${userData.preferredGender}`);
    
    for (const interest of userData.interests) {
      await this.page.click(`text=${interest}`);
    }
    
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('**/home', { timeout: 10000 });
  }

  /**
   * 탭 네비게이션
   */
  async navigateToTab(tabName: 'home' | 'performance' | 'coaching' | 'my') {
    await this.page.click(`[data-testid="tab-${tabName}"]`);
  }

  /**
   * 채팅 시작
   */
  async startChat(personaIndex: number = 0) {
    await this.page.click(`[data-testid="persona-card-${personaIndex}"]`);
    await this.page.click('text=대화 시작');
  }

  /**
   * 메시지 보내기
   */
  async sendMessage(message: string) {
    const messageInput = this.page.locator('input[placeholder*="메시지"]');
    await messageInput.fill(message);
    await messageInput.press('Enter');
  }

  /**
   * AI 응답 대기
   */
  async waitForAIResponse(timeout: number = 10000) {
    await this.page.waitForSelector('.ai-message', { timeout });
  }

  /**
   * 대화 종료
   */
  async endConversation() {
    await this.page.click('[data-testid="back-button"]');
  }

  /**
   * 알림 확인
   */
  async checkNotifications() {
    await this.page.click('[data-testid="notification-bell"]');
  }

  /**
   * Mock 데이터 설정
   */
  async setMockData(key: string, data: any) {
    await this.page.evaluate(({ key, data }) => {
      localStorage.setItem(key, JSON.stringify(data));
    }, { key, data });
  }

  /**
   * LocalStorage 클리어
   */
  async clearLocalStorage() {
    await this.page.evaluate(() => {
      localStorage.clear();
    });
  }

  /**
   * 스크린샷 캡처
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `./e2e/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  /**
   * 네트워크 요청 모킹
   */
  async mockAPIResponse(url: string, response: any) {
    await this.page.route(url, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  /**
   * 페이지 로딩 대기
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 요소 표시 대기
   */
  async waitForElement(selector: string, timeout: number = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * 텍스트 표시 대기
   */
  async waitForText(text: string, timeout: number = 5000) {
    await this.page.waitForSelector(`text=${text}`, { timeout });
  }
}