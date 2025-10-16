// src/core/bingo.ts

import { BingoObjective, GameState } from '../models'
import { ObjectiveStatus } from '../models/GameState'

/**
 * Defines the complete pool of possible Extinction Bingo Objectives.
 * NOTE: The 'criteria' field is a string used internally by the check function.
 */
export const OBJECTIVE_POOL: Omit<BingoObjective, 'id' | 'status'>[] = [
  {
    description: 'Flip three neighboring regions to Dominated consecutively.',
    criteria: 'neighbor_flip_dominate_3',
    bonusEffect: '+20 Power',
  },
  {
    description: 'Maintain a Contested region in a major alliance for 3 turns.',
    criteria: 'contested_in_alliance_3',
    bonusEffect: '+10 to Control in one target region',
  },
  {
    description: 'Achieve Dominated state in one region within the first 5 turns.',
    criteria: 'dominate_early_5',
    bonusEffect: '+5 to Global Control Index',
  },
  {
    description: 'Trigger the "Collapsed" state in any two regions simultaneously.',
    criteria: 'collapse_two_simultaneous',
    bonusEffect: 'Free Wildcard Action',
  },
  {
    description: 'Reduce the stability (S) of all Stable regions by a total of 50 points.',
    criteria: 'reduce_stable_s_50',
    bonusEffect: '+1 Progress Cap for the rest of the game',
  },
  // NOTE: Expand this list to fill the 3x3 grid (9 total objectives).
]

/**
 * Generates a randomized 3x3 (9 total) Bingo Card for the game.
 * @returns An array of 9 unique BingoObjective cards.
 */
export function generateBingoCard(): BingoObjective[] {
  const shuffledPool = OBJECTIVE_POOL.sort(() => 0.5 - Math.random())
  const selectedObjectives = shuffledPool.slice(0, 9) // Select 9 unique objectives

  return selectedObjectives.map((obj, index) => ({
    ...obj,
    id: `B${index + 1}`,
    status: 'Incomplete' as ObjectiveStatus,
  }))
}

/**
 * Checks all active Bingo Objectives against the current game state.
 * @param state The current GameState.
 */
export function checkBingoCompletion(state: GameState): void {
  // In a full implementation, this would iterate over state.bingoCard
  // and apply complex logic based on the 'criteria' string and the game history (gameLog).
  // For now, this is where the logic described in the GDD's 'Strategic Layer' lives.

  // Example logic placeholder:
  state.bingoCard.forEach((objective) => {
    if (objective.status === 'Incomplete') {
      // Check specific objective criteria (e.g., if criteria == 'dominate_early_5')
      // if (criteriaMet) {
      //     objective.status = 'Complete';
      //     // Apply bonus effect...
      // }
    }
  })
}
