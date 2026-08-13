import { prisma } from './infrastructure/persistence/prisma'
import { Config } from './infrastructure/config/Config'
import { PrismaUserRepository } from './infrastructure/persistence/repositories/PrismaUserRepository'
import { PrismaConversationRepository } from './infrastructure/persistence/repositories/PrismaConversationRepository'
import { PrismaMessageRepository } from './infrastructure/persistence/repositories/PrismaMessageRepository'
import { NineRouterAIProvider } from './infrastructure/ai/NineRouterAIProvider'
import { TelegramMessageGateway } from './infrastructure/messaging/telegram/TelegramMessageGateway'
import { SendMessage } from './application/features/chat/SendMessage'
import { GetConversation } from './application/features/chat/GetConversation'
import { ListConversations } from './application/features/chat/ListConversations'
import { CreateConversation } from './application/features/chat/CreateConversation'
import { HealthCheck } from './application/features/health/HealthCheck'
import { buildHttpServer } from './presentation/http/server'
import { TelegramBot } from './presentation/telegram/TelegramBot'
import { SignalMessageGateway } from './infrastructure/messaging/signal/SignalMessageGateway'
import { Logger } from './shared/logging/Logger'
import { Telegraf } from 'telegraf'

async function main(): Promise<void> {
  Config.validate()

  const logger = new Logger(Config.nodeEnv === 'production' ? 'info' : 'debug')
  logger.info('HermesStarting', {
    nodeEnv: Config.nodeEnv,
    port: Config.port,
    aiModel: Config.nineRouterModel,
  })

  const userRepository = new PrismaUserRepository()
  const conversationRepository = new PrismaConversationRepository()
  const messageRepository = new PrismaMessageRepository()

  const aiProvider = new NineRouterAIProvider(
    Config.nineRouterBaseUrl,
    Config.nineRouterApiKey,
    Config.nineRouterModel,
    Config.aiTemperature,
    Config.aiMaxTokens,
    logger
  )

  const sendMessage = new SendMessage(
    userRepository,
    conversationRepository,
    messageRepository,
    aiProvider,
    Config.systemPrompt,
    Config.aiMaxHistoryMessages
  )

  const getConversation = new GetConversation(
    userRepository,
    conversationRepository,
    messageRepository
  )

  const listConversations = new ListConversations(
    userRepository,
    conversationRepository
  )

  const createConversation = new CreateConversation(
    userRepository,
    conversationRepository
  )

  const healthCheck = new HealthCheck(
    async () => {
      await prisma.$queryRaw`SELECT 1`
    },
    async () => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 2000)
      try {
        const response = await fetch(Config.nineRouterBaseUrl, { signal: controller.signal })
        if (!response.ok && response.status >= 500) {
          throw new Error(`9Router returned ${response.status}`)
        }
      } finally {
        clearTimeout(timer)
      }
    }
  )

  const telegraf = new Telegraf(Config.telegramBotToken || 'mock_telegram_bot_token')
  const messageGateway = new TelegramMessageGateway(telegraf, logger)

  const server = buildHttpServer({
    sendMessage,
    getConversation,
    listConversations,
    createConversation,
    healthCheck,
    logger,
  })

  let telegramBot: TelegramBot | undefined
  if (Config.telegramBotToken && Config.telegramBotToken !== 'mock_telegram_bot_token') {
    telegramBot = new TelegramBot({
      botToken: Config.telegramBotToken,
      sendMessage,
      messageGateway,
      logger,
    })
    telegramBot.launch()
      .then(() => logger.info('TelegramBotStarted'))
      .catch((err) => logger.error('TelegramBotFailedToStart', { error: err instanceof Error ? err.message : String(err) }))
  } else {
    logger.info('TelegramBotSkipped', { reason: 'No token provided' })
  }

  let signalGateway: SignalMessageGateway | undefined
  if (Config.signalPhoneNumber) {
    signalGateway = new SignalMessageGateway(
      Config.signalApiUrl,
      Config.signalPhoneNumber,
      Config.signalPollIntervalMs,
      sendMessage,
      logger
    )
    signalGateway.startPolling()
    logger.info('SignalGatewayStarted')
  } else {
    logger.info('SignalGatewaySkipped', { reason: 'No phone number configured' })
  }

  await server.listen({ port: Config.port, host: '0.0.0.0' })
  logger.info('HttpServerStarted', { port: Config.port })

  const shutdown = async (signal: string): Promise<void> => {
    logger.info('ShutdownStarted', { signal })
    await server.close()
    if (telegramBot) {
      await telegramBot.stop()
    }
    if (signalGateway) {
      signalGateway.stopPolling()
    }
    await prisma.$disconnect()
    logger.info('ShutdownComplete')
    process.exit(0)
  }

  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`Fatal startup error: ${message}`)
  process.exit(1)
})
