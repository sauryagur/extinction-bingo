// src/models/types.ts
export type RegionState = 'Stable' | 'Contested' | 'Dominated' | 'Collapsed'

export type AIMood = 'Calculating' | 'Agitated' | 'Detached' | 'Euphoric'

export type RiskLevel = 'Low' | 'Moderate' | 'High'

export interface RegionEffect {
  powerIncrement?: number
  controlIncrement?: number
  stabilityIncrement?: number
}

export interface ConsequenceMap {
  regionEffects: Record<string, RegionEffect>
}
