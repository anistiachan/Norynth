import crypto from 'node:crypto'
import { IUserRepository } from '../../abstractions/persistence/IUserRepository'
import { IConversationRepository } from '../../abstractions/persistence/IConversationRepository'
import { IMessageRepository } from '../../abstractions/persistence/IMessageRepository'
import { IAIProvider, AIMessage } from '../../abstractions/ai/IAIProvider'
import { User } from '../../../domain/entities/User'
import { Conversation } from '../../../domain/entities/Conversation'
import { Message } from '../../../domain/entities/Message'
import { MessageRole } from '../../../domain/enums/MessageRole'

export interface SendMessageCommand {
  externalUserId: string
  externalChatId: string
  displayName?: string
  message: string
}

export interface SendMessageResult {
  response: string
}

export class SendMessage {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly aiProvider: IAIProvider,
    private readonly systemPrompt: string,
    private readonly maxHistoryMessages: number,
  ) {}

  async execute(command: SendMessageCommand): Promise<SendMessageResult> {
    // 1. Find/Create User
    let user = await this.userRepository.findByExternalId(command.externalUserId)
    if (!user) {
      user = new User(
        crypto.randomUUID(),
        command.externalUserId,
        command.displayName || 'Unknown',
        new Date(),
        new Date()
      )
      await this.userRepository.create(user)
    }

    // 2. Find/Create Conversation
    let conversation = await this.conversationRepository.findByExternalChatId(command.externalChatId)
    if (!conversation) {
      conversation = new Conversation(
        crypto.randomUUID(),
        user.id,
        command.externalChatId,
        null,
        new Date(),
        new Date()
      )
      await this.conversationRepository.create(conversation)
    }

    // 3. Save User Message
    const userMessage = new Message(
      crypto.randomUUID(),
      conversation.id,
      MessageRole.USER,
      command.message,
      null,
      null,
      new Date()
    )
    await this.messageRepository.create(userMessage)

    // 4. Load recent messages
    const recentMessages = await this.messageRepository.findRecentByConversationId(
      conversation.id,
      this.maxHistoryMessages
    )

    // Sort ascending for chronological order, because findRecent might return latest first
    recentMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    // 5. Build AI request
    const aiMessages: AIMessage[] = recentMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    // Determine system prompt based on chat topic
    let topicPrompt = this.systemPrompt
    if (command.externalChatId.endsWith('-coding')) {
      topicPrompt = 'You are a Senior Software Engineer. Help the user write, debug, and understand code. Give clear, concise explanations and code examples.'
    } else if (command.externalChatId.endsWith('-learning')) {
      topicPrompt = 'You are an expert tutor. Guide the user step-by-step to learn complex concepts, using simple analogies and quiz questions.'
    } else if (command.externalChatId.endsWith('-planning')) {
      topicPrompt = 'You are a productivity advisor. Help the user prioritize, outline action steps, and schedule plans for their projects.'
    }

    // 6. Call AI Provider
    const aiResponse = await this.aiProvider.generate({
      systemPrompt: topicPrompt,
      messages: aiMessages,
    })

    // 7. Save Assistant Message
    const assistantMessage = new Message(
      crypto.randomUUID(),
      conversation.id,
      MessageRole.ASSISTANT,
      aiResponse.content,
      aiResponse.provider,
      aiResponse.model,
      new Date()
    )
    await this.messageRepository.create(assistantMessage)

    // 8. Return response
    return {
      response: aiResponse.content,
    }
  }
}
