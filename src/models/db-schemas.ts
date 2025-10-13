// models/db-schemas.ts

// --- 1.1. Core History Object ---

/**
 * Defines a single entry in the GameDocument.event_log array.
 * Used to store the history of one completed turn.
 */
export interface TurnHistoryEntry {
  turn: number
  headline: string
  choice_made: string // The full text of the choice selected.
  outcome_narrative: string // The final result narrative for the log.
  resource_changes: Record<string, number> // e.g., { D: 100, PC: -20, human_panic: 5 }
}

// --- 1.2. Game State Document ---

/**
 * The primary document for a single game session in the 'games' collection.
 */
export interface GameDocument {
  id: string
  player_id: string
  mode: 'Singularity' | 'Anthropocene'
  status: 'in_progress' | 'game_over' | 'victory'
  turn_number: number

  // Dynamic resource values (e.g., D, Hw, PC, ES)
  resources: Record<string, number>

  // Critical meter values
  meters: Record<string, number>

  // Status of key regions/sectors
  map_status: Record<string, string>

  // History log (Array of TurnHistoryEntry)
  event_log: TurnHistoryEntry[]

  created_at: Date
  updated_at: Date
}

// --- 1.3. Player Account Document ---

/**
 * Document for a user account in the 'players' collection.
 */
export interface PlayerDocument {
  id: string
  username: string
  games_played: number
  best_survival_time: number // For Anthropocene mode
  fastest_assimilation: number // For Singularity mode
  last_login: Date
}
