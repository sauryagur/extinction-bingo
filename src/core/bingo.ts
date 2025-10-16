// src/core/bingo.ts

import { BingoObjective, GameState, GameEvent } from '../models'
import { ObjectiveStatus } from '../models/GameState'
import { generateUniqueId } from '../common/utils'

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
 * For demo purposes, it completes an objective every 5 turns.
 * It also checks for and applies bonuses for completed lines (rows, columns, diagonals).
 * @param state The current GameState.
 */
export function checkBingoCompletion(state: GameState): void {
  // Placeholder Logic: Mark the first uncompleted objective as 'Complete' if the turn is a multiple of 5.
  let objectiveCompletedThisTurn = false
  if (state.turn > 0 && state.turn % 5 === 0) {
    const firstIncomplete = state.bingoCard.find((obj) => obj.status === 'Incomplete')

    if (firstIncomplete) {
      firstIncomplete.status = 'Complete'
      objectiveCompletedThisTurn = true

      // Log a GameEvent for the completion.
      const event: GameEvent = {
        id: generateUniqueId(),
        turn: state.turn,
        eventType: 'BingoObjectiveComplete',
        narrative: `Objective Achieved: "${firstIncomplete.description}"`,
        regionId: null,
        timestamp: Date.now(),
        details: { objectiveId: firstIncomplete.id },
      }
      state.gameLog.push(event)
      console.log(`[BINGO] Turn ${state.turn}: Objective "${firstIncomplete.description}" completed!`)
    }
  }

  // If an objective was completed, check for new bingo lines.
  if (objectiveCompletedThisTurn) {
    checkAndApplyBingoLineBonuses(state)
  }
}

/**
 * Checks for completed rows, columns, and diagonals on the 3x3 bingo card.
 * @param state The current GameState.
 */
function checkAndApplyBingoLineBonuses(state: GameState): void {
  const card = state.bingoCard
  if (card.length !== 9) return // Ensure it's a 3x3 grid

  const lines = {
    // Rows
    'row-0': [0, 1, 2],
    'row-1': [3, 4, 5],
    'row-2': [6, 7, 8],
    // Columns
    'col-0': [0, 3, 6],
    'col-1': [1, 4, 7],
    'col-2': [2, 5, 8],
    // Diagonals
    'diag-down': [0, 4, 8],
    'diag-up': [2, 4, 6],
  }

  for (const [lineId, indices] of Object.entries(lines)) {
    // Check if this line is already completed and rewarded
    if (state.completedBingoLines.includes(lineId)) {
      continue
    }

    const isLineComplete = indices.every((index) => card[index].status === 'Complete')

    if (isLineComplete) {
      // Mark line as complete to prevent re-awarding
      state.completedBingoLines.push(lineId)

      // Apply a powerful, one-time bonus
      applyBingoBonus(state, lineId)
    }
  }
}

/**
 * Applies a powerful bonus based on the completed line.
 * @param state The current GameState.
 * @param lineId The identifier of the completed line (e.g., 'row-0').
 */
function applyBingoBonus(state: GameState, lineId: string): void {
  let bonusNarrative = ''

  // Example Bonuses
  if (lineId.startsWith('row')) {
    state.power += 50 // Massive power injection
    bonusNarrative = 'Line Bonus: Critical power surge detected (+50 Power).'
  } else if (lineId.startsWith('col')) {
    state.progressCapPerAction += 5 // Increase action effectiveness
    bonusNarrative = `Line Bonus: Global destabilization matrix enhanced (+5 Progress Cap).`
  } else if (lineId.startsWith('diag')) {
    // Instantly make one Stable region Contested
    const stableRegion = state.regions.find((r) => r.state === 'Stable')
    if (stableRegion) {
      stableRegion.state = 'Contested'
      stableRegion.progressToNextState = 0
      bonusNarrative = `Line Bonus: ${stableRegion.name} has descended into chaos, now Contested.`
    }
  }

  if (bonusNarrative) {
    const event: GameEvent = {
      id: generateUniqueId(),
      turn: state.turn,
      eventType: 'BingoLineBonus',
      narrative: bonusNarrative,
      regionId: null,
      timestamp: Date.now(),
      details: { lineId },
    }
    state.gameLog.push(event)
    console.log(`[BINGO] ${bonusNarrative}`)
  }
}
