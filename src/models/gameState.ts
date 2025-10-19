// src/models/gameState.ts
import { AIMood } from './types'
import { Region } from './region'

export interface GameLogEntry {
  turn: number
  event: string
}

export interface PendingNextMove {
  id: string
  turnTrigger: number
  eventId: string
  nextMove?: {
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
}

export interface GameState {
  sessionId: string
  turn: number
  power: number
  aiMood: AIMood
  humanAwareness: number
  regions: Region[]
  pendingNextMoves: PendingNextMove[]
  log: GameLogEntry[]
}
