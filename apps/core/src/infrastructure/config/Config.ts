import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config()

export class Config {
  static readonly nodeEnv = process.env.NODE_ENV || 'development'
  static readonly port = Number(process.env.PORT || '3000')
  static readonly databaseUrl = process.env.DATABASE_URL || 'file:./data/hermes.db'

  static readonly telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || ''
  static readonly nineRouterBaseUrl = process.env.NINEROUTER_BASE_URL || 'https://api.9router.ai/v1'
  static readonly nineRouterApiKey = process.env.NINEROUTER_API_KEY || ''
  static readonly nineRouterModel = process.env.NINEROUTER_MODEL || 'gemini-2.5-flash'

  static readonly signalApiUrl = process.env.SIGNAL_API_URL || 'http://localhost:8080'
  static readonly signalPhoneNumber = process.env.SIGNAL_PHONE_NUMBER || ''
  static readonly signalPollIntervalMs = Number(process.env.SIGNAL_POLL_INTERVAL_MS || '5000')

  static readonly aiMaxHistoryMessages = Number(process.env.AI_MAX_HISTORY_MESSAGES || '20')
  static readonly aiTemperature = Number(process.env.AI_TEMPERATURE || '0.7')
  static readonly aiMaxTokens = Number(process.env.AI_MAX_TOKENS || '2048')

  static readonly systemPrompt = process.env.SYSTEM_PROMPT || 
    'You are Hermes, a personal AI assistant. Your role is to assist the user with software engineering, learning, planning, research, personal productivity.'

  static validate(): void {
    if (!this.nineRouterApiKey) {
      throw new Error('NINEROUTER_API_KEY environment variable is required.')
    }
  }
}
