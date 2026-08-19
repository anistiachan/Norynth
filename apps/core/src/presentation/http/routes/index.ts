import { FastifyInstance } from 'fastify'
import { SendMessage } from '../../../application/features/chat/SendMessage'
import { GetConversation } from '../../../application/features/chat/GetConversation'
import { ListConversations } from '../../../application/features/chat/ListConversations'
import { CreateConversation } from '../../../application/features/chat/CreateConversation'
import { HealthCheck } from '../../../application/features/health/HealthCheck'
import { Logger } from '../../../shared/logging/Logger'

export interface RouteDependencies {
  sendMessage: SendMessage
  getConversation: GetConversation
  listConversations?: ListConversations
  createConversation?: CreateConversation
  healthCheck: HealthCheck
  logger: Logger
}

export function registerRoutes(server: FastifyInstance, deps: RouteDependencies): void {
  server.get('/', async (_req, reply) => {
    return reply.send({ name: 'Hermes Core API', status: 'running' })
  })

  server.get('/health', async (_req, reply) => {
    const report = await deps.healthCheck.execute()
    return reply.send({
      ...report,
      uptime: process.uptime(),
    })
  })

  server.get('/api/conversations', async (req, reply) => {
    const query = req.query as { externalUserId?: string }
    const externalUserId = query?.externalUserId || 'web-user'

    if (!deps.listConversations) {
      return reply.code(500).send({ error: 'ListConversations not configured.' })
    }

    const conversations = await deps.listConversations.execute({ externalUserId })
    return reply.send({ conversations })
  })

  server.post('/api/conversations', async (req, reply) => {
    const body = req.body as {
      externalUserId?: string
      externalChatId?: string
      title?: string
      emoji?: string
      systemPrompt?: string
    }
    const externalUserId = body?.externalUserId || 'web-user'
    const externalChatId = body?.externalChatId || ''
    const title = body?.title
    const emoji = body?.emoji
    const systemPrompt = body?.systemPrompt

    if (!externalChatId) {
      return reply.code(400).send({ error: 'externalChatId is required.' })
    }

    if (!deps.createConversation) {
      return reply.code(500).send({ error: 'CreateConversation not configured.' })
    }

    const conversation = await deps.createConversation.execute({
      externalUserId,
      externalChatId,
      title,
      emoji,
      systemPrompt,
    })
    return reply.send({ conversation })
  })

  server.post('/api/chat', async (req, reply) => {
    const body = req.body as {
      externalUserId?: unknown
      externalChatId?: unknown
      message?: unknown
    }

    const externalUserId = typeof body?.externalUserId === 'string' ? body.externalUserId.trim() : ''
    const externalChatId = typeof body?.externalChatId === 'string' ? body.externalChatId.trim() : ''
    const message = typeof body?.message === 'string' ? body.message.trim() : ''

    if (!externalUserId || !externalChatId || !message) {
      return reply.code(400).send({
        error: 'externalUserId, externalChatId, and message are required.',
      })
    }

    const result = await deps.sendMessage.execute({
      externalUserId,
      externalChatId,
      message,
    })

    return reply.send(result)
  })

  server.get('/api/chat/history', async (req, reply) => {
    const query = req.query as {
      externalUserId?: string
      externalChatId?: string
      limit?: string
    }

    const externalUserId = query?.externalUserId || ''
    const externalChatId = query?.externalChatId || ''
    const limit = Number(query?.limit || '20')

    if (!externalUserId || !externalChatId) {
      return reply.code(400).send({
        error: 'externalUserId and externalChatId query parameters are required.',
      })
    }

    const messages = await deps.getConversation.execute({
      externalUserId,
      externalChatId,
      limit,
    })

    return reply.send({ messages })
  })

  server.setErrorHandler((err, _req, reply) => {
    deps.logger.error('HttpError', { error: err instanceof Error ? err.message : String(err) })
    return reply.code(500).send({ error: 'Internal server error.' })
  })
}
