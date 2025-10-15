// src/core/gameEngine.ts

import { StateManager } from './stateManager'
import { LLMService } from '../services/llm.service'
import { Action, GameState, Region, GameEvent, RegionalState } from '../models'
import { calculateGlobalMetrics, findActionById, findRegionById, applyProgressCap } from '../common/utils' // Placeholder utils

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

    if (!action || !targetRegion) {
      throw { message: 'Invalid action or region ID.', status: 400 }
    }
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

    // 2. Update Global Metrics (Global Control Index)
    state.globalControlIndex = calculateGlobalMetrics(state.regions)

    // 3. Check Win/Loss Conditions
    if (this.checkWinLossConditions(state)) {
      await this.stateManager.saveGame(state)
      return state
    }

    // 4. Calculate Passive Power for the next turn
    this.calculatePassivePower(state)

    // 5. Check and complete Bingo Objectives
    this.checkBingoCompletion(state)

    // 6. Draw New Action Hand
    state.actionHand = this.drawNewActionHand(state)

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
    const cEffect = action.controlEffect
    const sEffect = action.stabilityEffect

    // GDD Rule: Actions increment progress bars toward state transitions
    region.progressToNextState += applyProgressCap(state, cEffect, sEffect)
  }

  private applySpillover(state: GameState, sourceRegion: Region, action: Action): void {
    if (!action.causesSpillover) return

    const spilloverEffect = (action.controlEffect + action.stabilityEffect) / 5 // Example calculation

    sourceRegion.neighbors.forEach((neighborId) => {
      const neighbor = findRegionById(state.regions, neighborId)
      if (neighbor) {
        // Apply a small increment to the neighbor's progress
        neighbor.progressToNextState += Math.max(0, spilloverEffect)
      }
    })
  }

  private resolveRegionStateFlips(state: GameState): void {
    state.regions.forEach((region) => {
      // Check for progress >= 100%
      if (region.progressToNextState >= 100) {
        const newState = this.determineNextState(region.state, region.control, region.stability)
        if (newState !== region.state) {
          // Flip occurs
          region.state = newState
          region.progressToNextState = 0 // Reset progress
          region.statePersistenceTurns = 0
          // Log the flip event
          // ...
        }
      }
      region.statePersistenceTurns += 1
    })
  }

  private determineNextState(currentState: RegionalState, control: number, stability: number): RegionalState {
    // GDD Rules: Simple check for demonstration
    if (control >= 75 && stability <= 50) return 'Dominated'
    if (stability >= 75 && control <= 50) return 'Stable'
    if (control > 40 && control < 60 && stability > 40 && stability < 60) return 'Contested'
    if (control < 20 && stability < 20) return 'Collapsed' // Optional state
    return currentState
  }

  private calculatePassivePower(state: GameState): void {
    let generatedPower = 0
    state.regions.forEach((r) => {
      if (r.state === 'Dominated') {
        generatedPower += 5 // Example generation rate
      }
      // Add moderate power from Contested if partially AI-influenced
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

    const winThreshold = 0.7 * totalRegions
    const lossThreshold = 0.7 * totalRegions

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

  // private checkBingoCompletion(state: GameState): void {
  //   // NOTE: This logic belongs in bingo.ts, but mocked here.
  //   // Iterate through state.bingoCard and check criteria.
  //   // Apply bonus effects upon completion.
  // }

  // private drawNewActionHand(state: GameState): Action[] {
  //   // NOTE: This logic belongs in events.ts, but mocked here.
  //   // Draw 3-5 new actions from the available pool based on game phase, awareness, etc.
  //   // For now, just refill with basic actions if the hand is empty.
  //   return state.actionHand.length > 0 ? state.actionHand : this.stateManager.drawInitialActionHand()
  // }

  private updateProgressCap(state: GameState): void {
    // GDD Rule: Late game cap increases slightly
    if (state.turn >= 16) {
      state.progressCapPerAction = 20 // Late game cap (15-20% range)
    } else if (state.turn >= 6) {
      state.progressCapPerAction = 15 // Mid game increase
    } else {
      state.progressCapPerAction = 10
    }
  }
}
