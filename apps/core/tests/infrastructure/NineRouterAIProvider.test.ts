import { test } from 'node:test'
import assert from 'node:assert'
import { NineRouterAIProvider } from '../../src/infrastructure/ai/NineRouterAIProvider'
import { MessageRole } from '../../src/domain/enums/MessageRole'

test('NineRouterAIProvider retries on transient errors and eventually succeeds', async () => {
  let callCount = 0
  const originalFetch = globalThis.fetch

  globalThis.fetch = async (url, init) => {
    callCount++
    if (callCount === 1) {
      // Return 429 rate limit
      return {
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      } as Response
    }
    
    // Return success
    const mockJson = {
      model: 'gemini-mock',
      choices: [
        {
          message: {
            content: 'Mocked reply',
          },
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15,
      },
    }
    return {
      ok: true,
      status: 200,
      json: async () => mockJson,
      text: async () => JSON.stringify(mockJson),
    } as Response
  }

  try {
    const provider = new NineRouterAIProvider(
      'https://api.9router.ai/v1',
      'mock-key',
      'mock-model',
      0.7,
      100
    )

    const response = await provider.generate({
      systemPrompt: 'System',
      messages: [{ role: MessageRole.USER, content: 'Hi' }],
    })

    assert.strictEqual(callCount, 2) // Tried once (429), retried once (200)
    assert.strictEqual(response.content, 'Mocked reply')
    assert.strictEqual(response.model, 'gemini-mock')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('NineRouterAIProvider fails after maximum retries', async () => {
  let callCount = 0
  const originalFetch = globalThis.fetch

  globalThis.fetch = async (url, init) => {
    callCount++
    return {
      ok: false,
      status: 502,
      text: async () => 'Bad Gateway',
    } as Response
  }

  try {
    const provider = new NineRouterAIProvider(
      'https://api.9router.ai/v1',
      'mock-key',
      'mock-model',
      0.7,
      100
    )

    await assert.rejects(
      provider.generate({
        systemPrompt: 'System',
        messages: [{ role: MessageRole.USER, content: 'Hi' }],
      }),
      /9Router API error/
    )

    assert.strictEqual(callCount, 3) // Tried 3 times (maxRetries = 3)
  } finally {
    globalThis.fetch = originalFetch
  }
})
