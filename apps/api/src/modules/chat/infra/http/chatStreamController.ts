import { Request, Response } from 'express';
import { ChatService } from '../app/ChatService.js';

export class ChatStreamController {
  constructor(private chatService: ChatService) {}

  async streamMessage(req: Request, res: Response) {
    try {
      const { sessionId, message, isCoaching = false } = req.body;

      if (!sessionId || !message) {
        return res.status(400).json({ error: 'SessionId and message are required' });
      }

      // SSE 헤더 설정
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // 스트리밍 시작
      await this.chatService.streamMessage(
        sessionId,
        message,
        (chunk: string) => {
          // SSE 형식으로 데이터 전송
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
      );

      // 스트리밍 완료
      res.write('data: [DONE]\n\n');
      res.end();

    } catch (error) {
      console.error('Streaming error:', error);
      res.write(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`);
      res.end();
    }
  }
}
