// src/services/region.service.ts
import { Region, RegionState } from '../models/region'
import { GameState } from '../models/gameState'

export class RegionService {
  /**
   * Get region by ID from game state
   */
  static getRegionById(gameState: GameState, regionId: string): Region | null {
    return gameState.regions.find((region) => region.id === regionId) || null
  }

  /**
   * Get all neighboring regions of a given region
   */
  static getNeighborRegions(gameState: GameState, regionId: string): Region[] {
    const region = this.getRegionById(gameState, regionId)
    if (!region) return []

    return gameState.regions.filter((r) => region.neighbors.includes(r.id))
  }

  /**
   * Check if two regions are neighbors
   */
  static areNeighbors(region1: Region, region2: Region): boolean {
    return region1.neighbors.includes(region2.id) || region2.neighbors.includes(region1.id)
  }

  /**
   * Apply spillover effects from one region to its neighbors
   */
  static applySpilloverEffects(
    gameState: GameState,
    sourceRegionId: string,
    effects: {
      controlIncrement?: number
      stabilityIncrement?: number
      intelIncrement?: number
    },
  ): GameState {
    const newState = { ...gameState }
    const sourceRegion = this.getRegionById(newState, sourceRegionId)

    if (!sourceRegion) return gameState

    // Apply effects to neighbors with reduced impact
    const neighbors = this.getNeighborRegions(newState, sourceRegionId)

    neighbors.forEach((neighbor) => {
      const neighborIndex = newState.regions.findIndex((r) => r.id === neighbor.id)
      if (neighborIndex === -1) return

      // Spillover effects are reduced (50% impact)
      if (effects.controlIncrement !== undefined) {
        newState.regions[neighborIndex].control = Math.max(
          0,
          Math.min(100, newState.regions[neighborIndex].control + Math.floor(effects.controlIncrement * 0.5)),
        )
      }

      if (effects.stabilityIncrement !== undefined) {
        newState.regions[neighborIndex].stability = Math.max(
          0,
          Math.min(100, newState.regions[neighborIndex].stability + Math.floor(effects.stabilityIncrement * 0.5)),
        )
      }

      if (effects.intelIncrement !== undefined) {
        newState.regions[neighborIndex].intelLevel = Math.max(
          0,
          Math.min(3, newState.regions[neighborIndex].intelLevel + effects.intelIncrement),
        )
      }
    })

    return newState
  }

  /**
   * Add memory event to region's memory log
   */
  static addMemoryEvent(gameState: GameState, regionId: string, turn: number, event: string): GameState {
    const newState = { ...gameState }
    const regionIndex = newState.regions.findIndex((r) => r.id === regionId)

    if (regionIndex === -1) return gameState

    newState.regions[regionIndex].memoryLog.push({
      turn,
      event,
    })

    // Keep only last 10 memory events to prevent bloat
    if (newState.regions[regionIndex].memoryLog.length > 10) {
      newState.regions[regionIndex].memoryLog = newState.regions[regionIndex].memoryLog.slice(-10)
    }

    return newState
  }

  /**
   * Update intel level for a region
   */
  static updateIntelLevel(gameState: GameState, regionId: string, intelChange: number): GameState {
    const newState = { ...gameState }
    const regionIndex = newState.regions.findIndex((r) => r.id === regionId)

    if (regionIndex === -1) return gameState

    newState.regions[regionIndex].intelLevel = Math.max(
      0,
      Math.min(3, newState.regions[regionIndex].intelLevel + intelChange),
    )

    return newState
  }

  /**
   * Get regions by state
   */
  static getRegionsByState(gameState: GameState, state: RegionState): Region[] {
    return gameState.regions.filter((region) => region.state === state)
  }

  /**
   * Get regions with intel level >= minimumLevel
   */
  static getRegionsWithIntel(gameState: GameState, minimumLevel: number): Region[] {
    return gameState.regions.filter((region) => region.intelLevel >= minimumLevel)
  }

  /**
   * Calculate regional stability score (0-100)
   */
  static calculateRegionalStability(region: Region): number {
    // Base stability modified by control and memory log
    let stability = region.stability

    // High AI control reduces stability
    if (region.control > 60) {
      stability -= (region.control - 60) * 0.3
    }

    // Recent negative events in memory reduce stability
    const recentNegativeEvents = region.memoryLog.filter(
      (memory) =>
        memory.event.toLowerCase().includes('riot') ||
        memory.event.toLowerCase().includes('rebellion') ||
        memory.event.toLowerCase().includes('collapse'),
    ).length

    stability -= recentNegativeEvents * 5

    return Math.max(0, Math.min(100, stability))
  }

  /**
   * Calculate regional control pressure (0-100)
   */
  static calculateControlPressure(region: Region): number {
    // Base control modified by neighboring regions
    const pressure = region.control

    // If neighbors are dominated, increases pressure
    // This would require game state to check neighbors
    // For now, return base control
    return Math.max(0, Math.min(100, pressure))
  }

  /**
   * Get region summary for LLM context
   */
  static getRegionSummary(region: Region): string {
    const stateDescriptions = {
      Stable: 'Human control remains strong',
      Contested: 'AI and human forces struggle for dominance',
      Dominated: 'AI has established significant control',
      Collapsed: 'Society has broken down completely',
    }

    const intelDescriptions = {
      0: 'No intelligence available',
      1: 'Limited intelligence - rumors only',
      2: 'Moderate intelligence - estimates available',
      3: 'Deep intelligence - precise information',
    }

    return (
      `${region.name}: ${stateDescriptions[region.state]}. ` +
      `Control: ${region.control}%, Stability: ${region.stability}%. ` +
      `Intel: ${intelDescriptions[region.intelLevel]}. ` +
      (region.memoryLog.length > 0
        ? `Recent events: ${region.memoryLog
            .slice(-2)
            .map((m) => m.event)
            .join(', ')}.`
        : 'No recent significant events.')
    )
  }

  /**
   * Get all regions summary for LLM context
   */
  static getAllRegionsSummary(gameState: GameState): string {
    return gameState.regions.map((region) => this.getRegionSummary(region)).join(' | ')
  }

  /**
   * Validate region data integrity
   */
  static validateRegion(region: Region): boolean {
    // Check required fields
    if (!region.id || !region.name) return false

    // Check value ranges
    if (region.control < 0 || region.control > 100) return false
    if (region.stability < 0 || region.stability > 100) return false
    if (region.intelLevel < 0 || region.intelLevel > 3) return false

    // Check valid state
    const validStates: RegionState[] = ['Stable', 'Contested', 'Dominated', 'Collapsed']
    if (!validStates.includes(region.state)) return false

    // Check neighbors exist (would need game state to validate)
    return true
  }

  /**
   * Get regional power generation potential
   */
  static getPowerGeneration(region: Region): number {
    if (region.state !== 'Dominated') return 0

    // Power generation based on control level
    return Math.floor(region.control / 10)
  }

  /**
   * Check if region can be targeted by AI actions
   */
  static canTargetRegion(region: Region, minIntelLevel: number = 1): boolean {
    return region.intelLevel >= minIntelLevel && region.state !== 'Collapsed'
  }

  /**
   * Get action cost multiplier for region based on state and intel
   */
  static getActionCostMultiplier(region: Region): number {
    let multiplier = 1.0

    // Higher cost for stable regions
    if (region.state === 'Stable') multiplier *= 1.5

    // Higher cost for low intel regions
    if (region.intelLevel === 0) multiplier *= 2.0
    else if (region.intelLevel === 1) multiplier *= 1.3

    return multiplier
  }
}
