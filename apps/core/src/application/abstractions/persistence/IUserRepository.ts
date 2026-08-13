import { User } from '../../../domain/entities/User'

export interface IUserRepository {
  findByExternalId(externalUserId: string): Promise<User | null>
  create(user: User): Promise<User>
}
