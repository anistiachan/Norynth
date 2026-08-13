import { IConversationRepository } from '../../../application/abstractions/persistence/IConversationRepository'
import { Conversation } from '../../../domain/entities/Conversation'
import { prisma } from '../prisma'

export class PrismaConversationRepository implements IConversationRepository {
  async findByExternalChatId(externalChatId: string): Promise<Conversation | null> {
    const record = await prisma.conversation.findUnique({
      where: { externalChatId },
    })

    if (!record) return null

    return new Conversation(
      record.id,
      record.userId,
      record.externalChatId,
      record.title || '',
      record.createdAt,
      record.updatedAt
    )
  }

  async create(conversation: Conversation): Promise<Conversation> {
    const record = await prisma.conversation.create({
      data: {
        id: conversation.id,
        userId: conversation.userId,
        externalChatId: conversation.externalChatId,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    })

    return new Conversation(
      record.id,
      record.userId,
      record.externalChatId,
      record.title || '',
      record.createdAt,
      record.updatedAt
    )
  }

  async findByUserId(userId: string): Promise<Conversation[]> {
    const records = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })

    return records.map(
      (record) =>
        new Conversation(
          record.id,
          record.userId,
          record.externalChatId,
          record.title || '',
          record.createdAt,
          record.updatedAt
        )
    )
  }
}
