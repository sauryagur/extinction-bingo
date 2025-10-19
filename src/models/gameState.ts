// src/models/gameState.ts
import { AIMood } from './types'
import { Region } from './region'

export interface GameLogEntry {
  turn: number
  event: string
}

export interface PendingNextMove {
  turnTrigger: number
  eventId: string
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
