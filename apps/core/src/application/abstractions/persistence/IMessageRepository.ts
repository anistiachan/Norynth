import { Message } from '../../../domain/entities/Message'

export interface IMessageRepository {
  findRecentByConversationId(conversationId: string, limit: number): Promise<Message[]>
  create(message: Message): Promise<Message>
}
