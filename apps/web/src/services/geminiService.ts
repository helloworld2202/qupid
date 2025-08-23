import { GoogleGenAI, GenerateContentResponse, Chat, Type } from "@google/genai"
import { Message, ConversationAnalysis, RealtimeFeedback } from "@qupid/core"

// Use a placeholder if the API_KEY is not set in the environment.
// This prevents the app from crashing on startup but AI features will not work.
const apiKey = process.env.API_KEY
if (!apiKey) {
  console.warn(
    "API_KEY environment variable not set. " +
      "Using a placeholder. AI functionality will be disabled. " +
      "Please provide your Google Gemini API key."
  )
}

const ai = new GoogleGenAI({ apiKey: apiKey || "YOUR_API_KEY_PLACEHOLDER" })
const chatModel = "gemini-2.5-flash"
const imageModel = "imagen-3.0-generate-002"

export const createChatSession = (systemInstruction: string): Chat => {
  return ai.chats.create({
    model: chatModel,
    config: {
      systemInstruction: `${systemInstruction} Keep your responses concise, natural, and engaging, like a real chat conversation.`
    }
  })
}

export const sendMessageToAI = async (
  chat: Chat,
  message: string
): Promise<string> => {
  if (!apiKey) {
    return Promise.resolve(
      "AI 기능이 비활성화되었습니다. API 키를 설정해주세요."
    )
  }
  try {
    const response: GenerateContentResponse = await chat.sendMessage({
      message
    })
    return response.text
  } catch (error) {
    console.error("Error sending message to AI:", error)
    return "죄송해요, 지금은 답변하기 어렵네요. 잠시 후 다시 시도해주세요."
  }
}

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    totalScore: {
      type: Type.INTEGER,
      description: "대화 전체에 대한 100점 만점의 종합 점수"
    },
    feedback: {
      type: Type.STRING,
      description: "대화 전체에 대한 한 줄 요약 피드백"
    },
    friendliness: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: "친근함 항목 점수 (1-100)" },
        feedback: {
          type: Type.STRING,
          description: "친근함에 대한 구체적인 피드백"
        }
      }
    },
    curiosity: {
      type: Type.OBJECT,
      properties: {
        score: {
          type: Type.INTEGER,
          description: "호기심(질문) 항목 점수 (1-100)"
        },
        feedback: {
          type: Type.STRING,
          description: "호기심(질문)에 대한 구체적인 피드백"
        }
      }
    },
    empathy: {
      type: Type.OBJECT,
      properties: {
        score: {
          type: Type.INTEGER,
          description: "공감 능력 항목 점수 (1-100)"
        },
        feedback: {
          type: Type.STRING,
          description: "공감 능력에 대한 구체적인 피드백"
        }
      }
    },
    positivePoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "대화에서 잘한 점 2~3가지"
    },
    pointsToImprove: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: {
            type: Type.STRING,
            description: "개선할 점의 주제 (예: 질문 방식)"
          },
          suggestion: {
            type: Type.STRING,
            description: "구체적인 개선 방안 및 예시"
          }
        }
      },
      description: "개선할 점 1~2가지와 구체적인 제안"
    }
  }
}

export const analyzeConversation = async (
  conversation: Message[]
): Promise<ConversationAnalysis | null> => {
  if (!apiKey) return null
  const conversationText = conversation
    .map((msg) => `${msg.sender === "user" ? "나" : "상대"}: ${msg.text}`)
    .join("\n")
  const prompt = `
    다음은 사용자와 AI 페르소나 간의 소개팅 대화입니다. 사용자의 대화 스킬을 '친근함', '호기심(질문)', '공감' 세 가지 기준으로 분석하고, 종합 점수와 함께 구체적인 피드백을 JSON 형식으로 제공해주세요. 결과는 친절하고 격려하는 톤으로 작성해주세요.

    --- 대화 내용 ---
    ${conversationText}
    --- 분석 시작 ---
    `

  try {
    const response = await ai.models.generateContent({
      model: chatModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema
      }
    })

    const jsonText = response.text.trim()
    const analysisResult = JSON.parse(jsonText)
    return analysisResult as ConversationAnalysis
  } catch (error) {
    console.error("Error analyzing conversation:", error)
    return null
  }
}

const feedbackSchema = {
  type: Type.OBJECT,
  properties: {
    isGood: { type: Type.BOOLEAN, description: "사용자의 말이 긍정적인가?" },
    message: { type: Type.STRING, description: "10자 이내의 짧은 격려 또는 팁" }
  }
}

