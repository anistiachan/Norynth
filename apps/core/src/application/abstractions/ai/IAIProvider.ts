import { MessageRole } from '../../../domain/enums/MessageRole'

export interface AIMessage {
  role: MessageRole
  content: string
}

export interface AIRequest {
  systemPrompt: string
  messages: AIMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface AIResponse {
  content: string
  provider: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface IAIProvider {
  generate(request: AIRequest): Promise<AIResponse>
}
