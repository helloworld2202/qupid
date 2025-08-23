import OpenAI from "openai"
import { Message, ConversationAnalysis, RealtimeFeedback } from "@qupid/core"

// Use environment variable for API key
const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  console.warn(
    "OPENAI_API_KEY environment variable not set. " +
      "Using a placeholder. AI functionality will be disabled. " +
      "Please provide your OpenAI API key."
  )
}

const openai = apiKey ? new OpenAI({ 
  apiKey,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made from backend
}) : null

// Default model is GPT-4o-mini for cost efficiency
const defaultModel = "gpt-4o-mini"

// Chat session management
interface ChatSession {
  messages: OpenAI.Chat.ChatCompletionMessageParam[]
  systemInstruction: string
}

const chatSessions = new Map<string, ChatSession>()

export const createChatSession = (systemInstruction: string): string => {
  const sessionId = Math.random().toString(36).substring(7)
  chatSessions.set(sessionId, {
    systemInstruction,
    messages: [
      {
        role: "system",
        content: `${systemInstruction} Keep your responses concise, natural, and engaging, like a real chat conversation.`
      }
    ]
  })
  return sessionId
}

export const sendMessageToAI = async (
  sessionId: string,
  message: string
): Promise<string> => {
  if (!openai) {
    return "AI 기능이 비활성화되었습니다. API 키를 설정해주세요."
  }

  const session = chatSessions.get(sessionId)
  if (!session) {
    return "세션을 찾을 수 없습니다. 다시 시작해주세요."
  }

  try {
    // Add user message to session
    session.messages.push({ role: "user", content: message })

    const response = await openai.chat.completions.create({
      model: defaultModel,
      messages: session.messages,
      temperature: 0.8,
      max_tokens: 500
    })

    const aiResponse = response.choices[0]?.message?.content || "응답을 생성할 수 없습니다."
    
    // Add AI response to session
    session.messages.push({ role: "assistant", content: aiResponse })
    
    return aiResponse
  } catch (error) {
    console.error("Error sending message to AI:", error)
    return "죄송해요, 지금은 답변하기 어렵네요. 잠시 후 다시 시도해주세요."
  }
}

