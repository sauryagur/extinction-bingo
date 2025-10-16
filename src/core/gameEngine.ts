// src/core/gameEngine.ts

import { StateManager } from './stateManager'
import { LLMService } from '../services/llm.service'
import { Action, GameState, Region, GameEvent, RegionalState } from '../models'
import {
  generateUniqueId,
  calculateGlobalMetrics,
  findActionById,
  findRegionById,
  applyProgressCap,
} from '../common/utils'
import { checkBingoCompletion } from './bingo'
import { drawActionHand } from './events'

/**
 * The core engine responsible for executing game logic:
 * 1. Executing actions (player phase).
 * 2. Resolving the end-of-turn (state flips, power generation, checks).
 * 3. Handling game progression (win/loss).
 */
export class GameEngine {
  private stateManager: StateManager
  private llmService: LLMService

  constructor() {
    this.stateManager = new StateManager()
    this.llmService = new LLMService()
  }

  /**
   * Executes a player action, modifies the game state, and generates a narrative snippet.
   * @param gameId The ID of the current game.
   * @param actionId The ID of the action card played.
   * @param targetRegionId The ID of the region targeted.
   * @returns The updated GameState and the generated narrative.
   */
  public async executeAction(
    gameId: string,
    actionId: string,
    targetRegionId: string,
  ): Promise<{ updatedState: GameState; narrative: string }> {
    const state = await this.stateManager.loadGame(gameId)
    if (!state) throw new Error('Game not found.')

    const action = findActionById(state.actionHand, actionId)
    const targetRegion = findRegionById(state.regions, targetRegionId)

    if (state.power < action.powerCost) {
      throw { message: 'Insufficient Power to execute action.', status: 403 }
    }

    // 1. Consume Power and Remove Action from hand
    state.power -= action.powerCost
    state.actionHand = state.actionHand.filter((a) => a.id !== actionId)

    // 2. Apply direct effects to the target region
    this.applyActionEffects(state, targetRegion, action)

    // 3. Apply spillover effects
    this.applySpillover(state, targetRegion, action)

    // 4. Update Global Awareness
    state.humanAwareness = Math.min(100, state.humanAwareness + action.awarenessEffect)

    // 5. Generate Narrative and Log Event
    const narrative = await this.llmService.generateActionNarrative(state, action, targetRegion)
    const event: GameEvent = {
      id: generateUniqueId(),
      turn: state.turn,
      timestamp: Date.now(),
      eventType: 'ActionExecuted',
      actionId: action.id,
      regionId: targetRegion.id,
      narrative: `Action on ${targetRegion.name}: ${narrative}`,
      details: { powerCost: action.powerCost, c: action.controlEffect, s: action.stabilityEffect },
    }
    await this.stateManager.logEventAndSave(state, event)

    return { updatedState: state, narrative }
  }

  /**
   * Finalizes the current turn and prepares the state for the next turn.
   * @param gameId The ID of the current game.
   * @returns The GameState for the new turn.
   */
  public async endTurn(gameId: string): Promise<GameState> {
    const state = await this.stateManager.loadGame(gameId)
    if (!state) throw new Error('Game not found.')

    // 1. Resolve State Flips and Update Persistence Counters
    this.resolveRegionStateFlips(state)

    // 2. Check and complete Bingo Objectives
    checkBingoCompletion(state)

    // 3. Calculate Passive Power for the next turn
    this.calculatePassivePower(state)

    // 4. Update Global Metrics (Global Control Index)
    state.globalControlIndex = calculateGlobalMetrics(state.regions)

    // 5. Check Win/Loss Conditions
    if (this.checkWinLossConditions(state)) {
      await this.stateManager.saveGame(state)
      return state
    }

    // 6. Draw New Action Hand (3 to 5 cards)
    const cardCount = 3 + Math.floor(Math.random() * 3) // 3, 4, or 5
    state.actionHand = drawActionHand(cardCount, state.turn)

    // 7. Advance Turn Counter
    state.turn += 1

    // 8. Update Progress Cap for Mid/Late Game
    this.updateProgressCap(state)

    await this.stateManager.saveGame(state)
    return state
  }

  /**
   * Generates the final epilogue narrative when the game concludes.
   */
  public async generateFinalEpilogue(state: GameState): Promise<string> {
    // Use the LLM to process the final state and game log
    return this.llmService.generateEpilogue(state)
  }

  // --- Private Game Logic Methods ---

  private applyActionEffects(state: GameState, region: Region, action: Action): void {
    // Apply C/S effects directly
    region.control = Math.max(0, Math.min(100, region.control + action.controlEffect))
    region.stability = Math.max(0, Math.min(100, region.stability + action.stabilityEffect))

    // GDD Rule: Actions increment progress bars toward state transitions
    region.progressToNextState += applyProgressCap(state, action.controlEffect, action.stabilityEffect)
  }

