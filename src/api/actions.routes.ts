// src/api/actions.routes.ts

import { Router, Request, Response } from 'express'
import { GameEngine } from '../core/gameEngine'
import { GameState } from '../models'

const router = Router()
const gameEngine = new GameEngine()

// Interface for the expected request body when executing an action
interface ExecuteActionBody {
  gameId: string
  actionId: string
  targetRegionId: string
}

// Interface for the expected request body when ending a turn
interface EndTurnBody {
  gameId: string
}

/**
 * @route POST /api/actions/execute
 * @description Executes a single action (News Event) on a target region.
 * @access Public/Authenticated
 */
// FIX: Remove explicit 'any' in Request generics by using a simpler Request type
router.post('/execute', async (req: Request, res: Response) => {
  const { gameId, actionId, targetRegionId } = req.body as ExecuteActionBody

  if (!gameId || !actionId || !targetRegionId) {
    return res.status(400).json({ message: 'Missing required parameters: gameId, actionId, or targetRegionId.' })
  }

  try {
    const { updatedState, narrative } = await gameEngine.executeAction(gameId, actionId, targetRegionId)

    res.status(200).json({
      message: 'Action executed successfully.',
      narrative: narrative,
      powerRemaining: updatedState.power,
      updatedRegion: updatedState.regions.find((r) => r.id === targetRegionId),
      gameState: updatedState,
    })
  } catch (error: unknown) {
    // FIX: Changed 'any' to 'unknown'
    console.error('[ActionRoutes] Error executing action:', error)

    // Safely access properties on the error object
    const errorMessage = error instanceof Error ? error.message : (error as any).message || 'Failed to execute action.'
    const errorStatus = (error as any).status || 500 // Custom errors might attach a status

    res.status(errorStatus).json({ message: errorMessage })
  }
})

/**
 * @route POST /api/actions/endTurn
 * @description Finalizes the current turn, resolves all state flips,
 * updates metrics, and generates the new Action Hand.
 * @access Public/Authenticated
 */
// FIX: Remove explicit 'any' in Request generics by using a simpler Request type
router.post('/endTurn', async (req: Request, res: Response) => {
  const { gameId } = req.body as EndTurnBody

  if (!gameId) {
    return res.status(400).json({ message: 'Missing required parameter: gameId.' })
  }

  try {
    const nextState: GameState = await gameEngine.endTurn(gameId)

    if (nextState.status !== 'InProgress') {
      const finalEpilogue = await gameEngine.generateFinalEpilogue(nextState)
      return res.status(200).json({
        message: `Game Over: ${nextState.status}`,
        epilogue: finalEpilogue,
        gameState: nextState,
      })
    }

    res.status(200).json({
      message: `Turn ${nextState.turn} started. New Action Hand generated.`,
      gameState: nextState,
    })
  } catch (error: unknown) {
    // FIX: Changed 'any' to 'unknown'
    console.error('[ActionRoutes] Error ending turn:', error)

    // Safely access properties on the error object
    const errorMessage = error instanceof Error ? error.message : (error as any).message || 'Failed to end turn.'
    const errorStatus = (error as any).status || 500

    res.status(errorStatus).json({ message: errorMessage })
  }
})

export default router
