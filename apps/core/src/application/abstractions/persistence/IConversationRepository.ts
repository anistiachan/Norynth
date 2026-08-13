import { Conversation } from '../../../domain/entities/Conversation'

export interface IConversationRepository {
  findByExternalChatId(externalChatId: string): Promise<Conversation | null>
  create(conversation: Conversation): Promise<Conversation>
  findByUserId(userId: string): Promise<Conversation[]>
}
