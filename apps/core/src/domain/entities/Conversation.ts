export class Conversation {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly externalChatId: string,
    readonly title: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}
