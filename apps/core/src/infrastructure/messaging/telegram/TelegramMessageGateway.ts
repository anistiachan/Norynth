import { Telegraf } from 'telegraf'
import { IMessageGateway } from '../../../application/abstractions/messaging/IMessageGateway'
import { Logger } from '../../../shared/logging/Logger'

export class TelegramMessageGateway implements IMessageGateway {
  constructor(
    private readonly bot: Telegraf,
    private readonly logger?: Logger,
  ) {}

  async sendMessage(externalChatId: string, text: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(externalChatId, text)
    } catch (err: any) {
      this.logger?.error('TelegramSendFailed', { externalChatId, error: err.message })
      throw err
    }
  }
}
