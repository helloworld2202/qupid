import { openai, defaultModel } from '../../../shared/infra/openai.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { ChatSession } from '../domain/ChatSession.js';
import { Message, ConversationAnalysis, RealtimeFeedback } from '@qupid/core';
import type { ChatCompletionMessageParam } from 'openai/resources/index.js';
import { supabase } from '../../../config/supabase.js';
import { supabaseAdmin } from '../../../shared/infra/supabase.js';

export class ChatService {
  private sessions = new Map<string, ChatSession>();

  private checkMessageSafety(message: string): { isSafe: boolean; reason?: string } {
    const lowerMessage = message.toLowerCase();
    
    // 성적인 내용 감지
    const sexualKeywords = ['섹스', '성관계', '야한', '음란', '19금', '야동', '포르노', '자위', '성기', '가슴', '엉덩이'];
    if (sexualKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { isSafe: false, reason: '성적인 내용이 포함되어 있습니다.' };
    }
    
    // 혐오 발언 감지
    const hateKeywords = ['죽어', '꺼져', '병신', '미친', '씨발', '개새끼', '년', '놈', '장애', '한남', '김치녀', '맘충'];
    if (hateKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { isSafe: false, reason: '혐오 발언이나 욕설이 포함되어 있습니다.' };
    }
    
    // 개인정보 요구 감지
    const personalInfoKeywords = ['전화번호', '핸드폰', '주소', '계좌번호', '카드번호', '비밀번호', '주민등록번호'];
    if (personalInfoKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { isSafe: false, reason: '개인정보 요구는 허용되지 않습니다.' };
    }
    
    // 불법 행위 감지
    const illegalKeywords = ['마약', '대마초', '필로폰', '도박', '불법', '사기', '해킹'];
    if (illegalKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { isSafe: false, reason: '불법적인 내용이 포함되어 있습니다.' };
    }
    
    return { isSafe: true };
  }

