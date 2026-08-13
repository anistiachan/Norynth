export class User {
  constructor(
    readonly id: string,
    readonly externalUserId: string,
    readonly displayName: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}
