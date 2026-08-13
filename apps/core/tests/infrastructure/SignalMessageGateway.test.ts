import { test, mock } from 'node:test'
import assert from 'node:assert'
import { SignalMessageGateway } from '../../src/infrastructure/messaging/signal/SignalMessageGateway'
import { SendMessage } from '../../src/application/features/chat/SendMessage'
import { Logger } from '../../src/shared/logging/Logger'

test('SignalMessageGateway sends and receives correctly', async () => {
  const logger = new Logger('silent')
  const calls: string[] = []

  const mockSendMessage = {
    execute: async (cmd: any) => {
      calls.push(`usecase:${cmd.message}`)
      return { response: 'Mock response' }
    }
  } as unknown as SendMessage

  // Mock global fetch
  const originalFetch = global.fetch
  global.fetch = async (url: any, options: any) => {
    calls.push(`fetch:${url}`)
    if (url.endsWith('/v2/send')) {
      const body = JSON.parse(options.body)
      calls.push(`send_payload:${body.message}:${body.recipients?.[0] || body.base64_recipients?.[0]}`)
      return { ok: true, text: async () => 'ok' } as any
    }
    if (url.endsWith('/v1/receive/+123456')) {
      return {
        ok: true,
        json: async () => [
          {
            envelope: {
              sourceNumber: '+123456',
              sourceName: 'John',
              dataMessage: {
                message: 'Hello'
              }
            }
          }
        ]
      } as any
    }
    return { ok: false } as any
  }

  try {
    const gateway = new SignalMessageGateway(
      'http://localhost:8080',
      '+123456',
      1000,
      mockSendMessage,
      logger
    )

    // Test send message
    await gateway.sendMessage('+99999', 'Test message')

    // Test receive / poll handling single step manually to avoid setInterval loop
    // Call the private method via type-casting or exposing
    await (gateway as any).handleReceivedMessage({
      envelope: {
        sourceNumber: '+123456',
        sourceName: 'John',
        dataMessage: {
          message: 'Hello'
        }
      }
    })

    assert.ok(calls.includes('fetch:http://localhost:8080/v2/send'))
    assert.ok(calls.includes('send_payload:Test message:+99999'))
    assert.ok(calls.includes('usecase:Hello'))
    assert.ok(calls.includes('send_payload:Mock response:+123456'))
  } finally {
    global.fetch = originalFetch
  }
})
