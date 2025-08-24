import { Message } from '@qupid/core';

export class ChatSession {
  private messages: Message[] = [];
  
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly personaId: string,
    public readonly systemInstruction: string,
    public readonly createdAt: Date = new Date()
  ) {}

  addMessage(message: Message): void {
    this.messages.push({
      ...message,
      timestamp: (message as any).timestamp || new Date()
    } as any);
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  getLastUserMessage(): Message | undefined {
    return this.messages
      .filter(m => m.sender === 'user')
      .pop();
  }

  getLastAiMessage(): Message | undefined {
    return this.messages
      .filter(m => m.sender === 'ai')
      .pop();
  }

  getMessageCount(): number {
    return this.messages.length;
  }

  getUserMessageCount(): number {
    return this.messages.filter(m => m.sender === 'user').length;
  }
}