export const analyzeConversation = async (
  conversation: Message[]
): Promise<ConversationAnalysis | null> => {
  if (!openai) return null

  const conversationText = conversation
    .map((msg) => `${msg.sender === "user" ? "나" : "상대"}: ${msg.text}`)
    .join("\n")

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
          "topic": "개선할 점의 주제 (예: 질문 방식)",
          "suggestion": "구체적인 개선 방안 및 예시"
        }
      ]
    }
    `

  try {
    const response = await openai.chat.completions.create({
      model: defaultModel,
      messages: [
        {
          role: "system",
          content: "You are an expert dating coach analyzing conversation skills. Always respond in valid JSON format."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })

    const jsonText = response.choices[0]?.message?.content || "{}"
    const analysisResult = JSON.parse(jsonText)
    return analysisResult as ConversationAnalysis
  } catch (error) {
    console.error("Error analyzing conversation:", error)
    return null
  }
}

export const getRealtimeFeedback = async (
  lastUserMessage: string,
  lastAiMessage: string | undefined
): Promise<RealtimeFeedback | null> => {
  if (!openai) return null

  // Only provide feedback occasionally to avoid annoyance
  if (Math.random() > 0.4) {
    return null
  }

  const prompt = `
    A user is in a dating conversation. Here is their last message and the AI's response to it.
    AI's last message: "${lastAiMessage || "대화 시작"}"
    User's message: "${lastUserMessage}"
    
    Analyze the user's message in context. Is it a good message (e.g., good question, good reaction, showing interest)? 
    Provide a very short, encouraging feedback or a tip in Korean (max 15 characters).
    
    Return the analysis in JSON format:
    {
      "isGood": true/false (boolean indicating if the message is positive),
      "message": "10자 이내의 짧은 격려 또는 팁"
    }
    
    Example of good feedback: "좋은 질문이에요! 👍", "공감가는 말이네요! 😊"
    Example of a tip: "다른 주제로 넘어가볼까요? 💡", "질문으로 답해보세요! 🤔"
    `

  try {
    const response = await openai.chat.completions.create({
      model: defaultModel,
      messages: [
        {
          role: "system",
          content: "You are a dating coach providing quick, encouraging feedback. Always respond in valid JSON format."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 100,
      response_format: { type: "json_object" }
    })

    const jsonText = response.choices[0]?.message?.content || "{}"
    return JSON.parse(jsonText) as RealtimeFeedback
  } catch (error) {
    // Fail silently to not interrupt the chat flow
    console.error("Realtime feedback error:", error)
    return null
  }
}

export const getCoachSuggestion = async (
  conversation: Message[]
): Promise<{ reason: string; suggestion: string } | null> => {
  if (!openai) return null

  const conversationText = conversation
    .filter((msg) => msg.sender !== "system")
    .map((msg) => `${msg.sender === "user" ? "나" : "상대"}: ${msg.text}`)
    .join("\n")

  const prompt = `
    당신은 세계 최고의 연애 코치입니다. 사용자는 AI 페르소나와 대화 연습을 하다가 다음에 무슨 말을 할지 막힌 상황입니다.
    아래 대화 내용을 분석하여, 사용자가 자연스럽게 대화를 이어갈 수 있도록 도움이 되는 제안을 해주세요.
    왜 이 제안이 좋은지에 대한 이유와 함께, 실제 사용할 수 있는 메시지를 제안해야 합니다.
    
    --- 현재까지의 대화 ---
    ${conversationText}
    --------------------

    사용자가 보낸 마지막 메시지 이후로 대화가 막혔습니다. 
    
    다음 JSON 형식으로 응답해주세요:
    {
      "reason": "사용자가 왜 막혔는지, 이 제안이 왜 좋은지에 대한 간단한 이유 (한국어, 1-2 문장)",
      "suggestion": "사용자가 다음으로 보낼 수 있는 구체적인 메시지 제안 (한국어)"
    }
    `

  try {
    const response = await openai.chat.completions.create({
      model: defaultModel,
      messages: [
        {
          role: "system",
          content: "You are an expert dating coach helping users with conversation skills. Always respond in valid JSON format."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      response_format: { type: "json_object" }
    })

    const jsonText = response.choices[0]?.message?.content || "{}"
    return JSON.parse(jsonText)
  } catch (error) {
    console.error("Error getting coach suggestion:", error)
    return null
  }
}

export const getStylingAdvice = async (
  prompt: string
): Promise<{ text: string; imageUrl: string | null }> => {
  if (!openai) {
    return {
      text: "AI 스타일링 기능이 비활성화되었습니다. API 키를 설정해주세요.",
      imageUrl: null
    }
  }

  try {
    // Get styling advice text
    const textResponse = await openai.chat.completions.create({
      model: defaultModel,
      messages: [
        {
          role: "system",
          content: "You are a professional fashion stylist. Provide styling advice that is specific, encouraging, and easy to understand. Respond in Korean."
        },
        {
          role: "user",
          content: `Provide styling advice for the following request: "${prompt}"`
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    })

    const adviceText = textResponse.choices[0]?.message?.content || "스타일링 조언을 생성할 수 없습니다."

    // Generate image using DALL-E 3
    try {
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Fashion photography of a full-body outfit for: ${prompt}. Clean, bright, modern style. Show a person wearing the clothes. Professional fashion magazine style.`,
        n: 1,
        size: "1024x1792", // Tall format for fashion
        quality: "standard",
        style: "natural"
      })

      const imageUrl = imageResponse.data[0]?.url || null
      return { text: adviceText, imageUrl }
    } catch (imageError) {
      console.error("Error generating image:", imageError)
      // Return text advice even if image generation fails
      return { text: adviceText, imageUrl: null }
    }
  } catch (error) {
    console.error("Error getting styling advice:", error)
    return { text: "스타일링 추천 중 오류가 발생했습니다.", imageUrl: null }
  }
}

// Clean up chat sessions periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  const maxAge = 1000 * 60 * 60 // 1 hour
  
  // Note: In a real app, you'd track last access time for each session
  // For now, we'll just clear all sessions if there are too many
  if (chatSessions.size > 100) {
    const toDelete = chatSessions.size - 50
    const keys = Array.from(chatSessions.keys())
    for (let i = 0; i < toDelete; i++) {
      chatSessions.delete(keys[i])
    }
  }
}, 1000 * 60 * 10) // Every 10 minutes