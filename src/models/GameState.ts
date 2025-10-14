/**
 * @file GameState.ts
 * @description Defines the persistent structure of the entire game session document.
 */

export interface RegionState {
  /** Unique region code (e.g., "EU_WEST", "SE_ASIA") */
  id: string
  /** Human-readable name for UI */
  name: string
  /** AI Control metric [0–100] */
  control: number
  /** Human Stability metric [0–100] */
  stability: number
  /** Current state classification: 'bastion' | 'contested' | 'subnet' | 'glassed' */
  state: 'bastion' | 'contested' | 'subnet' | 'glassed'
}

export interface BingoObjective {
  /** Objective ID for referencing and completion tracking */
  id: string
  /** Display title or short description */
  title: string
  /** Whether this objective has been completed */
  completed: boolean
}

export interface BingoCard {
  /** 3x3 grid (array of arrays) of objectives */
  grid: BingoObjective[][]
  /** Optional: track rows/columns already rewarded */
  completedLines: string[]
}

export interface GameMetrics {
  /** Weighted average Control across all regions */
  totalControl: number
  /** Weighted average Stability across all regions */
  totalStability: number
  /** Global awareness of AI [0–100] */
  humanAwareness: number
  /** Current available Power resource */
  power: number
  /** Weekly Action Limit — usually 2 per turn */
  wal: number
  /** Current turn number */
  turn: number
}

export interface GameLogEntry {
  /** Turn number during which this log occurred */
  turn: number
  /** Region affected */
  regionId: string
  /** Action type performed */
  actionType: string
  /** Narrative headline or summary text */
  headline: string
  /** Full generated narrative text (from LLM) */
  narrative: string
  /** Effect summary (ΔControl, ΔStability, etc.) */
  effects: Record<string, number>
  /** Power cost spent */
  powerCost: number
  /** Awareness change caused */
  awarenessDelta: number
  /** Timestamp for ordering */
  timestamp: number
}

export interface GameState {
  /** Firestore document ID */
  id: string
  /** List of all regions and their states */
  regions: RegionState[]
  /** Global metrics and resources */
  metrics: GameMetrics
  /** Player’s dynamic 3x3 bingo card */
  bingoCard: BingoCard
  /** Chronological list of all events and outcomes */
  gameLog: GameLogEntry[]
  /** Current status: 'active' | 'won' | 'lost' */
  status: 'active' | 'won' | 'lost'
  /** Timestamp for last update */
  updatedAt: number
}
