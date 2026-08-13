import { test, mock } from 'node:test'
import assert from 'node:assert'
import { SendMessage, SendMessageCommand } from '../../src/application/features/chat/SendMessage'
import { IUserRepository } from '../../src/application/abstractions/persistence/IUserRepository'
import { IConversationRepository } from '../../src/application/abstractions/persistence/IConversationRepository'
import { IMessageRepository } from '../../src/application/abstractions/persistence/IMessageRepository'
import { IAIProvider, AIRequest, AIResponse } from '../../src/application/abstractions/ai/IAIProvider'
import { User } from '../../src/domain/entities/User'
import { Conversation } from '../../src/domain/entities/Conversation'
import { Message } from '../../src/domain/entities/Message'
import { MessageRole } from '../../src/domain/enums/MessageRole'

test('SendMessage use case handles chat flow correctly', async () => {
  const users: User[] = []
  const conversations: Conversation[] = []
  const messages: Message[] = []

  const mockUserRepo: IUserRepository = {
    async findByExternalId(id) {
      return users.find((u) => u.externalUserId === id) || null
    },
    async create(user) {
      users.push(user)
      return user
    },
  }

  const mockConvRepo: IConversationRepository = {
    async findByExternalChatId(id) {
      return conversations.find((c) => c.externalChatId === id) || null
    },
    async create(conv) {
      conversations.push(conv)
      return conv
    },
  }

  const mockMsgRepo: IMessageRepository = {
    async findRecentByConversationId(id, limit) {
      return messages.filter((m) => m.conversationId === id).slice(-limit)
    },
    async create(msg) {
      messages.push(msg)
      return msg
    },
  }

  const mockAIProvider: IAIProvider = {
    async generate(req: AIRequest): Promise<AIResponse> {
      assert.strictEqual(req.systemPrompt, 'System Prompt')
      assert.strictEqual(req.messages.length, 1)
      assert.strictEqual(req.messages[0].content, 'Hello Hermes')
      return {
        content: 'Hello! How can I help?',
        provider: 'MockProvider',
        model: 'MockModel',
      }
    },
  }

  const useCase = new SendMessage(
    mockUserRepo,
    mockConvRepo,
    mockMsgRepo,
    mockAIProvider,
    'System Prompt',
    10
  )

  const command: SendMessageCommand = {
    externalUserId: 'user-123',
    externalChatId: 'chat-456',
    displayName: 'Ahmad',
    message: 'Hello Hermes',
  }

  const result = await useCase.execute(command)

  assert.strictEqual(result.response, 'Hello! How can I help?')

  assert.strictEqual(users.length, 1)
  assert.strictEqual(users[0].externalUserId, 'user-123')
  assert.strictEqual(users[0].displayName, 'Ahmad')

  assert.strictEqual(conversations.length, 1)
  assert.strictEqual(conversations[0].externalChatId, 'chat-456')

  // We should have 2 stored messages: USER and ASSISTANT
  assert.strictEqual(messages.length, 2)
  assert.strictEqual(messages[0].role, MessageRole.USER)
  assert.strictEqual(messages[0].content, 'Hello Hermes')
  assert.strictEqual(messages[1].role, MessageRole.ASSISTANT)
  assert.strictEqual(messages[1].content, 'Hello! How can I help?')
})
