/**
 * @file turn.service.ts
 * @description Core logic for advancing a game by one turn:
 * - Apply passive Power generation
 * - Apply Human Awareness effects
 * - Recalculate metrics
 * - Check win/loss conditions using rulesService
 */

import { GameState } from '../models/GameState'
import { rulesService } from './rules.service'
import { updateGame } from '../services/db.service'
import logger from '../common/logger'

/**
 * Progresses the game by one turn without player action.
 * Applies passive effects and checks end conditions.
 * @param game - Current GameState fetched from Firestore
 * @returns Updated GameState after turn logic
 */
export async function progressTurn(game: GameState): Promise<GameState> {
  const updated = structuredClone(game)
  const { metrics, regions } = updated

  logger.info(`Progressing turn ${metrics.turn + 1} for game ${game.id}`)

  // --- Passive Power generation ---
  const subnetCount = regions.filter((r) => r.state === 'subnet').length
  const powerGain = subnetCount * 20 // Tunable constant
  metrics.power += powerGain

  // --- Human Awareness effects ---
  if (metrics.humanAwareness > 40 && metrics.humanAwareness <= 80) {
    regions.forEach((r) => {
      if (r.state === 'contested' && r.stability < 90) r.stability += 2
    })
  } else if (metrics.humanAwareness > 80) {
    regions.forEach((r) => {
      r.stability = Math.min(100, r.stability + 5)
    })
  }

  // --- Recalculate global metrics ---
  metrics.totalControl = average(regions.map((r) => r.control))
  metrics.totalStability = average(regions.map((r) => r.stability))

  // --- Check win/loss conditions ---
  updated.status = rulesService.checkEndConditions(metrics)

  // --- Apply region state rules ---
  rulesService.applyRules(updated)

  // --- Increment turn counter ---
  metrics.turn += 1

  // --- Persist to Firestore ---
  await updateGame(game.id, updated)

  return updated
}

/** Utility: compute average of numeric array */
function average(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}
