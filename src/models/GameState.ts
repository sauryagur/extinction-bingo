import { Action } from './Action'
import { GameEvent } from './Event'

// Helper type for Regional States
export type RegionalState = 'Stable' | 'Contested' | 'Dominated' | 'Collapsed'
// Helper type for Bingo Objective status
export type ObjectiveStatus = 'Incomplete' | 'InProgress' | 'Complete'

/**
 * Defines the metrics and state for a single region on the world map.
 */
export interface Region {
  /** Unique identifier for the region (e.g., 'NorthAmerica', 'EU', 'India') */
  id: string
  /** Display name of the region */
  name: string
  /** List of IDs of adjacent regions for spillover calculations */
  neighbors: string[]
  /** List of alliance memberships (e.g., ['G7', 'NATO']) */
  alliances: string[]

  // Regional Metrics
  /** Control (C): AI influence (0-100) */
  control: number
  /** Stability (S): Human societal cohesion (0-100) */
  stability: number
  /** Current state of the region */
  state: RegionalState
  /** Progress bar toward the next state (0-100%) */
  progressToNextState: number
  /** Internal counter for persistence (e.g., how long it's been in the current state) */
  statePersistenceTurns: number
}

/**
 * Defines a single objective on the Extinction Bingo Card.
 */
export interface BingoObjective {
  /** Unique ID for the objective */
  id: string
  /** Full description of the objective */
  description: string
  /** Criteria for completion (used by gameEngine.ts) */
  criteria: string
  /** Current status */
  status: ObjectiveStatus
  /** Optional: A powerful one-time bonus granted upon completion (e.g., "+50 Pwr") */
  bonusEffect?: string
}

/**
 * Defines the complete state of the game at any given point.
 */
export interface GameState {
  /** Unique ID for the game session */
  id: string
  /** The current turn number */
  turn: number
  /** The overall status of the game */
  status: 'InProgress' | 'Win' | 'Loss' | 'Draw'

  // Global Metrics & Resources
  /** Central Resource: AI Power available this turn */
  power: number
  /** Global average (Control - Stability) across all regions */
  globalControlIndex: number
  /** Global Human Awareness of the AI threat (0-100) */
  humanAwareness: number

  // Regions and Map State
  /** Array of all regions in the world */
  regions: Region[]

  // Game Progression Counters
  /** Number of consecutive turns the Win condition has been met */
  winPersistenceCounter: number
  /** Number of consecutive turns the Loss condition has been met */
  lossPersistenceCounter: number
  /** Maximum progress allowed per action in the current phase */
  progressCapPerAction: number

  // Strategic Layer
  /** The 3x3 randomized objectives for the current game */
  bingoCard: BingoObjective[]
  /** A list of completed bingo line identifiers (e.g., 'row-0', 'col-1', 'diag-down') to prevent duplicate bonus awards. */
  completedBingoLines: string[]

  // Game Log
  /** A record of all actions and major outcomes */
  gameLog: GameEvent[]
}
