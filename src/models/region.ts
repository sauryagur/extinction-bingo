// src/models/region.ts
import { RegionState } from './types'

export interface MemoryEvent {
  turn: number
  event: string
}

export interface Region {
  id: string
  name: string
  state: RegionState
  control: number
  stability: number
  intelLevel: number // 0–3
  progressToNextState: number
  neighbors: string[]
  memoryLog: MemoryEvent[]
}

export { RegionState }
