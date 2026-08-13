import { IUserRepository } from '../../abstractions/persistence/IUserRepository'
import { IConversationRepository } from '../../abstractions/persistence/IConversationRepository'
import { Conversation } from '../../../domain/entities/Conversation'

export interface ListConversationsQuery {
  externalUserId: string
}

export class ListConversations {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(query: ListConversationsQuery): Promise<Conversation[]> {
    const user = await this.userRepository.findByExternalId(query.externalUserId)
    if (!user) {
      return []
    }
    return this.conversationRepository.findByUserId(user.id)
  }
}
