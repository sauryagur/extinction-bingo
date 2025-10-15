import { Action, Region, GameState } from '../models'

/**
 * Generates a simple, unique ID.
 * NOTE: For production, consider using a library like 'uuid' or relying on Firestore's ID generation.
 * @returns A unique string ID.
 */
export function generateUniqueId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// --- GameState Lookup Helpers ---

/**
 * Finds an Action object within a list by its ID.
 * @param actions Array of actions (the player's hand).
 * @param id The ID of the action to find.
 * @returns The Action object or undefined.
 */
export function findActionById(actions: Action[], id: string): Action | undefined {
  return actions.find((action) => action.id === id)
}

/**
 * Finds a Region object within a list by its ID.
 * @param regions Array of all regions on the map.
 * @param id The ID of the region to find.
 * @returns The Region object or undefined.
 */
export function findRegionById(regions: Region[], id: string): Region | undefined {
  return regions.find((region) => region.id === id)
}

// --- Metric and Calculation Helpers ---

/**
 * Calculates the Global Control Index: Avg(C - S) across all regions.
 * @param regions The array of all regions.
 * @returns The calculated Global Control Index (average difference).
 */
export function calculateGlobalMetrics(regions: Region[]): number {
  if (regions.length === 0) return 0

  const totalControlDifference = regions.reduce((sum, region) => {
    return sum + (region.control - region.stability)
  }, 0)

  // Normalize by the total number of regions
  return totalControlDifference / regions.length
}

/**
 * Applies the current turn's progress cap (GDD Rule: max progress per action capped).
 * This ensures gradual progression and prevents instant flips.
 * @param state The current GameState to get the progress cap from.
 * @param controlEffect The base Control progress effect.
 * @param stabilityEffect The base Stability progress effect.
 * @returns The combined and capped progress value to apply.
 */
export function applyProgressCap(state: GameState, controlEffect: number, stabilityEffect: number): number {
  // The GDD states actions increment ProgressToNextState.
  // Progress is based on the *net* impact of C and S changes toward the next desired state.

  // Simple approach: Use the magnitude of the largest effect.
  const baseProgress = Math.abs(controlEffect) + Math.abs(stabilityEffect)

  // Apply the cap
  return Math.min(baseProgress, state.progressCapPerAction)
}
