// src/models/llm.ts
import { AIMood } from './types'
import { NewsEvent } from './event'
import { Region } from './region'

export interface LLMContext {
  turn: number
  aiMood: AIMood
  power: number
  humanAwareness: number
  recentLog: string[]
  regions: Pick<Region, 'id' | 'state' | 'control' | 'stability'>[]
}

export interface LLMRequest {
  system_prompt: string
  context: LLMContext
  generation_schema: {
    newsEvents: {
      count: number
      structure: Record<string, unknown> // used to describe the JSON schema
    }
  }
}

export interface LLMResponse {
  newsEvents: NewsEvent[]
}
