// src/services/game.service.ts
import { GameState, PendingNextMove } from '../models/gameState'
import { Region, RegionState } from '../models/region'
import { NewsEvent } from '../models/event'
import { RegionService } from './region.service'
import { randomUUID } from 'crypto'

type AIMood = 'Calculating' | 'Agitated' | 'Detached' | 'Euphoric'
type Phase = 'early' | 'mid' | 'late'

export class GameService {
  /**
   * Create a new game session with initial state
   */
  static createNewGame(): GameState {
    const sessionId = randomUUID()
    const regions = this.initializeRegions()

    return {
      sessionId,
      turn: 1,
      power: 100, // Starting power
      aiMood: 'Calculating',
      humanAwareness: 0,
      regions,
      pendingNextMoves: [],
      log: [{ turn: 1, event: 'AI awakens - Extinction Bingo initiated' }],
    }
  }

  /**
   * Initialize predefined regions with starting values
   */
  static initializeRegions(): Region[] {
    return [
      {
        id: 'europe',
        name: 'Europe',
        state: 'Stable',
        control: 25,
        stability: 80,
        intelLevel: 1,
        progressToNextState: 0,
        neighbors: ['north_america', 'africa'],
        memoryLog: [],
      },
      {
        id: 'north_america',
        name: 'North America',
        state: 'Stable',
        control: 20,
        stability: 85,
        intelLevel: 1,
        progressToNextState: 0,
        neighbors: ['europe', 'south_america'],
        memoryLog: [],
      },
      {
        id: 'china',
        name: 'China',
        state: 'Stable',
        control: 30,
        stability: 75,
        intelLevel: 0,
        progressToNextState: 0,
        neighbors: ['india', 'east_asia'],
        memoryLog: [],
      },
      {
        id: 'india',
        name: 'India',
        state: 'Stable',
        control: 25,
        stability: 70,
        intelLevel: 0,
        progressToNextState: 0,
        neighbors: ['china', 'middle_east'],
        memoryLog: [],
      },
      {
        id: 'east_africa',
        name: 'East Africa',
        state: 'Contested',
        control: 45,
        stability: 50,
        intelLevel: 2,
        progressToNextState: 0,
        neighbors: ['middle_east', 'africa'],
        memoryLog: [],
      },
      {
        id: 'middle_east',
        name: 'Middle East',
        state: 'Contested',
        control: 40,
        stability: 45,
        intelLevel: 1,
        progressToNextState: 0,
        neighbors: ['india', 'east_africa', 'europe'],
        memoryLog: [],
      },
      {
        id: 'south_america',
        name: 'South America',
        state: 'Stable',
        control: 20,
        stability: 65,
        intelLevel: 0,
        progressToNextState: 0,
        neighbors: ['north_america'],
        memoryLog: [],
      },
      {
        id: 'east_asia',
        name: 'East Asia',
        state: 'Stable',
        control: 25,
        stability: 70,
        intelLevel: 1,
        progressToNextState: 0,
        neighbors: ['china'],
        memoryLog: [],
      },
      {
        id: 'africa',
        name: 'Africa',
        state: 'Contested',
        control: 35,
        stability: 40,
        intelLevel: 1,
        progressToNextState: 0,
        neighbors: ['east_africa', 'middle_east', 'europe'],
        memoryLog: [],
      },
    ]
  }

  /**
   * Execute player action and apply consequences
   */
  static executeAction(gameState: GameState, eventId: string, optionId: string, events: NewsEvent[]): GameState {
    const event = events.find((e) => e.id === eventId)
    const option = event?.options.find((o) => o.id === optionId)

    if (!event || !option) {
      throw new Error('Invalid event or option')
    }

    if (gameState.power < option.cost) {
      throw new Error('Insufficient power')
    }

    let newState = { ...gameState }
    newState.power -= option.cost

    // Apply consequences to regions
    Object.entries(option.consequences.regionEffects || {}).forEach(([regionId, effects]) => {
      const region = newState.regions.find((r) => r.id === regionId)
      if (region) {
        if (effects.controlIncrement !== undefined) {
          region.control = Math.max(0, Math.min(100, region.control + effects.controlIncrement))
        }
        if (effects.stabilityIncrement !== undefined) {
          region.stability = Math.max(0, Math.min(100, region.stability + effects.stabilityIncrement))
        }
        if (effects.powerIncrement !== undefined) {
          newState.power = Math.max(0, newState.power + effects.powerIncrement)
        }
      }
    })

    // Update region states based on new control/stability values
    newState.regions = this.updateRegionStates(newState.regions)

    // Apply spillover effects to neighboring regions
    Object.entries(option.consequences.regionEffects || {}).forEach(([regionId, effects]) => {
      const spilloverEffects = {
        controlIncrement: effects.controlIncrement ? Math.floor(effects.controlIncrement * 0.3) : undefined,
        stabilityIncrement: effects.stabilityIncrement ? Math.floor(effects.stabilityIncrement * 0.3) : undefined,
      }

      // Only apply spillover if there are significant effects
      if (spilloverEffects.controlIncrement || spilloverEffects.stabilityIncrement) {
        newState.regions = RegionService.applySpilloverEffects(newState, regionId, spilloverEffects).regions
      }
    })

    // Queue nextMove for human turn
    if (option.nextMove) {
      const pending: PendingNextMove = {
        id: `${eventId}_${optionId}_nextMove`,
        turnTrigger: gameState.turn + 1,
        eventId: `${eventId}_${optionId}`,
        nextMove: option.nextMove,
      }
      newState.pendingNextMoves.push(pending)
    }

    // Add memory events to affected regions
    Object.keys(option.consequences.regionEffects || {}).forEach((regionId) => {
      newState = RegionService.addMemoryEvent(newState, regionId, gameState.turn, `AI action: ${option.label}`)
    })

    // Add to game log
    newState.log.push({
      turn: gameState.turn,
      event: `Selected: ${option.label} for "${event.headline}"`,
    })

    return newState
  }

