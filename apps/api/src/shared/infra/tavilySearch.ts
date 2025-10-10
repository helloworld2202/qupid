/**
 * Tavily AI Search API Integration
 * LLM용으로 최적화된 실시간 검색 API
 */

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

interface TavilySearchResponse {
  results: TavilySearchResult[];
  answer?: string;
}

export class TavilySearchService {
  private apiKey: string;
  private baseUrl = 'https://api.tavily.com';

  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ TAVILY_API_KEY not set. Search functionality will be limited.');
    }
  }

  /**
   * 전문 자료 검색 (코칭용)
   */
  async searchForCoaching(query: string, specialty: string): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackCoachingAdvice(query, specialty);
    }

    try {
      // 전문 분야에 맞는 검색 쿼리 생성
      const enhancedQuery = this.buildCoachingQuery(query, specialty);
      
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          query: enhancedQuery,
          search_depth: 'advanced',
          include_answer: true,
          include_domains: [
            'psychology.org',
            'apa.org',
            'sciencedirect.com',
            'pubmed.ncbi.nlm.nih.gov',
            'scholar.google.com'
          ],
          max_results: 5
        })
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status}`);
      }

      const data = await response.json() as TavilySearchResponse;
      
      return this.formatSearchResults(data, specialty);
    } catch (error) {
      console.error('Tavily search error:', error);
      return this.getFallbackCoachingAdvice(query, specialty);
    }
  }

  /**
   * 코칭 쿼리 생성
   */
  private buildCoachingQuery(userQuery: string, specialty: string): string {
    const specialtyKeywords: Record<string, string> = {
      '첫 만남 코칭': 'first impression psychology communication skills research',
      '깊은 대화 코칭': 'deep conversation emotional intelligence empathy research',
      '갈등 해결 코칭': 'conflict resolution communication psychology research',
      '관계 발전 코칭': 'relationship development attachment theory research'
    };

    const keywords = specialtyKeywords[specialty] || 'communication psychology research';
    return `${userQuery} ${keywords} latest research 2024`;
  }

  /**
   * 검색 결과 포맷팅
   */
  private formatSearchResults(data: TavilySearchResponse, specialty: string): string {
    let formattedResult = '';

    // AI가 생성한 답변이 있으면 사용
    if (data.answer) {
      formattedResult += `📚 최신 연구 기반 조언:\n${data.answer}\n\n`;
    }

    // 주요 출처 추가
    if (data.results && data.results.length > 0) {
      formattedResult += '🔍 참고 자료:\n';
      data.results.slice(0, 3).forEach((result, index) => {
        formattedResult += `${index + 1}. ${result.title}\n`;
        formattedResult += `   ${result.content.substring(0, 150)}...\n\n`;
      });
    }

    return formattedResult;
  }

  /**
   * Fallback 조언 (API 실패 시)
   */
  private getFallbackCoachingAdvice(query: string, specialty: string): string {
    const fallbackAdvice: Record<string, string> = {
      '첫 만남 코칭': `
첫 만남에서 중요한 것은 **진정성**과 **호기심**입니다.

📚 연구 기반 조언:
- 심리학자 Amy Cuddy의 연구에 따르면, 첫인상의 80%는 "신뢰"와 "능력"으로 결정됩니다.
- 개방형 질문을 사용하여 상대방이 자신에 대해 이야기할 기회를 주세요.
- 적극적 경청(Active Listening)을 실천하세요: 눈 맞춤, 고개 끄덕임, 적절한 반응

💡 실천 방법:
1. "어떤 일을 하시나요?"보다 "어떤 일이 가장 보람을 느끼시나요?"
2. 상대방의 답변에서 키워드를 찾아 후속 질문하기
3. 자신의 경험도 적절히 공유하여 공감대 형성
      `,
      '깊은 대화 코칭': `
깊은 대화는 **감정적 연결**과 **취약성 공유**에서 시작됩니다.

📚 연구 기반 조언:
- Brené Brown 박사의 연구: 취약성을 보이는 것이 진정한 연결의 시작
- Gottman Institute: 감정적 반응성(Emotional Responsiveness)이 관계 만족도의 핵심
- 공감적 소통(Empathic Communication)이 관계 깊이를 결정

💡 실천 방법:
1. 표면적 질문에서 감정 질문으로: "그때 어떤 기분이었어요?"
2. 자신의 취약한 경험도 공유하여 신뢰 구축
3. 판단 없이 경청하고 공감 표현하기
      `,
      '갈등 해결 코칭': `
갈등은 **이해**와 **존중**으로 해결됩니다.

📚 연구 기반 조언:
- Marshall Rosenberg의 비폭력 대화(NVC): 관찰, 감정, 욕구, 요청
- John Gottman의 연구: 갈등 시 "수리 시도(Repair Attempts)"가 중요
- 감정 조절 능력이 갈등 해결의 핵심

💡 실천 방법:
1. "나 전달법" 사용: "나는 ~했을 때 ~하게 느꼈어"
2. 상대방의 입장에서 생각해보기: "당신 입장에서는..."
3. 해결책 함께 찾기: "우리가 어떻게 하면 좋을까?"
      `,
      '관계 발전 코칭': `
관계 발전은 **지속적인 관심**과 **성장 마인드셋**이 필요합니다.

📚 연구 기반 조언:
- Carol Dweck의 성장 마인드셋: 관계도 성장하고 발전할 수 있다
- Arthur Aron의 36가지 질문: 친밀감을 빠르게 형성하는 방법
- 긍정 심리학: 감사 표현이 관계 만족도를 높임

💡 실천 방법:
1. 정기적으로 깊은 대화 시간 만들기
2. 상대방의 성장과 변화에 관심 가지기
3. 감사한 점을 구체적으로 표현하기
      `
    };

    return fallbackAdvice[specialty] || fallbackAdvice['첫 만남 코칭'];
  }
}

export const tavilySearch = new TavilySearchService();
