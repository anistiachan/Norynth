import { IMessageGateway } from '../../../application/abstractions/messaging/IMessageGateway'
import { SendMessage } from '../../../application/features/chat/SendMessage'
import { Logger } from '../../../shared/logging/Logger'

export class SignalMessageGateway implements IMessageGateway {
  private pollTimeout?: NodeJS.Timeout
  private isPolling = false

  constructor(
    private readonly apiUrl: string,
    private readonly phoneNumber: string,
    private readonly pollIntervalMs: number,
    private readonly sendMessageUseCase: SendMessage,
    private readonly logger: Logger
  ) {}

  async sendMessage(externalChatId: string, text: string): Promise<void> {
    try {
      const isGroup = externalChatId.startsWith('group.') || !externalChatId.startsWith('+')
      const payload: Record<string, any> = {
        message: text,
        number: this.phoneNumber,
      }

      if (isGroup) {
        payload.base64_recipients = [externalChatId]
      } else {
        payload.recipients = [externalChatId]
      }

      const res = await fetch(`${this.apiUrl}/v2/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Signal API returned status ${res.status}: ${errorText}`)
      }

      this.logger.info('SignalMessageSent', { recipient: externalChatId })
    } catch (error) {
      this.logger.error('SignalSendFailed', {
        error: error instanceof Error ? error.message : String(error),
        recipient: externalChatId,
      })
    }
  }

  startPolling(): void {
    if (!this.phoneNumber) {
      this.logger.info('SignalPollingSkipped', { reason: 'No phone number configured' })
      return;
    }
    this.isPolling = true
    this.logger.info('SignalPollingStarted', { interval: this.pollIntervalMs })
    this.poll()
  }

  stopPolling(): void {
    this.isPolling = false
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout)
    }
    this.logger.info('SignalPollingStopped')
  }

  private async poll(): Promise<void> {
    if (!this.isPolling) return

    try {
      const res = await fetch(`${this.apiUrl}/v1/receive/${this.phoneNumber}`)
      if (res.ok) {
        const messages = (await res.json()) as any[]
        if (Array.isArray(messages)) {
          for (const msg of messages) {
            await this.handleReceivedMessage(msg)
          }
        }
      } else {
        this.logger.error('SignalPollFailed', { status: res.status })
      }
    } catch (error) {
      this.logger.error('SignalPollError', {
        error: error instanceof Error ? error.message : String(error),
      })
    }

    if (this.isPolling) {
      this.pollTimeout = setTimeout(() => this.poll(), this.pollIntervalMs)
    }
  }

  private async handleReceivedMessage(payload: any): Promise<void> {
    const envelope = payload?.envelope
    if (!envelope) return

    const source = envelope.sourceNumber || envelope.source
    const text = envelope.dataMessage?.message
    if (!source || !text) return

    const isGroup = !!envelope.dataMessage?.groupInfo?.groupId
    const externalChatId = isGroup ? envelope.dataMessage.groupInfo.groupId : source
    const displayName = envelope.sourceName || source

    this.logger.info('SignalMessageReceived', { from: source, isGroup })

    try {
      const result = await this.sendMessageUseCase.execute({
        externalUserId: source,
        externalChatId,
        message: text,
      })

      await this.sendMessage(externalChatId, result.response)
    } catch (error) {
      this.logger.error('SignalMessageProcessFailed', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }
}
