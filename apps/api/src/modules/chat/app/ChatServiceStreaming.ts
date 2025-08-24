import { openai, defaultModel } from '../../../shared/infra/openai.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { supabase } from '../../../config/supabase.js';
import type { ChatCompletionMessageParam } from 'openai/resources/index.js';
import { Response } from 'express';

export class ChatServiceStreaming {
  async streamMessage(
    sessionId: string,
    message: string,
    systemInstruction: string,
    previousMessages: Array<{ role: 'user' | 'assistant'; content: string }>,
    res: Response
  ): Promise<void> {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Save user message to database
    await supabase
      .from('messages')
      .insert({
        conversation_id: sessionId,
        sender: 'user',
        content: message,
        sent_at: new Date().toISOString()
      });

    // Prepare messages for OpenAI
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `${systemInstruction} Keep your responses concise, natural, and engaging, like a real chat conversation.`
      },
      ...previousMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    try {
      const stream = await openai.chat.completions.create({
        model: defaultModel,
        messages,
        temperature: 0.8,
        max_tokens: 500,
        stream: true
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          // Send SSE event
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Save AI message to database
      await supabase
        .from('messages')
        .insert({
          conversation_id: sessionId,
          sender: 'ai',
          content: fullResponse,
          sent_at: new Date().toISOString()
        });

      // Send completion event
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error('Streaming error:', error);
      res.write(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`);
      res.end();
    }
  }
}