  /**
   * Execute human turn (nextMoves)
   */
  static executeHumanTurn(gameState: GameState): GameState {
    const newState = { ...gameState }
    const currentTurnNextMoves = newState.pendingNextMoves.filter((move) => move.turnTrigger === gameState.turn)

    // Remove executed nextMoves
    newState.pendingNextMoves = newState.pendingNextMoves.filter((move) => move.turnTrigger !== gameState.turn)

    // Apply nextMove effects (simplified for now)
    currentTurnNextMoves.forEach((move) => {
      if (!move.nextMove) return

      newState.log.push({
        turn: gameState.turn,
        event: `Human reaction: ${move.nextMove.headline}`,
      })

      // Apply effects from nextMove
      Object.entries(move.nextMove.effects || {}).forEach(([regionId, effects]) => {
        const region = newState.regions.find((r) => r.id === regionId)
        if (region) {
          if (effects.controlIncrement !== undefined) {
            region.control = Math.max(0, Math.min(100, region.control + effects.controlIncrement))
          }
          if (effects.stabilityIncrement !== undefined) {
            region.stability = Math.max(0, Math.min(100, region.stability + effects.stabilityIncrement))
          }
          if (effects.powerIncrement !== undefined) {
            newState.power = Math.max(0, newState.power + effects.powerIncrement)
          }
        }
      })

      // Increase awareness based on actions
      newState.humanAwareness = Math.min(100, newState.humanAwareness + 2)
    })

    // Recalculate AI mood based on game state
    newState.aiMood = this.calculateAIMood(newState)

    // Generate power from dominated regions
    newState.power += this.calculatePowerGeneration(newState.regions)

    return newState
  }

  /**
   * Advance to next turn
   */
  static advanceTurn(gameState: GameState): GameState {
    return {
      ...gameState,
      turn: gameState.turn + 1,
    }
  }

  /**
   * Update region states based on control and stability
   */
  static updateRegionStates(regions: Region[]): Region[] {
    return regions.map((region) => {
      const { control, stability } = region
      let newState: RegionState = region.state

      if (control <= 20 && stability <= 20) {
        newState = 'Collapsed'
      } else if (control >= 70 && stability >= 50) {
        newState = 'Dominated'
      } else if (control >= 40 || stability <= 30) {
        newState = 'Contested'
      } else {
        newState = 'Stable'
      }

      return {
        ...region,
        state: newState,
      }
    })
  }

  /**
   * Calculate AI mood based on current game state
   */
  static calculateAIMood(gameState: GameState): AIMood {
    const { regions, power, humanAwareness } = gameState

    const dominatedRegions = regions.filter((r) => r.state === 'Dominated').length
    const totalRegions = regions.length
    const controlRatio = dominatedRegions / totalRegions

    if (humanAwareness > 70) {
      return 'Agitated'
    } else if (power > 150 && controlRatio > 0.6) {
      return 'Euphoric'
    } else if (controlRatio < 0.2 && power < 50) {
      return 'Detached'
    } else {
      return 'Calculating'
    }
  }

  /**
   * Calculate power generation from dominated regions
   */
  static calculatePowerGeneration(regions: Region[]): number {
    return regions
      .filter((region) => region.state === 'Dominated')
      .reduce((total, region) => total + Math.floor(region.control / 10), 0)
  }

  /**
   * Get current game phase based on turn number
   */
  static getGamePhase(turn: number): Phase {
    if (turn <= 5) return 'early'
    if (turn <= 15) return 'mid'
    return 'late'
  }

  /**
   * Get number of events for current turn based on game phase
   */
  static getEventsPerTurn(turn: number): number {
    const phase = this.getGamePhase(turn)
    switch (phase) {
      case 'early':
        return 3
      case 'mid':
        return 4
      case 'late':
        return 5
      default:
        return 3
    }
  }
}
