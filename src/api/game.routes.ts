import { Router, Request, Response } from 'express'
import { StateManager } from '../core/stateManager'
import { GameState } from '../models'

const router = Router()
const stateManager = new StateManager() // Assuming StateManager handles game CRUD

/**
 * @route POST /api/game/new
 * @description Creates and initializes a new game session.
 * @access Public
 */
router.post('/new', async (req: Request, res: Response) => {
  try {
    // In a real app, you'd handle user authentication here
    const newGame: GameState = await stateManager.initializeNewGame()

    // Return the initial state, likely without the full game log to keep the response light
    res.status(201).json({
      message: 'New game started successfully.',
      gameId: newGame.id,
      gameState: newGame,
    })
  } catch (error) {
    console.error('[GameRoutes] Error starting new game:', error)
    res.status(500).json({ message: 'Failed to start new game.' })
  }
})

/**
 * @route GET /api/game/:gameId
 * @description Retrieves the current state of a specific game session.
 * @access Public/Authenticated
 */
router.get('/:gameId', async (req: Request, res: Response) => {
  const { gameId } = req.params

  try {
    const gameState: GameState | null = await stateManager.loadGame(gameId)

    if (!gameState) {
      return res.status(404).json({ message: 'Game session not found.' })
    }

    res.status(200).json(gameState)
  } catch (error) {
    console.error(`[GameRoutes] Error loading game ${gameId}:`, error)
    res.status(500).json({ message: 'Failed to load game state.' })
  }
})

export default router
