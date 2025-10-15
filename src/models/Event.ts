/**
 * Defines a historical log entry for tracking player actions and major game events.
 * This will be used to generate the final LLM narrative.
 */
export interface GameEvent {
  /** Unique ID for the log entry */
  id: string
  /** Turn number the event occurred on */
  turn: number
  /** Timestamp of the event */
  timestamp: number
  /** Type of event (e.g., 'ActionExecuted', 'RegionFlipped', 'WildcardTriggered') */
  eventType: string
  /** The ID of the action executed (if applicable) */
  actionId?: string
  /** The ID of the primary region targeted (if applicable) */
  regionId?: string
  /** A brief narrative summary of the outcome */
  narrative: string
  /** Detailed data payload (e.g., progress changes, new state) */
  details: Record<string, unknown>
}