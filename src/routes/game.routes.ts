// src/routes/game.routes.ts
import { Router, Request, Response } from 'express'
import { GameService } from '../services/game.service'
import { DBService } from '../services/db.service'
import { NewsEvent } from '../models/event'
import { z } from 'zod'

const router = Router()

// Validation schemas
const CreateGameSchema = z.object({
  playerName: z.string().optional(),
})

const ExecuteActionSchema = z.object({
  eventId: z.string(),
  optionId: z.string(),
})

// POST /api/games - Create new game session
router.post('/', async (req: Request, res: Response) => {
  try {
    const { playerName } = CreateGameSchema.parse(req.body)

    // Create new game state
    const gameState = GameService.createNewGame()

    // Save to database
    const dbService = new DBService()
    await dbService.createGame(gameState)

    res.status(201).json({
      success: true,
      data: {
        sessionId: gameState.sessionId,
        turn: gameState.turn,
        power: gameState.power,
        aiMood: gameState.aiMood,
        humanAwareness: gameState.humanAwareness,
        regions: gameState.regions,
        log: gameState.log,
      },
    })
  } catch (error) {
    console.error('Error creating game:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create game session',
    })
  }
})

// GET /api/games/:sessionId - Get current game state
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
      data: gameState,
    })
  } catch (error) {
    console.error('Error fetching game state:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch game state',
    })
  }
})

// POST /api/games/:sessionId/actions - Execute player action
router.post('/:sessionId/actions', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params
    const { eventId, optionId } = ExecuteActionSchema.parse(req.body)

    // Get current game state
    const dbService = new DBService()
    const gameState = await dbService.loadGameState(sessionId)
    if (!gameState) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found',
      })
    }

    // Get current turn events (for now, return empty array - will be replaced with LLM integration)
    const events: NewsEvent[] = [] // TODO: Replace with LLM-generated events

    // Execute action
    const updatedState = GameService.executeAction(gameState, eventId, optionId, events)

    // Save updated state
    await dbService.saveGameState(updatedState)

    res.json({
      success: true,
      data: {
        power: updatedState.power,
        regions: updatedState.regions,
        pendingNextMoves: updatedState.pendingNextMoves,
        log: updatedState.log,
      },
    })
  } catch (error) {
    console.error('Error executing action:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to execute action',
    })
  }
})

// POST /api/games/:sessionId/turns/advance - Advance to next turn (execute human turn)
router.post('/:sessionId/turns/advance', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params

    // Get current game state
    const dbService = new DBService()
    const gameState = await dbService.loadGameState(sessionId)
    if (!gameState) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found',
      })
    }

    // Execute human turn
    let updatedState = GameService.executeHumanTurn(gameState)

    // Advance to next turn
    updatedState = GameService.advanceTurn(updatedState)

    // Save updated state
    await dbService.saveGameState(updatedState)

    res.json({
      success: true,
      data: {
        turn: updatedState.turn,
        power: updatedState.power,
        aiMood: updatedState.aiMood,
        humanAwareness: updatedState.humanAwareness,
        regions: updatedState.regions,
        pendingNextMoves: updatedState.pendingNextMoves,
        log: updatedState.log,
      },
    })
  } catch (error) {
    console.error('Error advancing turn:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to advance turn',
    })
  }
})

// GET /api/games/:sessionId/events - Get current turn events
router.get('/:sessionId/events', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params

    // Get current game state
    const dbService = new DBService()
    const gameState = await dbService.loadGameState(sessionId)
    if (!gameState) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found',
      })
    }

    // For now, return empty array - will be replaced with LLM integration
    const events: NewsEvent[] = []
    const eventsPerTurn = GameService.getEventsPerTurn(gameState.turn)

    res.json({
      success: true,
      data: {
        events,
        eventsPerTurn,
        turn: gameState.turn,
        phase: GameService.getGamePhase(gameState.turn),
      },
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
    })
  }
})

// DELETE /api/games/:sessionId - Delete game session
router.delete('/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params

    const dbService = new DBService()
    await dbService.deleteGame(sessionId)

    res.json({
      success: true,
      message: 'Game session deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting game session:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete game session',
    })
  }
})

export default router
