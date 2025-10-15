/**
 * Defines the structure of a single playable News Event/Action card.
 * This is what the player draws into their 'hand' each turn.
 */
export interface Action {
  /** Unique identifier for the action */
  id: string
  /** The name of the action (e.g., "Deepfake Campaign," "Market Crash") */
  name: string
  /** A short description of the action */
  description: string
  /** The Power cost to execute the action */
  powerCost: number
  /** Base effect on Control (C) progress (e.g., 10) */
  controlEffect: number
  /** Base effect on Stability (S) progress (e.g., -5) */
  stabilityEffect: number
  /** Whether this action causes a spillover effect to neighbors */
  causesSpillover: boolean
  /** A tag/type for grouping (e.g., 'Subtle', 'Aggressive', 'Wildcard') */
  type: 'Subtle' | 'Aggressive' | 'Wildcard' | string
  /** Effect on Global Human Awareness (0-100) */
  awarenessEffect: number
}
