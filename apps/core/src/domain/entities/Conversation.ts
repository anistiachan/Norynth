export class Conversation {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly externalChatId: string,
    readonly title: string | null,
    readonly emoji: string | null = '💬',
    readonly systemPrompt: string | null = null,
    readonly createdAt: Date = new Date(),
    readonly updatedAt: Date = new Date(),
  ) {}
}
