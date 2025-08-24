import { openai, defaultModel, imageModel } from '../../../shared/infra/openai.js';
import { AppError } from '../../../shared/errors/AppError.js';

export class StylingService {
  async getStylingAdvice(
    prompt: string
  ): Promise<{ text: string; imageUrl: string | null }> {
    try {
      // Get styling advice text
      const textResponse = await openai.chat.completions.create({
        model: defaultModel,
        messages: [
          {
            role: 'system',
            content: 'You are a professional fashion stylist. Provide styling advice that is specific, encouraging, and easy to understand. Respond in Korean.'
          },
          {
            role: 'user',
            content: `Provide styling advice for the following request: "${prompt}"`
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      });

      const adviceText = textResponse.choices[0]?.message?.content || 
        '스타일링 조언을 생성할 수 없습니다.';

      // Generate image using DALL-E 3
      let imageUrl: string | null = null;
      
      try {
        const imageResponse = await openai.images.generate({
          model: imageModel,
          prompt: `Fashion photography of a full-body outfit for: ${prompt}. Clean, bright, modern style. Show a person wearing the clothes. Professional fashion magazine style.`,
          n: 1,
          size: '1024x1792', // Tall format for fashion
          quality: 'standard',
          style: 'natural'
        });

        imageUrl = imageResponse.data?.[0]?.url || null;
      } catch (imageError) {
        console.error('Error generating image:', imageError);
        // Return text advice even if image generation fails
      }

      return { text: adviceText, imageUrl };
    } catch (error) {
      throw AppError.internal('Failed to get styling advice', error);
    }
  }
}