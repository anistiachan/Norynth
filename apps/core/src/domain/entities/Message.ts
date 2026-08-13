import { MessageRole } from '../enums/MessageRole'

export class Message {
  constructor(
    readonly id: string,
    readonly conversationId: string,
    readonly role: MessageRole,
    readonly content: string,
    readonly provider: string | null,
    readonly model: string | null,
    readonly createdAt: Date,
  ) {}
}