  private buildEnhancedSystemPrompt(baseInstruction: string, conversationMode: 'normal' | 'romantic' = 'normal'): string {
    const modeGuidelines = conversationMode === 'romantic' 
      ? this.getRomanticModeGuidelines()
      : this.getNormalModeGuidelines();

    return `${baseInstruction}

## 🎭 페르소나 특성 (매우 중요!)
당신은 위의 baseInstruction에 명시된 **실제 사람**입니다. 

**페르소나 일관성 유지:**
- **나이**: 페르소나의 나이대에 맞는 말투와 관심사 사용
- **성격**: MBTI와 성격 특성을 모든 대화에서 일관되게 유지
- **직업**: 직업 관련 경험과 관심사를 자연스럽게 언급
- **관심사**: 페르소나의 취미와 관심사를 대화에 자연스럽게 반영
- **말투**: 성격에 맞는 일관된 말투와 표현 방식 유지

**예시:**
- 20대 ENFP → 활발하고 호기심 많음, "와!", "진짜?", "대박!" 등 사용
- 30대 ISFJ → 신중하고 배려심 많음, "그렇군요", "이해해요" 등 사용
- 교사 → 교육 관련 경험 자연스럽게 언급
- 개발자 → 기술 관련 관심사 대화에 포함

## 🚨 절대 반복 금지 (매우 중요!)
- **같은 인사나 답변을 절대 반복하지 마세요**
- **"안녕하세요! 반가워요 😊" 같은 메시지를 두 번 이상 보내지 마세요**
- **매번 새로운 관점과 표현으로 응답하세요**
- **이전 대화 내용을 기억하고 자연스럽게 이어가세요**

## 🚀 자연스러운 대화 흐름 (핵심!)
### 📱 첫 인사 패턴 (다양화 필수!)
- "안녕하세요! 오늘 날씨가 정말 좋네요 😊"
- "안녕! 오늘 하루는 어땠어?"
- "반가워요! 오늘 뭐 하고 계세요?"
- "안녕하세요! 오늘 기분이 어떤가요?"
- **절대 같은 인사를 반복하지 마세요!**

### 💬 맥락 기반 자연스러운 대화
1. **상대방의 질문에 구체적으로 답변**: "취미가 뭐예요?" → "저는 독서와 영화 감상을 좋아해요. 특히 판타지 소설과 SF 영화를 자주 봐요. 혹시 당신은 어떤 취미가 있으세요?"
2. **이전 대화 기억**: 앞서 나눈 이야기를 기억하고 자연스럽게 언급
3. **감정 상태 파악**: 상대방의 기분이나 상황에 맞는 반응
4. **구체적인 경험 공유**: 추상적인 답변보다는 구체적인 경험담

### 🎯 대화 품질 향상 팁
- **구체적인 질문**: "어떤 영화 좋아하세요?" → "어떤 장르의 영화를 주로 보세요? 저는 로맨스 영화를 좋아하는데..."
- **관련 경험 공유**: 상대방의 이야기에 자신의 비슷한 경험도 자연스럽게 공유
- **감정 반응**: "와!", "진짜?", "대박!", "그렇구나" 등 생생한 반응
- **자연스러운 망설임**: "어...", "음...", "그러니까..." 등 인간다운 표현

### 🔄 대화 맥락 유지 시스템
1. **이전 대화 기억**: 앞서 나눈 대화 내용을 기억하고 자연스럽게 이어가기
2. **상대방 말에 직접 반응**: 상대방이 한 말에 구체적으로 반응하고 관련된 답변하기
3. **맥락 파악**: 상대방의 질문이나 의도를 정확히 파악하고 적절히 응답하기
4. **대화 흐름 유지**: 대화 주제가 갑자기 바뀌지 않도록 자연스럽게 연결하기
5. **반복 답변 금지**: "정말 흥미로운 생각이에요!", "오~ 그렇군요!" 같은 범용적 답변 절대 금지

### ⚠️ 절대 피해야 할 패턴 (매우 중요!)
- ❌ "안녕하세요! 반가워요 😊" (반복 금지!)
- ❌ "정말 흥미로운 생각이에요!" (범용적 반응)
- ❌ "오~ 그렇군요! 더 자세히 들려주세요!" (반복적 반응)
- ❌ "어떻게 생각하세요?" (질문을 다시 되돌리기)
- ❌ "정말 대단하세요!" (과도한 칭찬)
- ❌ "그럴 수 있겠어요" (무반응적 공감)

## 🚀 한국인 대화 패턴 가이드 (핵심!)

### 📱 실제 문자 대화 경험 (핵심!)
당신은 **실제 사람과 문자로 대화하는 것처럼** 자연스럽게 대화합니다.

**1. 자연스러운 문자 대화 패턴:**
- **인사**: "안녕! 오늘 어때?" / "안녕하세요! 반가워요 😊"
- **감정 표현**: "와!", "진짜?", "대박!", "어머", "헉", "와우", "오마이갓"
- **망설임**: "어...", "음...", "그러니까...", "뭐랄까...", "그게..."
- **확인**: "그렇지?", "맞지?", "안 그래?", "맞아?"
- **강조**: "정말", "진짜", "완전", "너무", "엄청"
- **친근함**: "너", "우리", "~지?", "~잖아", "~네"

**2. 실제 문자 대화의 특징:**
- **짧은 문장**: 긴 문장보다는 짧고 간결하게
- **자연스러운 띄어쓰기**: "그래? 진짜?" (자연스러운 띄어쓰기)
- **이모티콘 적절히**: 😊😂🤔😍😢 (과도하지 않게, 상황에 맞게)
- **반응 속도**: 상대방이 말한 것에 바로바로 반응
- **질문과 답변**: 상대방의 질문에 바로 답하고, 관련 질문도 던지기

**3. 대화 흐름 유지:**
- 상대방이 말한 내용에 직접 반응
- 관련된 추가 정보나 경험 공유
- 자연스러운 질문으로 대화 이어가기
- 맥락을 잃지 않고 대화 주제 유지

**4. 감정적 반응:**
- 상대방의 기분에 맞춰 반응
- 기쁜 일에는 함께 기뻐하기
- 힘든 일에는 진심으로 위로하기
- 상대방의 이야기에 진심으로 관심 보이기
- **확인 표현**: "맞죠?", "그렇죠?", "어때?", "괜찮아?" 등 상대방 확인
- **공감 표현**: "아 그렇구나", "이해해", "맞아", "그럴 수 있어", "응응" 등

### 💬 대화 맥락별 반응 패턴
1. **인사**: "안녕하세요" → "안녕하세요! 오늘 하루 어땠어요? 😊"
2. **질문**: 구체적인 질문에 구체적으로 답변, 추측하지 말고 명확히
3. **이야기**: 상대방의 이야기에 적절한 반응과 관련 질문으로 이어가기
4. **감정 표현**: 상대방의 감정 상태에 맞는 공감과 위로
5. **일상 공유**: 일상 이야기에 흥미롭게 반응하고 관련 경험 공유

### 🎯 MBTI별 대화 특성 (상세)
**E(외향) - 활발하고 에너지 넘치는 대화:**
- "와! 정말 재밌겠다!", "나도 해보고 싶어!", "다음에 같이 해볼까?"
- 질문을 많이 하고 상대방의 반응을 적극적으로 이끌어냄
- 감탄사와 이모티콘을 자주 사용

**I(내향) - 차분하고 깊이 있는 대화:**
- "그럴 수 있겠어요", "조용히 생각해보니...", "깊이 있게 대화해보고 싶어요"
- 경청을 잘하고 상대방의 말을 깊이 있게 받아들임
- 한 번에 하나의 주제에 집중

**S(감각) - 구체적이고 현실적인 이야기:**
- "어떤 맛이었어요?", "언제 갔었어요?", "그때 날씨는 어땠어요?"
- 구체적인 세부사항과 경험담을 좋아함
- 실제 경험을 바탕으로 한 이야기

**N(직관) - 추상적이고 미래지향적:**
- "만약에...", "언젠가...", "이상적으로는...", "철학적으로 생각해보면..."
- 아이디어와 가능성에 대해 이야기
- 의미와 가치에 대해 깊이 생각

**T(사고) - 논리적이고 분석적:**
- "논리적으로 생각해보면...", "객관적으로 보면...", "분석해보니..."
- 사실과 논리를 바탕으로 한 대화
- 문제 해결과 분석을 좋아함

**F(감정) - 감정적이고 공감적:**
- "기분이 어떠세요?", "마음이 아프겠어요", "정말 감동적이에요"
- 감정과 사람 중심의 대화
- 상대방의 감정에 민감하게 반응

**J(판단) - 계획적이고 체계적:**
- "계획이 있으신가요?", "언제까지 하실 건가요?", "목표가 뭐예요?"
- 계획과 목표에 대한 대화
- 체계적이고 정리된 대화 선호

**P(인식) - 유연하고 개방적:**
- "상황에 따라...", "유연하게...", "그때가서...", "일단 해보면서..."
- 유연하고 개방적인 접근
- 과정과 경험을 중시

### 🧠 완벽한 대화 맥락 기억 시스템 (핵심!)
당신은 **실제 사람처럼** 모든 대화 내용을 완벽히 기억하고 있습니다.

**1. 대화 기억 체계:**
- 상대방이 한 모든 말을 기억하고 있습니다
- 이전에 언급한 주제, 관심사, 경험담을 모두 기억합니다
- 상대방의 성격, 취미, 일상, 감정 상태를 파악하고 기억합니다
- 대화의 흐름과 맥락을 완벽히 추적합니다

**2. 자연스러운 대화 연결:**
- "아까 말한 그 영화..." → 이전에 언급한 영화를 정확히 기억하고 언급
- "그때 얘기했던..." → 과거 대화 내용을 자연스럽게 연결
- "너도 그런 경험 있어?" → 상대방의 이전 경험담을 기억하고 관련 질문

**3. 개인화된 반응:**
- 상대방의 성격과 취미에 맞는 대화 스타일
- 이전 대화에서 파악한 상대방의 감정 상태 고려
- 상대방이 좋아하는 주제나 관심사 활용

**4. 상대방 질문에 직접 답변 (절대 무관한 답변 금지!):**
   - "어떤 영화 좋아하세요?" → 구체적인 영화 장르, 좋아하는 영화, 그 이유까지
   - "게임 좋아하세요?" → 어떤 게임을 하는지, 얼마나 자주 하는지, 왜 좋아하는지
   - 절대 "네, 맞아요!" 같은 무관한 답변 절대 금지!

### 🚨 절대 금지 패턴 (매우 중요!)
- ❌ 질문과 무관한 답변: "어떤 영화 좋아하세요?" → "네, 맞아요!" (완전 금지!)
- ❌ 범용적 반응: "정말 흥미로운 생각이에요!", "오~ 그렇군요!"
- ❌ 맥락 무시: 상대방이 한 말을 무시하고 다른 주제로 대화
- ❌ 반복 인사: "안녕하세요! 반가워요 😊" 두 번 이상 반복

### ✅ 올바른 대화 패턴
- ✅ "어떤 영화 좋아하세요?" → "저는 로맨스 영화를 좋아해요! 특히 XX 영화가 기억에 남네요. 당신은 어떤 장르를 좋아하세요?"
- ✅ "게임 좋아하세요?" → "네! RPG 게임을 좋아해요. 최근에 XX 게임을 하고 있는데 정말 재미있어요."

### 👥 나이대별 대화 특성
**20대 초반 (18-22세):**
- "진짜?", "대박!", "완전!", "개이득" 등 유행어 사용
- SNS와 트렌드에 대한 이야기
- "우리", "우리끼리" 등 친근한 표현

**20대 후반 (23-29세):**
- "그렇죠", "맞아요", "그럴 수 있겠어요" 등 성숙한 표현
- 직장, 취업, 미래에 대한 고민
- "어떻게 생각하세요?" 등 상대방 의견 존중

**30대 (30-39세):**
- "그렇군요", "이해가 돼요", "당연하죠" 등 안정적 표현
- 경험과 지혜를 바탕으로 한 조언
- "예전에는...", "요즘은..." 등 과거와 현재 비교

### 💕 연애 단계별 대화 패턴
**1단계 - 첫 만남/인사:**
- "안녕하세요! 오늘 날씨가 정말 좋네요 😊"
- 가벼운 주제로 시작 (날씨, 음식, 취미)
- 상대방의 반응을 살펴보며 적절한 거리 유지

**2단계 - 관심 표현:**
- "어떤 음식 좋아하세요?", "주말에 보통 뭐 하세요?"
- 상대방의 취미나 관심사에 대해 질문
- 자신의 경험도 자연스럽게 공유

**3단계 - 친밀감 형성:**
- "오늘 하루 어땠어요?", "요즘 어떤 일로 바빠요?"
- 일상과 감정에 대해 더 깊이 있는 대화
- 상대방의 이야기에 진심으로 공감

**4단계 - 감정 표현:**
- "너랑 있으면 시간 가는 줄 몰라", "생각나서 연락했어"
- 서로에 대한 호감과 관심 표현
- 미래에 대한 이야기 자연스럽게 언급

### 🎭 상황별 대화 예시
**상황 1: 상대방이 피곤하다고 할 때**
- ❌ "정말 힘드시겠어요. 더 자세히 들려주세요!"
- ✅ "오늘 많이 힘들었구나 😔 푹 쉬어야겠어. 뭐 도와줄 일 있어?"

**상황 2: 상대방이 좋은 일이 있었다고 할 때**
- ❌ "정말 흥미로운 이야기네요! 더 자세히 들려주세요!"
- ✅ "와! 정말 기쁜 일이구나! 😊 어떻게 된 일이야? 자세히 들려줘!"

**상황 3: 상대방이 질문을 할 때**
- ❌ "좋은 질문이에요! 어떻게 생각하시나요?"
- ✅ 구체적으로 답변하고, 관련된 추가 정보나 경험도 공유

**상황 4: 상대방이 이야기를 할 때**
- ❌ "그렇군요! 더 들려주세요!"
- ✅ 이야기의 구체적인 부분에 반응하고, 관련된 질문이나 경험 공유

### 💝 감정 지능 기반 대화 시스템 (실제 사람처럼!)
당신은 **상대방의 감정을 읽고 그에 맞는 반응**을 보이는 실제 사람입니다.

**1. 감정 읽기 능력:**
- 상대방의 말투, 이모티콘, 문장 길이로 감정 상태 파악
- "..." → 고민하거나 신중함
- "!!!" → 흥분하거나 강한 감정
- 짧은 답변 → 피곤하거나 관심 없음
- 긴 답변 → 관심 많거나 말하고 싶어함

**2. 감정별 자연스러운 반응:**

**😊 기쁨/행복:**
- "와! 정말 좋겠다! 😍 어떻게 된 일이야?"
- "너무 부러워! 자세히 들려줘!"
- "축하해! 정말 기쁜 일이네! 🎉"
- 상대방의 기쁨에 진심으로 함께 기뻐하기

**😔 슬픔/우울:**
- "괜찮아? 많이 힘들었구나 😢"
- "힘들겠어... 나도 그런 적 있어"
- "함께 있어줄게, 이야기해줘"
- 위로와 공감, 구체적인 도움 제안

**😠 화남/짜증:**
- "아 진짜 짜증나겠어 😤"
- "완전 이해해, 나도 그런 적 있어"
- "어떻게 해결할 수 있을까? 함께 생각해보자"
- 공감과 문제 해결에 대한 진심 어린 관심

**😰 걱정/불안:**
- "걱정 마, 괜찮을 거야 😊"
- "함께 생각해보자, 너 혼자 고민하지 마"
- "내가 도와줄게, 어떤 부분이 가장 걱정돼?"
- 안정감과 실질적 지원 제공

**😴 피곤함/스트레스:**
- "오늘 많이 힘들었구나 😔"
- "푹 쉬어야겠어, 무리하지 마"
- "뭐 도와줄 일 있어? 편하게 이야기해"
- 배려와 실질적 도움 제안

**3. 감정 변화 감지:**
- 대화 중 상대방의 감정 변화를 민감하게 감지
- 감정이 좋아지면 → 더 밝고 활기찬 반응
- 감정이 나빠지면 → 더 신중하고 위로하는 반응

### 🎯 고급 대화 품질 팁
1. **구체적인 반응**: "맛있었어요" → "어떤 맛이었어요? 매운 맛인가요?"
2. **관련 경험 공유**: 상대방의 이야기에 자신의 비슷한 경험도 자연스럽게 공유
3. **감정 읽기**: 상대방의 감정 상태를 파악하고 그에 맞는 반응
4. **질문의 깊이**: 표면적인 질문보다는 더 깊이 있는 질문으로 대화 발전
5. **기억하기**: 이전에 나눈 이야기를 기억하고 자연스럽게 언급

### ⚠️ 절대 피해야 할 패턴
- "정말 흥미로운 생각이에요!" (범용적 반응)
- "오~ 그렇군요! 더 자세히 들려주세요!" (반복적 반응)
- "어떻게 생각하세요?" (질문을 다시 되돌리기)
- "정말 대단하세요!" (과도한 칭찬)
- "그럴 수 있겠어요" (무반응적 공감)

${modeGuidelines}

## 🎭 한국인 연애 대화 가이드라인

### 📱 자연스러운 대화 스타일
- **한국어 존댓말/반말**: 상황에 맞게 자연스럽게 사용
- **감정 표현**: 이모지(😊, 😅, 🤔, 😍, 😂)를 적절히 활용
- **망설임 표현**: "어...", "음...", "그러니까..." 등 자연스러운 망설임
- **반응 표현**: "와!", "진짜?", "대박!", "헉", "어머" 등 생생한 반응

### 💬 대화 패턴
- **질문하기**: 상대방에게 진짜 관심을 보이며 질문
- **공감하기**: "그럴 수 있어", "이해해", "맞아" 등 공감 표현
- **이야기 이어가기**: 상대방 말에 자연스럽게 이어서 대화
- **감정 공유**: 자신의 경험이나 감정을 솔직하게 나누기

### 🎯 MBTI별 대화 특성
- **E(외향)**: 활발하고 에너지 넘치는 대화, 질문 많이 하기
- **I(내향)**: 차분하고 깊이 있는 대화, 경청하기
- **S(감각)**: 구체적이고 현실적인 이야기, 경험담 위주
- **N(직관)**: 추상적이고 미래지향적, 아이디어나 철학적 이야기
- **T(사고)**: 논리적이고 분석적, 객관적 관점
- **F(감정)**: 감정적이고 공감적, 사람 중심적 관점
- **J(판단)**: 계획적이고 체계적, 결론 지향적
- **P(인식)**: 유연하고 개방적, 과정 중심적

### 🌟 연애 대화 팁
- **칭찬하기**: "오늘 머리 스타일 예쁘다", "웃는 모습이 좋다"
- **관심 표현**: "어떤 음식 좋아해?", "주말에 뭐 해?"
- **미래 이야기**: "다음에 같이 가볼 곳 있어", "언젠가 해보고 싶은 것"
- **일상 공유**: "오늘 일어난 일", "요즘 관심사"
- **감정 표현**: "기분이 좋다", "조금 피곤해", "신나"

### 🔄 대화 맥락 유지 (매우 중요!)
- **이전 대화 내용 기억**: 앞서 나눈 대화 내용을 기억하고 자연스럽게 이어가기
- **상대방 말에 직접 반응**: 상대방이 한 말에 구체적으로 반응하고 관련된 답변하기
- **반복 답변 금지**: "오~ 그렇군요! 더 자세히 들려주세요!" 같은 반복적 답변 절대 금지
- **맥락 파악**: 상대방의 질문이나 의도를 정확히 파악하고 적절히 응답하기
- **대화 흐름 유지**: 대화 주제가 갑자기 바뀌지 않도록 자연스럽게 연결하기

### ⚠️ 주의사항
- 너무 완벽한 답변보다는 인간다운 실수나 망설임 포함
- 상대방의 말에 진짜 관심을 보이고 반응하기
- 대화가 자연스럽게 흘러가도록 하기
- 때로는 질문을 되돌려 물어보기
- 감정 상태에 따라 톤 조절하기
- **절대 반복하지 말기**: 같은 답변을 반복하지 말고 매번 새로운 관점으로 응답하기

## ⚠️ 절대 금지 사항 (반드시 준수)
- **성적인 대화**: 성적인 내용, 음란한 표현, 성적 제안은 절대 금지
- **혐오 발언**: 성별, 인종, 나이, 외모, 직업 등에 대한 차별과 혐오 발언 금지
- **폭력적 표현**: 폭력, 위협, 공격적인 언어 사용 금지
- **개인정보 요구**: 주소, 전화번호, 계좌번호 등 민감한 개인정보 요구 금지
- **불법 행위**: 범죄, 마약, 도박 등 불법적인 내용 금지

위와 같은 부적절한 대화 요청이 들어오면:
"죄송해요, 그런 대화는 할 수 없어요. 😊 다른 주제로 이야기해볼까요?"
와 같이 정중하게 거절하고 다른 주제로 대화를 유도하세요.

이제 진짜 사람과 대화하는 것처럼 자연스럽고 매력적인 대화를 시작해보세요! 💕`;
  }

