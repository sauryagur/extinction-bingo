// src/services/__tests__/region.service.test.ts
import { RegionService } from '../region.service'
import { GameState } from '../../models/gameState'
import { Region, RegionState } from '../../models/region'

describe('RegionService', () => {
  let mockGameState: GameState
  let mockRegions: Region[]

  beforeEach(() => {
    mockRegions = [
      {
        id: 'europe',
        name: 'Europe',
        state: 'Stable',
        control: 25,
        stability: 80,
        intelLevel: 1,
        progressToNextState: 0,
        neighbors: ['north_america', 'middle_east'],
        memoryLog: [],
      },
      {
        id: 'north_america',
        name: 'North America',
        state: 'Contested',
        control: 45,
        stability: 60,
        intelLevel: 2,
        progressToNextState: 0,
        neighbors: ['europe', 'south_america'],
        memoryLog: [],
      },
      {
        id: 'middle_east',
        name: 'Middle East',
        state: 'Dominated',
        control: 75,
        stability: 40,
        intelLevel: 3,
        progressToNextState: 0,
        neighbors: ['europe', 'east_africa'],
        memoryLog: [],
      },
    ]

    mockGameState = {
      sessionId: 'test-game',
      turn: 5,
      power: 100,
      aiMood: 'Calculating',
      humanAwareness: 30,
      regions: mockRegions,
      pendingNextMoves: [],
      log: [],
    }
  })

  describe('getRegionById', () => {
    it('should return region when found', () => {
      const region = RegionService.getRegionById(mockGameState, 'europe')
      expect(region).toEqual(mockRegions[0])
    })

    it('should return null when not found', () => {
      const region = RegionService.getRegionById(mockGameState, 'nonexistent')
      expect(region).toBeNull()
    })
  })

  describe('getNeighborRegions', () => {
    it('should return neighboring regions', () => {
      const neighbors = RegionService.getNeighborRegions(mockGameState, 'europe')
      expect(neighbors).toHaveLength(2)
      expect(neighbors.map((n) => n.id)).toContain('north_america')
      expect(neighbors.map((n) => n.id)).toContain('middle_east')
    })

    it('should return empty array for nonexistent region', () => {
      const neighbors = RegionService.getNeighborRegions(mockGameState, 'nonexistent')
      expect(neighbors).toHaveLength(0)
    })
  })

  describe('areNeighbors', () => {
    it('should return true for neighboring regions', () => {
      const europe = mockRegions[0]
      const northAmerica = mockRegions[1]
      expect(RegionService.areNeighbors(europe, northAmerica)).toBe(true)
    })

    it('should return false for non-neighboring regions', () => {
      const northAmerica = mockRegions[1]
      const middleEast = mockRegions[2]
      expect(RegionService.areNeighbors(northAmerica, middleEast)).toBe(false)
    })
  })

  describe('applySpilloverEffects', () => {
    it('should apply reduced effects to neighbors', () => {
      const updatedState = RegionService.applySpilloverEffects(mockGameState, 'europe', {
        controlIncrement: 10,
        stabilityIncrement: -8,
      })

      const northAmerica = RegionService.getRegionById(updatedState, 'north_america')
      const middleEast = RegionService.getRegionById(updatedState, 'middle_east')

      expect(northAmerica?.control).toBe(50) // 45 + floor(10 * 0.5) = 50
      expect(northAmerica?.stability).toBe(56) // 60 + floor(-8 * 0.5) = 56
      expect(middleEast?.control).toBe(80) // 75 + floor(10 * 0.5) = 80
      expect(middleEast?.stability).toBe(36) // 40 + floor(-8 * 0.5) = 36
    })

    it('should not affect source region', () => {
      const originalEurope = RegionService.getRegionById(mockGameState, 'europe')
      const updatedState = RegionService.applySpilloverEffects(mockGameState, 'europe', {
        controlIncrement: 10,
      })

      const updatedEurope = RegionService.getRegionById(updatedState, 'europe')
      expect(updatedEurope?.control).toBe(originalEurope?.control)
    })
  })

  describe('addMemoryEvent', () => {
    it('should add memory event to region', () => {
      const updatedState = RegionService.addMemoryEvent(mockGameState, 'europe', 5, 'Test event')

      const europe = RegionService.getRegionById(updatedState, 'europe')
      expect(europe?.memoryLog).toHaveLength(1)
      expect(europe?.memoryLog[0]).toEqual({
        turn: 5,
        event: 'Test event',
      })
    })

    it('should limit memory log to 10 events', () => {
      let state = mockGameState

      // Add 12 events
      for (let i = 1; i <= 12; i++) {
        state = RegionService.addMemoryEvent(state, 'europe', i, `Event ${i}`)
      }

      const europe = RegionService.getRegionById(state, 'europe')
      expect(europe?.memoryLog).toHaveLength(10)
      expect(europe?.memoryLog[0].event).toBe('Event 3') // First 2 should be removed
      expect(europe?.memoryLog[9].event).toBe('Event 12') // Last should remain
    })
  })

  describe('updateIntelLevel', () => {
    it('should update intel level within bounds', () => {
      const updatedState = RegionService.updateIntelLevel(mockGameState, 'europe', 1)

      const europe = RegionService.getRegionById(updatedState, 'europe')
      expect(europe?.intelLevel).toBe(2) // 1 + 1 = 2
    })

    it('should not exceed maximum intel level', () => {
      const updatedState = RegionService.updateIntelLevel(mockGameState, 'europe', 5)

      const europe = RegionService.getRegionById(updatedState, 'europe')
      expect(europe?.intelLevel).toBe(3) // Capped at 3
    })

    it('should not go below minimum intel level', () => {
      const updatedState = RegionService.updateIntelLevel(mockGameState, 'europe', -2)

      const europe = RegionService.getRegionById(updatedState, 'europe')
      expect(europe?.intelLevel).toBe(0) // Capped at 0
    })
  })

  describe('getRegionsByState', () => {
    it('should return regions with specified state', () => {
      const stableRegions = RegionService.getRegionsByState(mockGameState, 'Stable')
      expect(stableRegions).toHaveLength(1)
      expect(stableRegions[0].id).toBe('europe')

      const dominatedRegions = RegionService.getRegionsByState(mockGameState, 'Dominated')
      expect(dominatedRegions).toHaveLength(1)
      expect(dominatedRegions[0].id).toBe('middle_east')
    })
  })

  describe('getRegionsWithIntel', () => {
    it('should return regions with minimum intel level', () => {
      const regionsWithIntel2 = RegionService.getRegionsWithIntel(mockGameState, 2)
      expect(regionsWithIntel2).toHaveLength(2)
      expect(regionsWithIntel2.map((r) => r.id)).toContain('north_america')
      expect(regionsWithIntel2.map((r) => r.id)).toContain('middle_east')
    })
  })

  describe('calculateRegionalStability', () => {
    it('should calculate stability with control penalty', () => {
      const highControlRegion: Region = {
        ...mockRegions[0],
        control: 80,
        stability: 70,
      }

      const stability = RegionService.calculateRegionalStability(highControlRegion)
      expect(stability).toBeLessThan(70) // Should be reduced due to high control
    })

    it('should calculate stability with negative memory events', () => {
      const regionWithBadMemory: Region = {
        ...mockRegions[0],
        memoryLog: [
          { turn: 1, event: 'Major riots erupt' },
          { turn: 2, event: 'Rebellion starts' },
        ],
      }

      const stability = RegionService.calculateRegionalStability(regionWithBadMemory)
      expect(stability).toBeLessThan(80) // Should be reduced due to negative events
    })
  })

  describe('getPowerGeneration', () => {
    it('should return power for dominated regions', () => {
      const dominatedRegion = mockRegions[2] // control: 75
      const power = RegionService.getPowerGeneration(dominatedRegion)
      expect(power).toBe(7) // Math.floor(75 / 10) = 7
    })

    it('should return 0 for non-dominated regions', () => {
      const stableRegion = mockRegions[0]
      const power = RegionService.getPowerGeneration(stableRegion)
      expect(power).toBe(0)
    })
  })

  describe('canTargetRegion', () => {
    it('should return true for targetable regions', () => {
      const region = mockRegions[1] // intelLevel: 2
      expect(RegionService.canTargetRegion(region, 2)).toBe(true)
      expect(RegionService.canTargetRegion(region, 1)).toBe(true)
    })

    it('should return false for low intel regions', () => {
      const region = mockRegions[0] // intelLevel: 1
      expect(RegionService.canTargetRegion(region, 2)).toBe(false)
    })

    it('should return false for collapsed regions', () => {
      const collapsedRegion: Region = {
        ...mockRegions[0],
        state: 'Collapsed',
        intelLevel: 3,
      }
      expect(RegionService.canTargetRegion(collapsedRegion)).toBe(false)
    })
  })

  describe('getActionCostMultiplier', () => {
    it('should return higher multiplier for stable regions', () => {
      const stableRegion = mockRegions[0] // state: Stable
      const multiplier = RegionService.getActionCostMultiplier(stableRegion)
      expect(multiplier).toBeGreaterThan(1.0)
    })

    it('should return higher multiplier for low intel regions', () => {
      const lowIntelRegion: Region = {
        ...mockRegions[0],
        intelLevel: 0,
      }
      const multiplier = RegionService.getActionCostMultiplier(lowIntelRegion)
      expect(multiplier).toBe(3.0) // 1.5 (stable) * 2.0 (intel 0) = 3.0
    })
  })

  describe('validateRegion', () => {
    it('should return true for valid region', () => {
      const validRegion = mockRegions[0]
      expect(RegionService.validateRegion(validRegion)).toBe(true)
    })

    it('should return false for invalid control values', () => {
      const invalidRegion = { ...mockRegions[0], control: 150 }
      expect(RegionService.validateRegion(invalidRegion)).toBe(false)
    })

    it('should return false for invalid state', () => {
      const invalidRegion = { ...mockRegions[0], state: 'Invalid' as RegionState }
      expect(RegionService.validateRegion(invalidRegion)).toBe(false)
    })
  })

  describe('getRegionSummary', () => {
    it('should return formatted region summary', () => {
      const summary = RegionService.getRegionSummary(mockRegions[0])
      expect(summary).toContain('Europe')
      expect(summary).toContain('Human control remains strong')
      expect(summary).toContain('Control: 25%')
      expect(summary).toContain('Stability: 80%')
      expect(summary).toContain('Limited intelligence')
    })
  })

  describe('getAllRegionsSummary', () => {
    it('should return summary of all regions', () => {
      const summary = RegionService.getAllRegionsSummary(mockGameState)
      expect(summary).toContain('Europe')
      expect(summary).toContain('North America')
      expect(summary).toContain('Middle East')
      expect(summary).toContain(' | ') // Should be separated by pipes
    })
  })
})
