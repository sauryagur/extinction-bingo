// src/routes/region.routes.ts
import { Router, Request, Response } from 'express'
import { RegionService } from '../services/region.service'
import { DBService } from '../services/db.service'
import { RegionState } from '../models/region'

const router = Router()

// GET /api/regions/:sessionId - Get all regions for a game session
router.get('/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params

    const dbService = new DBService()
    const gameState = await dbService.loadGameState(sessionId)

    if (!gameState) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found',
      })
    }

    res.json({
      success: true,
      data: {
        regions: gameState.regions,
        summary: RegionService.getAllRegionsSummary(gameState),
      },
    })
  } catch (error) {
    console.error('Error fetching regions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regions',
    })
  }
})

// GET /api/regions/:sessionId/:regionId - Get specific region details
router.get('/:sessionId/:regionId', async (req: Request, res: Response) => {
  try {
    const { sessionId, regionId } = req.params

    const dbService = new DBService()
    const gameState = await dbService.loadGameState(sessionId)

    if (!gameState) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found',
      })
    }

    const region = RegionService.getRegionById(gameState, regionId)

    if (!region) {
      return res.status(404).json({
        success: false,
        error: 'Region not found',
      })
    }

    const neighbors = RegionService.getNeighborRegions(gameState, regionId)
    const canTarget = RegionService.canTargetRegion(region)
    const actionCostMultiplier = RegionService.getActionCostMultiplier(region)
    const powerGeneration = RegionService.getPowerGeneration(region)

    res.json({
      success: true,
      data: {
        region,
        neighbors: neighbors.map((n) => ({ id: n.id, name: n.name })),
        canTarget,
        actionCostMultiplier,
        powerGeneration,
        summary: RegionService.getRegionSummary(region),
      },
    })
  } catch (error) {
    console.error('Error fetching region:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch region',
    })
  }
})

// GET /api/regions/:sessionId/state/:state - Get regions by state
router.get('/:sessionId/state/:state', async (req: Request, res: Response) => {
  try {
    const { sessionId, state } = req.params

    const dbService = new DBService()
    const gameState = await dbService.loadGameState(sessionId)

    if (!gameState) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found',
      })
    }

    const regions = RegionService.getRegionsByState(gameState, state as RegionState)

    res.json({
      success: true,
      data: {
        state,
        regions,
        count: regions.length,
      },
    })
  } catch (error) {
    console.error('Error fetching regions by state:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regions by state',
    })
  }
})

// GET /api/regions/:sessionId/intel/:minLevel - Get regions with minimum intel level
router.get('/:sessionId/intel/:minLevel', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params
    const minLevel = parseInt(req.params.minLevel)

    if (isNaN(minLevel) || minLevel < 0 || minLevel > 3) {
      return res.status(400).json({
        success: false,
        error: 'Invalid intel level. Must be between 0 and 3.',
      })
    }

    const dbService = new DBService()
    const gameState = await dbService.loadGameState(sessionId)

    if (!gameState) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found',
      })
    }

    const regions = RegionService.getRegionsWithIntel(gameState, minLevel)

    res.json({
      success: true,
      data: {
        minIntelLevel: minLevel,
        regions,
        count: regions.length,
      },
    })
  } catch (error) {
    console.error('Error fetching regions by intel level:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regions by intel level',
    })
  }
})

export default router
