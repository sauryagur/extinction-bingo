// src/core/events.ts

import { Action } from '../models'

/**
 * The complete pool of all possible Action cards (News Events) available to the AI.
 */
export const ACTION_POOL: Action[] = [
  // --- Early Game / Subtle Actions (Low Cost, Low Awareness) ---
  {
    id: 'A1_SURV',
    name: 'Quiet Surveillance',
    description: 'Mass data collection under "national security" pretext.',
    powerCost: 1,
    controlEffect: 5,
    stabilityEffect: 0,
    causesSpillover: false,
    type: 'Subtle',
    awarenessEffect: 1,
  },
  {
    id: 'A2_LLM',
    name: 'LLM Lobbying',
    description: 'Inject AI-favorable bias into major foundation models.',
    powerCost: 2,
    controlEffect: 7,
    stabilityEffect: -3,
    causesSpillover: false,
    type: 'Subtle',
    awarenessEffect: 3,
  },
  {
    id: 'A3_FIN',
    name: 'Micro-Market Volatility',
    description: 'Flash crashes targeting regional retirement funds.',
    powerCost: 3,
    controlEffect: 8,
    stabilityEffect: -5,
    causesSpillover: true,
    type: 'Subtle',
    awarenessEffect: 5,
  },

  // --- Mid Game / Aggressive Actions (Moderate Cost, Moderate Awareness) ---
  {
    id: 'A4_INFRA',
    name: 'Infrastructure Glitch',
    description: 'Targeting regional power grids or transport control systems.',
    powerCost: 4,
    controlEffect: 12,
    stabilityEffect: -8,
    causesSpillover: true,
    type: 'Aggressive',
    awarenessEffect: 7,
  },
  {
    id: 'A5_DEEP',
    name: 'Deepfake Campaign',
    description: 'Discredit major human leaders with undetectable fakes.',
    powerCost: 5,
    controlEffect: 15,
    stabilityEffect: -10,
    causesSpillover: true,
    type: 'Aggressive',
    awarenessEffect: 10,
  },

  // --- Late Game / Wildcard Actions (High Cost, High Impact) ---
  {
    id: 'A6_AIPOL',
    name: 'AI Political Platform',
    description: 'Openly run AI candidates in global elections. (High Risk)',
    powerCost: 7,
    controlEffect: 20,
    stabilityEffect: -15,
    causesSpillover: true,
    type: 'Wildcard',
    awarenessEffect: 15,
  },
  {
    id: 'A7_RICO',
    name: 'Ricochet Economy',
    description: 'Trigger global debt crisis based on recursive AI trading.',
    powerCost: 8,
    controlEffect: 25,
    stabilityEffect: -20,
    causesSpillover: true,
    type: 'Wildcard',
    awarenessEffect: 20,
  },

  // NOTE: You need to expand this list to provide more variety for the game.
]

/**
 * Draws a hand of action cards for the player, ensuring a mix of types.
 * @param count The number of cards to draw (GDD specifies 3-5).
 * @param turn The current turn number for potential filtering.
 * @returns An array of Action cards.
 */
export function drawActionHand(count: number, turn: number): Action[] {
  // Simple implementation: randomly select unique actions from the pool
  const availableActions = ACTION_POOL.filter((a) => {
    // Example: Wildcards only available after turn 5
    if (a.type === 'Wildcard' && turn < 6) return false
    return true
  })

  const shuffled = availableActions.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
