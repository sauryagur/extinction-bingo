// src/models/event.ts
import { RiskLevel, ConsequenceMap } from './types'

export interface Option {
  id: string
  label: string
  cost: number
  previewRisk: RiskLevel
  consequences: ConsequenceMap
  nextMove?: NextMove
}

export interface NextMove {
  headline: string
  effects: Record<
    string,
    {
      powerIncrement?: number
      controlIncrement?: number
      stabilityIncrement?: number
    }
  >
}

export interface NewsEvent {
  id: string
  headline: string
  summary: string
  region: string
  options: Option[]
  skipOption: boolean
}
