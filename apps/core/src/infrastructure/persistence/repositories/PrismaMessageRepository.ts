import { IMessageRepository } from '../../../application/abstractions/persistence/IMessageRepository'
import { Message } from '../../../domain/entities/Message'
import { MessageRole } from '../../../domain/enums/MessageRole'
import { prisma } from '../prisma'

export class PrismaMessageRepository implements IMessageRepository {
  async findRecentByConversationId(conversationId: string, limit: number): Promise<Message[]> {
    const records = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return records.map((record) => {
      let role = MessageRole.USER
      if (record.role === 'ASSISTANT') role = MessageRole.ASSISTANT
      if (record.role === 'SYSTEM') role = MessageRole.SYSTEM

      return new Message(
        record.id,
        record.conversationId,
        role,
        record.content,
        record.provider,
        record.model,
        record.createdAt
      )
    })
  }

  async create(message: Message): Promise<Message> {
    const record = await prisma.message.create({
      data: {
        id: message.id,
        conversationId: message.conversationId,
        role: message.role.toString(),
        content: message.content,
        provider: message.provider,
        model: message.model,
        createdAt: message.createdAt,
      },
    })

    let role = MessageRole.USER
    if (record.role === 'ASSISTANT') role = MessageRole.ASSISTANT
    if (record.role === 'SYSTEM') role = MessageRole.SYSTEM

    return new Message(
      record.id,
      record.conversationId,
      role,
      record.content,
      record.provider,
      record.model,
      record.createdAt
    )
  }
}
