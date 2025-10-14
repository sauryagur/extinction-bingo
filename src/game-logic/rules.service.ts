/**
 * @file rules.service.ts
 * @description Validates, enforces, and updates the GameState according to LLM-defined action results.
 */

import { GameState, GameMetrics, RegionState, GameLogEntry } from '../models/GameState'
import { LLMActionOption, LLMActionResult } from '../models/LLMSchemas'

export class RulesService {
  /**
   * Validates whether a player's action is legal given current game state.
   * @param gameState - Current snapshot of the game
   * @param action - Candidate action option
   * @returns Whether the action can be performed
   */
  validateAction(gameState: GameState, action: LLMActionOption): boolean {
    if (gameState.status !== 'active') return false
    if (gameState.metrics.power < action.powerCost) return false
    if (gameState.metrics.wal <= 0) return false

    return true
  }

  /**
   * Applies an LLM-generated action result to the game state.
   * @param gameState - Current state before applying
   * @param regionId - Region affected
   * @param option - Chosen LLM action definition
   * @param result - Narrative and modifiers returned by LLM
   * @returns Updated GameState
   */
  applyAction(gameState: GameState, regionId: string, option: LLMActionOption, result: LLMActionResult): GameState {
    const updated = structuredClone(gameState)

    // Find target region
    const region = updated.regions.find((r) => r.id === regionId)
    if (!region) throw new Error(`Region ${regionId} not found`)

    // Apply deltas
    region.control = this.clamp(region.control + option.deltaControl, 0, 100)
    region.stability = this.clamp(region.stability + option.deltaStability, 0, 100)

    // Global resource impact
    updated.metrics.power -= option.powerCost
    updated.metrics.humanAwareness += result.modifiers?.awarenessSpike ?? 0
    updated.metrics.wal = Math.max(0, updated.metrics.wal - 1)

    // Log event
    const log: GameLogEntry = {
      turn: updated.metrics.turn,
      regionId,
      actionType: option.effectType,
      headline: result.headline,
      narrative: result.narrative,
      effects: {
        deltaControl: option.deltaControl,
        deltaStability: option.deltaStability,
      },
      powerCost: option.powerCost,
      awarenessDelta: result.modifiers?.awarenessSpike ?? 0,
      timestamp: Date.now(),
    }
    updated.gameLog.push(log)

    // Recalculate global metrics and check win/loss conditions
    updated.metrics = this.recalculateMetrics(updated.regions, updated.metrics)
    updated.status = this.checkEndConditions(updated.metrics)

    updated.updatedAt = Date.now()
    return updated
  }

  /**
   * Checks for victory or defeat based on global metrics.
   */
  checkEndConditions(metrics: GameMetrics): 'active' | 'won' | 'lost' {
    if (metrics.totalControl >= 90 && metrics.totalStability >= 75) return 'won'
    if (metrics.humanAwareness >= 100 || metrics.totalStability <= 0) return 'lost'
    return 'active'
  }

  /**
   * Recalculates derived metrics after region updates.
   */
  private recalculateMetrics(regions: RegionState[], metrics: GameMetrics): GameMetrics {
    const totalControl = regions.reduce((a, r) => a + r.control, 0) / regions.length
    const totalStability = regions.reduce((a, r) => a + r.stability, 0) / regions.length
    return { ...metrics, totalControl, totalStability }
  }

  /**
   * Initializes a new baseline game state.
   */
  initializeGameState(): GameState {
    return {
      id: '',
      regions: [],
      metrics: {
        totalControl: 50,
        totalStability: 50,
        humanAwareness: 0,
        power: 100,
        wal: 2,
        turn: 1,
      },
      bingoCard: {
        grid: [],
        completedLines: [],
      },
      gameLog: [],
      status: 'active',
      updatedAt: Date.now(),
    }
  }

  /**
   * Updates each region's state classification based on current control/stability.
   * Should be called after any turn updates or action execution.
   * @param gameState - The game state to update in-place
   */
  applyRules(gameState: GameState) {
    gameState.regions.forEach((region) => {
      if (region.stability > 70 && region.control < 30) {
        region.state = 'bastion'
      } else if (region.control > 70 && region.stability < 30) {
        region.state = 'subnet'
      } else if (region.stability < 10 && region.control < 10) {
        region.state = 'glassed'
      } else {
        region.state = 'contested'
      }
    })
  }

  /**
   * Utility: clamp numeric values between min and max.
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
  }
}

export const rulesService = new RulesService()
