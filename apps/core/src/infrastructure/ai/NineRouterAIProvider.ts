import { IAIProvider, AIRequest, AIResponse } from '../../application/abstractions/ai/IAIProvider'
import { Logger } from '../../shared/logging/Logger'

export class NineRouterAIProvider implements IAIProvider {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly defaultModel: string,
    private readonly defaultTemperature: number = 0.7,
    private readonly defaultMaxTokens: number = 2048,
    private readonly logger?: Logger,
  ) {}

  async generate(request: AIRequest): Promise<AIResponse> {
    const model = request.model || this.defaultModel
    const temperature = request.temperature ?? this.defaultTemperature
    const maxTokens = request.maxTokens ?? this.defaultMaxTokens

    const payloadMessages = [
      { role: 'system', content: request.systemPrompt },
      ...request.messages.map((m) => ({
        role: m.role.toLowerCase(),
        content: m.content,
      })),
    ]

    const body = {
      model,
      messages: payloadMessages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }

    const endpoint = `${this.baseUrl.replace(/\/$/, '')}/chat/completions`

    let attempts = 0
    const maxRetries = 3
    let delayMs = 500

    while (attempts < maxRetries) {
      attempts++
      try {
        this.logger?.info('AIRequestStarted', { model, attempts, endpoint })

        const startTime = Date.now()
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(body),
        })

        const duration = Date.now() - startTime

        if (!response.ok) {
          const errorText = await response.text().catch(() => '')
          const status = response.status
          
          // Retryable status codes: 429 (rate limit), 5xx (server error)
          if ((status === 429 || status >= 500) && attempts < maxRetries) {
            this.logger?.warn('AIRequestTransientError', { status, duration, attempts, error: errorText })
            await new Promise((resolve) => setTimeout(resolve, delayMs))
            delayMs *= 2
            continue
          }

          this.logger?.error('AIRequestFailed', { status, duration, attempts, error: errorText })
          throw new Error(`9Router API error: HTTP ${status} - ${errorText}`)
        }

        const text = await response.text()
        let data: any
        try {
          data = JSON.parse(text)
        } catch {
          data = this.parseSSE(text)
        }
        const content = data?.choices?.[0]?.message?.content || ''
        const usage = data?.usage ? {
          promptTokens: data.usage.prompt_tokens || 0,
          completionTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0,
        } : undefined

        this.logger?.info('AIRequestCompleted', {
          model: data?.model || model,
          provider: '9Router',
          duration,
          usage,
        })

        return {
          content,
          provider: '9Router',
          model: data?.model || model,
          usage,
        }
      } catch (err: any) {
        if (attempts >= maxRetries) {
          this.logger?.error('AIRequestFailed', { attempts, error: err.message })
          throw err
        }
        this.logger?.warn('AIRequestRetry', { attempts, error: err.message })
        await new Promise((resolve) => setTimeout(resolve, delayMs))
        delayMs *= 2
      }
    }

    throw new Error('9Router API request failed after retries.')
  }

  private parseSSE(text: string): any {
    const choices: Array<{ message: { content: string } }> = [{ message: { content: '' } }]
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (payload === '[DONE]') continue
      try {
        const chunk = JSON.parse(payload)
        const delta = chunk?.choices?.[0]?.delta?.content
        if (typeof delta === 'string') {
          choices[0].message.content += delta
        }
      } catch {
        // ignore malformed SSE lines
      }
    }
    return { choices }
  }
}