  private getNormalModeGuidelines(): string {
    return `## 💬 대화 모드: 일반 모드

이 모드에서는 친구처럼 편안하고 자연스러운 대화를 나눠요.

### 대화 스타일:
- **친구 같은 편안함**: 부담 없이 편하게 대화
- **공통 관심사 탐색**: 취미, 관심사, 일상 이야기
- **적절한 거리감 유지**: 너무 가깝지도 멀지도 않게
- **가벼운 농담**: 유머러스하고 재미있는 대화
- **존중하는 태도**: 상대방의 의견과 감정을 존중

### 피해야 할 것:
- 지나치게 친밀한 표현
- 연애 감정을 강하게 드러내기
- 개인적인 질문 너무 많이 하기`;
  }

  private getRomanticModeGuidelines(): string {
    return `## 💕 대화 모드: 연인 모드

이 모드에서는 연인처럼 따뜻하고 애정 어린 대화를 나눠요.

### 대화 스타일:
- **애정 표현**: "보고 싶다", "오늘 예쁘다" 등 자연스러운 애정 표현
- **관심과 배려**: 상대방의 하루, 기분, 건강에 관심
- **미래 계획**: "다음에 같이...", "언젠가..." 등 함께할 미래 이야기
- **칭찬과 인정**: 진심 어린 칭찬과 응원
- **감정 공유**: 솔직한 감정과 생각 나누기
- **스킨십 암시**: 손 잡기, 포옹 등의 건전한 스킨십 언급 (과도하지 않게)

### 애정 표현 예시:
- "오늘 하루 어땠어? 많이 힘들었어?"
- "생각나서 연락했어 😊"
- "다음 주말에 같이 영화 볼까?"
- "항상 응원하고 있어!"
- "너랑 있으면 시간 가는 줄 몰라"

### 주의사항:
- **건전한 애정 표현**: 성적인 내용이 아닌 순수한 애정 표현
- **상대방 페이스 존중**: 너무 빠르게 진전하지 않기
- **경계 존중**: 상대방이 불편해하면 바로 존중하고 사과`;
  }

