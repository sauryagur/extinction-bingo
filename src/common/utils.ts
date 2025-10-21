import { v4 as uuidv4 } from 'uuid'
import { Region } from '../models/region'

/**
 * Calculates the globalControlIndex, which is the average of (Control - Stability) across all regions.
 * This metric represents the AI's overall dominance vs. global cohesion.
 *
 * @param regions - An array of all regions in the game state.
 * @returns The calculated global control index.
 */
export const calculateGlobalMetrics = (regions: Region[]): number => {
  if (!regions || regions.length === 0) {
    return 0
  }
  const totalDifference = regions.reduce((acc, region) => acc + (region.control - region.stability), 0)
  return totalDifference / regions.length
}

/**
 * Safely finds a region by its ID from an array of regions.
 * Throws an error if the region is not found to ensure call sites handle missing data.
 *
 * @param regions - The array of regions to search.
 * @param id - The ID of the region to find.
 * @returns The found Region object.
 * @throws Will throw an error if the region with the specified ID is not found.
 */
export const findRegionById = (regions: Region[], id: string): Region => {
  const region = regions.find((r) => r.id === id)
  if (!region) {
    throw new Error(`Region with ID "${id}" not found.`)
  }
  return region
}

/**
 * Calculates final progress value to be applied to a region's state change.
 * The total effect is sum of absolute values of control and stability effects.
 *
 * @param controlEffect - The base control effect of the action.
 * @param stabilityEffect - The base stability effect of the action.
 * @returns The progress value.
 */
export const calculateProgressValue = (controlEffect: number, stabilityEffect: number): number => {
  return Math.abs(controlEffect) + Math.abs(stabilityEffect)
}

/**
 * Generates a unique identifier using UUIDv4.
 *
 * @returns A unique string ID.
 */
export const generateUniqueId = (): string => {
  return uuidv4()
}
