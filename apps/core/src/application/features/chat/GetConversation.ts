import { IUserRepository } from '../../abstractions/persistence/IUserRepository'
import { IConversationRepository } from '../../abstractions/persistence/IConversationRepository'
import { IMessageRepository } from '../../abstractions/persistence/IMessageRepository'
import { Message } from '../../../domain/entities/Message'

export interface GetConversationQuery {
  externalUserId: string
  externalChatId: string
  limit: number
}

export class GetConversation {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(query: GetConversationQuery): Promise<Message[]> {
    const user = await this.userRepository.findByExternalId(query.externalUserId)
    if (!user) {
      return []
    }

    const conversation = await this.conversationRepository.findByExternalChatId(query.externalChatId)
    if (!conversation) {
      return []
    }

    const messages = await this.messageRepository.findRecentByConversationId(conversation.id, query.limit)
    return messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }
}
