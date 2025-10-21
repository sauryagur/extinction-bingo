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

export interface RawLLMResponse {
  newsEvents: {
    id?: string
    headline?: string
    summary?: string
    region?: string
    options?: {
      id?: string
      label?: string
      cost?: number
      previewRisk?: 'Low' | 'Moderate' | 'High'
      consequences?: {
        regionEffects?: Record<
          string,
          {
            powerIncrement?: number
            controlIncrement?: number
            stabilityIncrement?: number
          }
        >
      }
      nextMove?: {
        headline?: string
        effects?: Record<
          string,
          {
            controlIncrement?: number
            stabilityIncrement?: number
          }
        >
      }
    }[]
    skipOption?: boolean
  }[]
}

export interface LLMResponse {
  newsEvents: NewsEvent[]
}
