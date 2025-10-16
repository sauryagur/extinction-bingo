// src/common/routes.ts

import { Router } from 'express'
import gameRoutes from '../api/game.routes'
import actionRoutes from '../api/actions.routes'

const router = Router()

/**
 * Game session routes (e.g., /api/game/new, /api/game/:id)
 */
router.use('/game', gameRoutes)

/**
 * Gameplay action routes (e.g., /api/actions/execute, /api/actions/endTurn)
 */
router.use('/actions', actionRoutes)

// Add other routers here if they exist

export default router
