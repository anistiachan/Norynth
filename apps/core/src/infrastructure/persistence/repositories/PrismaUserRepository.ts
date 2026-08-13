import { IUserRepository } from '../../../application/abstractions/persistence/IUserRepository'
import { User } from '../../../domain/entities/User'
import { prisma } from '../prisma'

export class PrismaUserRepository implements IUserRepository {
  async findByExternalId(externalUserId: string): Promise<User | null> {
    const record = await prisma.user.findUnique({
      where: { externalUserId },
    })

    if (!record) return null

    return new User(
      record.id,
      record.externalUserId,
      record.displayName || 'Unknown',
      record.createdAt,
      record.updatedAt
    )
  }

  async create(user: User): Promise<User> {
    const record = await prisma.user.create({
      data: {
        id: user.id,
        externalUserId: user.externalUserId,
        displayName: user.displayName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })

    return new User(
      record.id,
      record.externalUserId,
      record.displayName || 'Unknown',
      record.createdAt,
      record.updatedAt
    )
  }
}
