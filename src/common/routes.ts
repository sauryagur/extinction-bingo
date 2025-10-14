import { Router } from 'express'

// Import feature routers
import gameRouter from '../api/game/game.routes'
import actionRouter from '../api/action/action.routes'

const router: Router = Router()

// -------------------------------
// Higher-level route definitions
// -------------------------------
router.use('/game', gameRouter)
router.use('/action', actionRouter)

// Example: health check or root
router.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Extinction Bingo API online' })
})

export default router