export const getRealtimeFeedback = async (
  lastUserMessage: string,
  lastAiMessage: string | undefined
): Promise<RealtimeFeedback | null> => {
  if (!apiKey) return null
  const prompt = `
    A user is in a dating conversation. Here is their last message and the AI's response to it.
    AI's last message: "${lastAiMessage || "대화 시작"}"
    User's message: "${lastUserMessage}"
    
    Analyze the user's message in context. Is it a good message (e.g., good question, good reaction, showing interest)? 
    Provide a very short, encouraging feedback or a tip in Korean (max 15 characters).
    Return the analysis in JSON format.
    Example of good feedback: "좋은 질문이에요! 👍", "공감가는 말이네요! 😊"
    Example of a tip: "다른 주제로 넘어가볼까요? 💡", "질문으로 답해보세요! 🤔"
    `

  // Only provide feedback occasionally to avoid annoyance
  if (Math.random() > 0.4) {
    return null
  }

  try {
    const response = await ai.models.generateContent({
      model: chatModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: feedbackSchema,
        thinkingConfig: { thinkingBudget: 0 } // For low latency
      }
    })
    const jsonText = response.text.trim()
    return JSON.parse(jsonText) as RealtimeFeedback
  } catch (error) {
    // Fail silently to not interrupt the chat flow
    console.error("Realtime feedback error:", error)
    return null
  }
}

const coachSuggestionSchema = {
  type: Type.OBJECT,
  properties: {
    reason: {
      type: Type.STRING,
      description:
        "사용자가 왜 막혔는지, 이 제안이 왜 좋은지에 대한 간단한 이유 (한국어, 1-2 문장)"
    },
    suggestion: {
      type: Type.STRING,
      description:
        "사용자가 다음으로 보낼 수 있는 구체적인 메시지 제안 (한국어)"
    }
  },
  required: ["reason", "suggestion"]
}

export const getCoachSuggestion = async (
  conversation: Message[]
): Promise<{ reason: string; suggestion: string } | null> => {
  if (!apiKey) return null

  const conversationText = conversation
    .filter((msg) => msg.sender !== "system")
    .map((msg) => `${msg.sender === "user" ? "나" : "상대"}: ${msg.text}`)
    .join("\n")

  const prompt = `
    당신은 세계 최고의 연애 코치입니다. 사용자는 AI 페르소나와 대화 연습을 하다가 다음에 무슨 말을 할지 막힌 상황입니다.
    아래 대화 내용을 분석하여, 사용자가 자연스럽게 대화를 이어갈 수 있도록 도움이 되는 제안을 해주세요.
    왜 이 제안이 좋은지에 대한 이유와 함께, 실제 사용할 수 있는 메시지를 제안해야 합니다.
    응답은 반드시 JSON 형식이어야 합니다.

    --- 현재까지의 대화 ---
    ${conversationText}
    --------------------

    사용자가 보낸 마지막 메시지 이후로 대화가 막혔습니다. 사용자를 위해 이유와 제안을 JSON으로 제공해주세요.
    `

  try {
    const response = await ai.models.generateContent({
      model: chatModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: coachSuggestionSchema
      }
    })
    const jsonText = response.text.trim()
    return JSON.parse(jsonText)
  } catch (error) {
    console.error("Error getting coach suggestion:", error)
    return null
  }
}

export const getStylingAdvice = async (
  prompt: string
): Promise<{ text: string; imageUrl: string | null }> => {
  if (!apiKey) {
    return {
      text: "AI 스타일링 기능이 비활성화되었습니다. API 키를 설정해주세요.",
      imageUrl: null
    }
  }
  try {
    const textResponse = await ai.models.generateContent({
      model: chatModel,
      contents: `You are a professional fashion stylist. Provide styling advice for the following request. Be specific, encouraging, and easy to understand. Request: "${prompt}"`
    })
    const adviceText = textResponse.text

    const imageResponse = await ai.models.generateImages({
      model: imageModel,
      prompt: `Fashion photography of a full-body outfit for: ${prompt}. Clean, bright, modern style. Show a person wearing the clothes.`,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: "3:4"
      }
    })

    const base64ImageBytes: string =
      imageResponse.generatedImages[0].image.imageBytes
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`

    return { text: adviceText, imageUrl }
  } catch (error) {
    console.error("Error getting styling advice:", error)
    return { text: "스타일링 추천 중 오류가 발생했습니다.", imageUrl: null }
  }
}