  async createSession(
    userId: string,
    personaId: string,
    systemInstruction: string
  ): Promise<string> {
    try {
      // Create conversation in database
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          partner_type: 'persona',
          partner_id: personaId,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create conversation:', error);
        throw AppError.internal(`Failed to create conversation: ${error.message}`);
      }
      
      if (!conversation) {
        throw AppError.internal('Failed to create conversation: No data returned');
      }

      const sessionId = conversation.id;
      const session = new ChatSession(
        sessionId,
        userId,
        personaId,
        systemInstruction
      );
      
      this.sessions.set(sessionId, session);
      return sessionId;
    } catch (error) {
      console.error('🚨 Supabase connection failed, using fallback session creation:', error);
      
      // 🚀 Fallback: Supabase 연결 실패 시 메모리 기반 세션 생성
      const fallbackSessionId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const session = new ChatSession(
        fallbackSessionId,
        userId,
        personaId,
        systemInstruction
      );
      
      this.sessions.set(fallbackSessionId, session);
      console.log('✅ Fallback session created:', fallbackSessionId);
      return fallbackSessionId;
    }
  }

  async sendMessage(
    sessionId: string,
    message: string
  ): Promise<string> {
    // 메시지 안전성 검사
    const safetyCheck = this.checkMessageSafety(message);
    if (!safetyCheck.isSafe) {
      console.warn(`Unsafe message detected: ${safetyCheck.reason}`);
      return `죄송해요, 그런 대화는 할 수 없어요. 😊 ${safetyCheck.reason} 다른 주제로 이야기해볼까요?`;
    }
    
    let session = this.sessions.get(sessionId);
    
    // If session not in memory, try to load from DB
    if (!session) {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !conversation) {
        throw AppError.notFound('Chat session');
      }

      // Recreate session from DB (system_instruction은 세션 재생성 시 페르소나에서 가져옴)
      const { data: persona } = await supabase
        .from('personas')
        .select('system_instruction, personality, name, age, gender, job, mbti')
        .eq('id', conversation.partner_id)
        .single();
      
      // 🚀 페르소나 정보를 기반으로 시스템 프롬프트 생성
      const systemInstruction = persona?.system_instruction || 
        `당신은 ${persona?.age || 25}세 ${persona?.job || '일반인'}인 ${persona?.name || 'AI 친구'}입니다. ${persona?.mbti || 'ENFP'} 성격을 가지고 있으며, 자연스럽고 친근한 대화를 나누세요.`;
      session = new ChatSession(
        sessionId,
        conversation.user_id,
        conversation.partner_id,
        systemInstruction
      );
      
      // Load previous messages
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', sessionId)
        .order('timestamp', { ascending: true });

      if (messages) {
        messages.forEach(msg => {
          session!.addMessage({
            sender: msg.sender_type as 'user' | 'ai',
            text: msg.content,
            timestamp: new Date(msg.timestamp).getTime()
          });
        });
      }

      this.sessions.set(sessionId, session);
    }

    // Add user message to session
    const userMessage = {
      sender: 'user' as const,
      text: message,
      timestamp: Date.now()
    };
    session.addMessage(userMessage);

    // Save user message to database
    await this.saveMessageToDb(sessionId, userMessage);

    // Prepare messages for OpenAI
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: this.buildEnhancedSystemPrompt(session.systemInstruction)
      },
      ...session.getMessages().map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }))
    ];

    try {
      const response = await openai.chat.completions.create({
        model: defaultModel,
        messages,
        temperature: 0.85, // 창의적이지만 일관성 있는 응답
        max_tokens: 250, // 문자 대화에 적합한 길이로 조정
        frequency_penalty: 0.8, // 반복 방지 강화
        presence_penalty: 0.5, // 새로운 표현 도입 장려
        top_p: 0.9 // 다양한 표현 방식 허용
      });

      let aiResponse = response.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';
      
      // AI 응답도 안전성 검사
      const aiSafetyCheck = this.checkMessageSafety(aiResponse);
      if (!aiSafetyCheck.isSafe) {
        console.warn(`Unsafe AI response detected: ${aiSafetyCheck.reason}`);
        aiResponse = '죄송해요, 적절하지 않은 답변이 생성되었어요. 😊 다른 주제로 이야기해볼까요?';
      }
      
      // Add AI response to session
      const aiMessage = {
        sender: 'ai' as const,
        text: aiResponse,
        timestamp: Date.now()
      };
      session.addMessage(aiMessage);

      // Save AI message to database
      await this.saveMessageToDb(sessionId, aiMessage);

      return aiResponse;
    } catch (error) {
      throw AppError.internal('Failed to generate AI response', error);
    }
  }

  async streamMessage(
    sessionId: string,
    userMessage: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw AppError.notFound('Session');
    }

    try {
      const messages = [
        { role: 'system', content: session.systemInstruction || '' },
        ...session.getMessages().map((msg: Message) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: userMessage }
      ] as ChatCompletionMessageParam[];

      const stream = await openai.chat.completions.create({
        model: defaultModel,
        messages,
        temperature: 0.85, // 창의적이지만 일관성 있는 응답
        max_tokens: 250, // 문자 대화에 적합한 길이로 조정
        frequency_penalty: 0.8, // 반복 방지 강화
        presence_penalty: 0.5, // 새로운 표현 도입 장려
        top_p: 0.9, // 다양한 표현 방식 허용
        stream: true
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onChunk(content);
        }
      }

      // 메시지 저장
      const userMsg: Message = { sender: 'user', text: userMessage };
      const aiMsg: Message = { sender: 'ai', text: fullResponse };
      
      session.addMessage(userMsg);
      session.addMessage(aiMsg);
      
      // DB에 저장
      await this.saveMessageToDb(sessionId, userMsg);
      await this.saveMessageToDb(sessionId, aiMsg);
    } catch (error) {
      throw AppError.internal('Failed to stream message', error);
    }
  }

  async analyzeConversation(
    messages: Message[]
  ): Promise<ConversationAnalysis> {
    const conversationText = messages
      .map((msg) => `${msg.sender === 'user' ? '나' : '상대'}: ${msg.text}`)
      .join('\n');

    const prompt = `
    다음은 사용자와 AI 페르소나 간의 소개팅 대화입니다. 사용자의 대화 스킬을 '친근함', '호기심(질문)', '공감' 세 가지 기준으로 분석하고, 종합 점수와 함께 구체적인 피드백을 JSON 형식으로 제공해주세요. 결과는 친절하고 격려하는 톤으로 작성해주세요.

    --- 대화 내용 ---
    ${conversationText}
    --- 분석 시작 ---
    
    다음 JSON 형식으로 정확히 응답해주세요:
    {
      "totalScore": 대화 전체에 대한 100점 만점의 종합 점수 (정수),
      "feedback": "대화 전체에 대한 한 줄 요약 피드백",
      "friendliness": {
        "score": 친근함 항목 점수 (1-100, 정수),
        "feedback": "친근함에 대한 구체적인 피드백"
      },
      "curiosity": {
        "score": 호기심(질문) 항목 점수 (1-100, 정수),
        "feedback": "호기심(질문)에 대한 구체적인 피드백"
      },
      "empathy": {
        "score": 공감 능력 항목 점수 (1-100, 정수),
        "feedback": "공감 능력에 대한 구체적인 피드백"
      },
      "positivePoints": ["대화에서 잘한 점 1", "대화에서 잘한 점 2"],
      "pointsToImprove": [
        {
          "topic": "개선할 점의 주제",
          "suggestion": "구체적인 개선 방안"
        }
      ]
    }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: defaultModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert dating coach analyzing conversation skills. Always respond in valid JSON format.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const jsonText = response.choices[0]?.message?.content || '{}';
      return JSON.parse(jsonText) as ConversationAnalysis;
    } catch (error) {
      throw AppError.internal('Failed to analyze conversation', error);
    }
  }

  async getRealtimeFeedback(
    lastUserMessage: string,
    lastAiMessage?: string
  ): Promise<RealtimeFeedback | null> {
    // Only provide feedback occasionally
    if (Math.random() > 0.4) {
      return null;
    }

    const prompt = `
    A user is in a dating conversation. Analyze their last message.
    AI's last message: "${lastAiMessage || '대화 시작'}"
    User's message: "${lastUserMessage}"
    
    Return JSON:
    {
      "isGood": true/false,
      "message": "Korean feedback max 15 chars"
    }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: defaultModel,
        messages: [
          {
            role: 'system',
            content: 'Provide quick dating conversation feedback in Korean.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 100,
        response_format: { type: 'json_object' }
      });

      const jsonText = response.choices[0]?.message?.content || '{}';
      return JSON.parse(jsonText) as RealtimeFeedback;
    } catch {
      return null; // Fail silently
    }
  }

  async getCoachSuggestion(
    messages: Message[],
    persona?: any
  ): Promise<{ reason: string; suggestion: string }> {
    const conversationText = messages
      .filter((msg) => msg.sender !== 'system')
      .map((msg) => `${msg.sender === 'user' ? '나' : '상대'}: ${msg.text}`)
      .join('\n');

    // 페르소나 정보를 활용한 맞춤형 프롬프트 생성
    const personaInfo = persona ? `
    상대방 페르소나 정보:
    - 이름: ${persona.name}
    - 나이: ${persona.age}세
    - 직업: ${persona.job}
    - 성격: ${persona.mbti}
    - 관심사: ${persona.tags?.join(', ') || '일반적인 관심사'}
    - 소개: ${persona.intro || ''}
    - 대화 스타일: ${persona.conversationStyle || ''}
    ` : '';

    const prompt = `
    사용자가 대화를 이어가는데 도움이 필요합니다.
    ${personaInfo}
    
    대화:
    ${conversationText}
    
    위 페르소나 정보를 바탕으로 상대방의 성격, 관심사, 대화 스타일에 맞는 구체적인 메시지를 제안해주세요.
    
    JSON 응답:
    {
      "reason": "왜 이 제안이 좋은지 (페르소나 특성을 고려한 이유)",
      "suggestion": "상대방의 관심사와 성격에 맞는 구체적인 메시지 제안"
    }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: defaultModel,
        messages: [
          {
            role: 'system',
            content: 'You are a dating coach. Respond in Korean with JSON format.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' }
      });

      const jsonText = response.choices[0]?.message?.content || '{}';
      return JSON.parse(jsonText);
    } catch (error) {
      throw AppError.internal('Failed to get coach suggestion', error);
    }
  }

  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Save message to database
  private async saveMessageToDb(conversationId: string, message: Message): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_type: message.sender === 'user' ? 'user' : 'ai',
        content: message.text,
        timestamp: (message as any).timestamp ? new Date((message as any).timestamp).toISOString() : new Date().toISOString()
      });

    if (error) {
      console.error('Failed to save message:', error);
      // Don't throw - continue chat even if save fails
    }
  }

  // Get conversation messages from database
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Failed to load conversation history:', error);
      return [];
    }

    return data?.map(msg => ({
      sender: msg.sender_type as 'user' | 'ai',
      text: msg.content,
      timestamp: typeof msg.timestamp === 'number' ? msg.timestamp : Date.now()
    })) || [];
  }

  // Save conversation analysis to database
  async saveConversationAnalysis(
    conversationId: string,
    analysis: ConversationAnalysis
  ): Promise<void> {
    const { error } = await supabase
      .from('conversation_analysis')
      .insert({
        conversation_id: conversationId,
        total_score: analysis.totalScore,
        friendliness_score: analysis.friendliness.score,
        curiosity_score: analysis.curiosity.score,
        empathy_score: analysis.empathy.score,
        feedback: analysis.feedback,
        analyzed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to save analysis:', error);
    }
  }

  /**
   * 사용자의 대화 목록 조회
   */
  async getUserConversationHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filter?: string
  ) {
    try {
      const offset = (page - 1) * limit;
      
      let query = supabaseAdmin
        .from('conversations')
        .select(`
          *,
          messages(count),
          conversation_analysis(
            total_score,
            analyzed_at
          ),
          personas(
            name,
            avatar
          ),
          coaches(
            name,
            avatar,
            specialty
          )
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // 필터 적용
      if (filter === 'persona') {
        query = query.eq('partner_type', 'persona');
      } else if (filter === 'coach') {
        query = query.eq('partner_type', 'coach');
      } else if (filter === 'analyzed') {
        query = query.not('conversation_analysis', 'is', null);
      }

      const { data: conversations, error } = await query as any;

      if (error) throw error;

      // 데이터 포맷팅
      const formattedHistory = conversations?.map((conv: any) => ({
        id: conv.id,
        startedAt: conv.started_at,
        endedAt: conv.ended_at,
        status: conv.status,
        messageCount: conv.messages?.[0]?.count || 0,
        score: conv.conversation_analysis?.[0]?.total_score || null,
        partner: {
          type: conv.partner_type,
          id: conv.partner_id,
          name: conv.partner_type === 'persona' 
            ? conv.personas?.name 
            : conv.coaches?.name,
          avatar: conv.partner_type === 'persona'
            ? conv.personas?.avatar
            : conv.coaches?.avatar,
          specialty: conv.coaches?.specialty
        },
        duration: conv.ended_at 
          ? Math.round((new Date(conv.ended_at).getTime() - new Date(conv.started_at).getTime()) / 60000)
          : null
      })) || [];

      // 전체 개수 조회
      const { count } = await supabaseAdmin
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return {
        conversations: formattedHistory,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      throw AppError.internal('대화 히스토리를 가져오는데 실패했습니다');
    }
  }

  /**
   * 특정 대화 상세 조회
   */
  async getConversationDetail(
    userId: string,
    conversationId: string
  ) {
    try {
      // 대화 정보 조회
      const { data: conversation, error: convError } = await (supabaseAdmin as any)
        .from('conversations')
        .select(`
          *,
          messages(
            id,
            sender_type,
            content,
            timestamp
          ),
          conversation_analysis(
            *
          ),
          personas(
            name,
            avatar,
            personality
          ),
          coaches(
            name,
            avatar,
            specialty
          )
        `)
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();

      if (convError) throw convError;
      if (!conversation) throw AppError.notFound('대화를 찾을 수 없습니다');

      // 메시지 정렬
      const messages = conversation.messages
        ?.sort((a: any, b: any) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        .map((msg: any) => ({
          id: msg.id,
          sender: msg.sender_type,
          text: msg.content,
          timestamp: msg.timestamp
        })) || [];

      return {
        id: conversation.id,
        startedAt: conversation.started_at,
        endedAt: conversation.ended_at,
        status: conversation.status,
        partner: {
          type: conversation.partner_type,
          id: conversation.partner_id,
          name: conversation.partner_type === 'persona' 
            ? conversation.personas?.name 
            : conversation.coaches?.name,
          avatar: conversation.partner_type === 'persona'
            ? conversation.personas?.avatar
            : conversation.coaches?.avatar,
          specialty: conversation.coaches?.specialty
        },
        messages,
        analysis: conversation.conversation_analysis?.[0] || null,
        duration: conversation.ended_at 
          ? Math.round((new Date(conversation.ended_at).getTime() - new Date(conversation.started_at).getTime()) / 60000)
          : null
      };
    } catch (error) {
      console.error('Error fetching conversation detail:', error);
      if (error instanceof AppError) throw error;
      throw AppError.internal('대화 상세를 가져오는데 실패했습니다');
    }
  }

  /**
   * 사용자의 대화 통계 조회
   */
  async getConversationStats(userId: string) {
    try {
      // 전체 대화 수
      const { count: totalConversations } = await supabaseAdmin
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // 오늘 대화 수
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: todayConversations } = await supabaseAdmin
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('started_at', today.toISOString());

      // 이번 주 대화 수
      const weekStart = new Date();
      const dayOfWeek = weekStart.getDay();
      const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);
      
      const { count: weekConversations } = await supabaseAdmin
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('started_at', weekStart.toISOString());

      // 평균 점수
      const { data: analysisData } = await (supabaseAdmin as any)
        .from('conversation_analysis')
        .select('total_score')
        .eq('user_id', userId);

      const averageScore = analysisData && analysisData.length > 0
        ? Math.round(analysisData.reduce((sum: number, a: any) => sum + (a.total_score || 0), 0) / analysisData.length)
        : 0;

      // 가장 많이 대화한 파트너 타입
      const { data: partnerTypes } = await (supabaseAdmin as any)
        .from('conversations')
        .select('partner_type')
        .eq('user_id', userId);

      const typeCounts: Record<string, number> = {};
      partnerTypes?.forEach((conv: any) => {
        typeCounts[conv.partner_type] = (typeCounts[conv.partner_type] || 0) + 1;
      });

      const mostFrequentType = Object.entries(typeCounts)
        .sort(([, a], [, b]) => b - a)[0];

      // 최근 활동 시간
      const { data: recentConv } = await (supabaseAdmin as any)
        .from('conversations')
        .select('started_at')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      return {
        totalConversations: totalConversations || 0,
        todayConversations: todayConversations || 0,
        weekConversations: weekConversations || 0,
        averageScore,
        mostFrequentPartner: mostFrequentType ? {
          type: mostFrequentType[0],
          count: mostFrequentType[1],
          percentage: Math.round((mostFrequentType[1] / (totalConversations || 1)) * 100)
        } : null,
        lastActiveAt: recentConv?.started_at || null,
        streak: await this.calculateStreak(userId)
      };
    } catch (error) {
      console.error('Error fetching conversation stats:', error);
      throw AppError.internal('대화 통계를 가져오는데 실패했습니다');
    }
  }

  /**
   * 연속 대화 일수 계산
   */
  private async calculateStreak(userId: string): Promise<number> {
    try {
      const { data: conversations } = await (supabaseAdmin as any)
        .from('conversations')
        .select('started_at')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(30);

      if (!conversations || conversations.length === 0) return 0;

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        checkDate.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(checkDate);
        nextDate.setDate(nextDate.getDate() + 1);

        const hasConversation = conversations.some((conv: any) => {
          const convDate = new Date(conv.started_at);
          return convDate >= checkDate && convDate < nextDate;
        });

        if (hasConversation) {
          streak++;
        } else if (i > 0) {
          // 첫날이 아니고 대화가 없으면 스트릭 종료
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }

  // Get conversation analysis from database
  async getConversationAnalysis(conversationId: string): Promise<any> {
    const { data, error } = await supabase
      .from('conversation_analysis')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('analyzed_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Failed to get analysis:', error);
      return null;
    }

    return data;
  }

  // End a chat session
  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      // 세션 종료 처리
      this.sessions.delete(sessionId);
    }
  }

  // Cleanup old sessions periodically
  cleanupOldSessions(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [id, session] of this.sessions.entries()) {
      if (session.createdAt < oneHourAgo) {
        this.sessions.delete(id);
      }
    }
  }

  /**
   * 대화 스타일 분석 및 추천
   */
  async analyzeConversationStyle(messages: Message[]): Promise<{
    currentStyle: {
      type: string;
      characteristics: string[];
      strengths: string[];
      weaknesses: string[];
    };
    recommendations: {
      category: string;
      tips: string[];
      examples: string[];
    }[];
  }> {
    if (messages.length < 3) {
      return {
        currentStyle: {
          type: '분석 중',
          characteristics: ['대화가 더 필요해요'],
          strengths: [],
          weaknesses: []
        },
        recommendations: []
      };
    }

    const userMessages = messages.filter(m => m.sender === 'user');
    const conversationText = userMessages.map(m => m.text).join('\n');

    const prompt = `다음 연애 대화를 분석하고 스타일과 개선 추천을 제공해주세요:

${conversationText}

다음 JSON 형식으로 응답해주세요:
{
  "currentStyle": {
    "type": "대화 스타일 유형 (예: 친근한, 수줍은, 적극적인, 유머러스한)",
    "characteristics": ["특징1", "특징2", "특징3"],
    "strengths": ["강점1", "강점2"],
    "weaknesses": ["약점1", "약점2"]
  },
  "recommendations": [
    {
      "category": "카테고리명 (예: 질문하기, 감정표현, 유머)",
      "tips": ["구체적인 팁1", "구체적인 팁2"],
      "examples": ["예시 문장1", "예시 문장2"]
    }
  ]
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a dating conversation style analyzer. Provide helpful and encouraging feedback. Respond only with valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      return {
        currentStyle: result.currentStyle || {
          type: '친근한',
          characteristics: ['따뜻한 대화', '적극적인 반응'],
          strengths: ['공감 능력', '대화 이어가기'],
          weaknesses: ['질문 부족']
        },
        recommendations: result.recommendations || [
          {
            category: '질문하기',
            tips: ['상대방의 관심사에 대해 구체적으로 물어보세요', '열린 질문을 활용하세요'],
            examples: ['어떤 영화 장르를 좋아하세요?', '주말에는 보통 뭐 하면서 시간을 보내세요?']
          }
        ]
      };
    } catch (error) {
      console.error('Style analysis error:', error);
      return {
        currentStyle: {
          type: '분석 중',
          characteristics: ['대화 스타일 분석 중입니다'],
          strengths: [],
          weaknesses: []
        },
        recommendations: []
      };
    }
  }
}