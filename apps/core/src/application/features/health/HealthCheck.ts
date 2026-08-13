export interface HealthReport {
  status: 'ok' | 'degraded' | 'error'
  checks: {
    database: 'ok' | 'down'
    aiGateway: 'ok' | 'down'
  }
}

export class HealthCheck {
  constructor(
    private readonly databasePing: () => Promise<void>,
    private readonly aiGatewayPing: () => Promise<void>,
  ) {}

  async execute(): Promise<HealthReport> {
    const database = await this.ping(this.databasePing)
    const aiGateway = await this.ping(this.aiGatewayPing)

    const status = database === 'ok' && aiGateway === 'ok' ? 'ok' : 'degraded'

    return {
      status,
      checks: {
        database,
        aiGateway,
      },
    }
  }

  private async ping(fn: () => Promise<void>): Promise<'ok' | 'down'> {
    try {
      await fn()
      return 'ok'
    } catch {
      return 'down'
    }
  }
}
