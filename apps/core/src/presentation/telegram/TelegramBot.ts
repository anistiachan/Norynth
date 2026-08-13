import { Telegraf } from 'telegraf'
import { SendMessage } from '../../application/features/chat/SendMessage'
import { IMessageGateway } from '../../application/abstractions/messaging/IMessageGateway'
import { Logger } from '../../shared/logging/Logger'

export interface TelegramBotOptions {
  botToken: string
  sendMessage: SendMessage
  messageGateway: IMessageGateway
  logger: Logger
}

export class TelegramBot {
  private readonly bot: Telegraf

  constructor(private readonly options: TelegramBotOptions) {
    this.bot = new Telegraf(options.botToken)
    this.setupHandlers()
  }

  private setupHandlers(): void {
    this.bot.on('message', async (ctx) => {
      const text = 'text' in ctx.message ? ctx.message.text : undefined
      if (!text) return

      const from = ctx.from
      if (!from) return

      const externalUserId = String(from.id)
      const externalChatId = String(ctx.chat.id)
      const displayName = from.first_name || from.username || externalUserId

      this.options.logger.info('MessageReceived', {
        externalUserId,
        externalChatId,
      })

      try {
        const result = await this.options.sendMessage.execute({
          externalUserId,
          externalChatId,
          displayName,
          message: text,
        })

        await this.options.messageGateway.sendMessage(externalChatId, result.response)
      } catch (err: any) {
        this.options.logger.error('SendMessageFailed', {
          externalUserId,
          externalChatId,
          error: err.message,
        })
        await this.options.messageGateway.sendMessage(
          externalChatId,
          'Sorry, something went wrong processing your message. Please try again.'
        )
      }
    })
  }

  async launch(): Promise<void> {
    await this.bot.launch()
  }

  async stop(): Promise<void> {
    this.bot.stop()
  }
}