  private applySpillover(state: GameState, sourceRegion: Region, action: Action): void {
    if (!action.causesSpillover) return

    // Spillover is a fraction of the total impact
    const spilloverProgress = Math.floor(applyProgressCap(state, action.controlEffect, action.stabilityEffect) / 4)

    if (spilloverProgress <= 0) return

    sourceRegion.neighbors.forEach((neighborId) => {
      const neighbor = findRegionById(state.regions, neighborId)
      if (neighbor) {
        // Apply a small increment to the neighbor's progress
        neighbor.progressToNextState = Math.min(100, neighbor.progressToNextState + spilloverProgress)
      }
    })
  }

  private resolveRegionStateFlips(state: GameState): boolean {
    let flipsOccurred = false

    state.regions.forEach((region) => {
      // Increment persistence counter for current state
      region.statePersistenceTurns += 1

      // Check for progress >= 100%
      if (region.progressToNextState >= 100) {
        const newState = this.determineNextState(region)
        if (newState !== region.state) {
          // Flip occurs
          region.state = newState
          region.progressToNextState = 0 // Reset progress
          region.statePersistenceTurns = 0 // Reset persistence
          flipsOccurred = true

          // Log the flip event
          const event: GameEvent = {
            id: generateUniqueId(),
            turn: state.turn,
            timestamp: Date.now(),
            eventType: 'RegionFlipped',
            regionId: region.id,
            narrative: `${region.name} flipped to the ${newState} state.`,
            details: { newState: newState },
          }
          state.gameLog.push(event)
        } else {
          // If progress is maxed but state didn't change (e.g., waiting for C/S to shift), reset progress
          region.progressToNextState = 99
        }
      }
    })
    return flipsOccurred
  }

  private determineNextState(region: Region): RegionalState {
    const { control: c, stability: s, state: current } = region

    // Dominated (AI Singularity)
    if (c >= 75 && s <= 50) return 'Dominated'

    // Stable (Human Control)
    if (s >= 75 && c <= 50) return 'Stable'

    // Collapsed (Chaos Sink - GDD Optional)
    if (c < 20 && s < 20) return 'Collapsed'

    // Contested (Tug-of-War)
    if ((c > 40 && c < 60) || (s > 40 && s < 60) || (current === 'Contested' && c > 30 && s > 30)) return 'Contested'

    // Maintain current state if no clear shift criteria met
    return current
  }

  private calculatePassivePower(state: GameState): void {
    let generatedPower = 0
    state.regions.forEach((r) => {
      if (r.state === 'Dominated') {
        generatedPower += 5 // Example generation rate
      } else if (r.state === 'Contested') {
        generatedPower += 2 // Contested regions provide some power
      }
    })

    // GDD Rule: Early game generation is capped
    if (state.turn <= 5) {
      generatedPower = Math.min(generatedPower, 15) // Example cap
    }

    state.power += generatedPower
  }

  private checkWinLossConditions(state: GameState): boolean {
    const dominatedCount = state.regions.filter((r) => r.state === 'Dominated').length
    const stableCount = state.regions.filter((r) => r.state === 'Stable').length
    const totalRegions = state.regions.length

    const winThreshold = Math.ceil(0.7 * totalRegions)
    const lossThreshold = Math.ceil(0.7 * totalRegions)

    if (dominatedCount >= winThreshold) {
      state.winPersistenceCounter += 1
      state.lossPersistenceCounter = 0
      if (state.winPersistenceCounter >= 3) {
        state.status = 'Win'
        return true
      }
    } else if (stableCount >= lossThreshold) {
      state.lossPersistenceCounter += 1
      state.winPersistenceCounter = 0
      if (state.lossPersistenceCounter >= 3) {
        state.status = 'Loss'
        return true
      }
    } else {
      state.winPersistenceCounter = 0
      state.lossPersistenceCounter = 0
    }

    // Eternal Stalemate check
    if (state.turn >= 25 && state.status === 'InProgress') {
      const contestedCount = state.regions.filter((r) => r.state === 'Contested').length
      if (contestedCount > 0.5 * totalRegions) {
        state.status = 'Draw'
        return true
      }
    }

    return false
  }

  private updateProgressCap(state: GameState): void {
    // GDD Rule: Late game cap increases slightly
    if (state.turn >= 16) {
      state.progressCapPerAction = 20 // Late game cap (15-20% range)
    } else if (state.turn >= 6) {
      state.progressCapPerAction = 15 // Mid game increase
    }
  }
}
