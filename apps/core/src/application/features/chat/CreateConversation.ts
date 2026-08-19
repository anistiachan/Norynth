import crypto from 'node:crypto'
import { IUserRepository } from '../../abstractions/persistence/IUserRepository'
import { IConversationRepository } from '../../abstractions/persistence/IConversationRepository'
import { User } from '../../../domain/entities/User'
import { Conversation } from '../../../domain/entities/Conversation'

export interface CreateConversationCommand {
  externalUserId: string
  externalChatId: string
  title?: string
  emoji?: string
  systemPrompt?: string
}

export class CreateConversation {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(command: CreateConversationCommand): Promise<Conversation> {
    let user = await this.userRepository.findByExternalId(command.externalUserId)
    if (!user) {
      user = new User(
        crypto.randomUUID(),
        command.externalUserId,
        'Unknown',
        new Date(),
        new Date()
      )
      await this.userRepository.create(user)
    }

    let conversation = await this.conversationRepository.findByExternalChatId(command.externalChatId)
    if (!conversation) {
      conversation = new Conversation(
        crypto.randomUUID(),
        user.id,
        command.externalChatId,
        command.title || null,
        command.emoji || '💬',
        command.systemPrompt || null,
        new Date(),
        new Date()
      )
      await this.conversationRepository.create(conversation)
    }

    return conversation
  }
}
