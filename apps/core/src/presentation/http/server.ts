import Fastify from 'fastify'
import { registerRoutes, RouteDependencies } from './routes'

export function buildHttpServer(deps: RouteDependencies) {
  const server = Fastify({ logger: false })
  
  server.addHook('onRequest', async (req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*')
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method === 'OPTIONS') {
      return reply.status(204).send()
    }
  })

  registerRoutes(server, deps)
  return server
}
