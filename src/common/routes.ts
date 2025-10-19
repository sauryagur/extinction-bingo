import { Router } from 'express'
import gameRoutes from '../routes/game.routes'

// Import feature routers
const router: Router = Router()

// -------------------------------
// Higher-level route definitions
// -------------------------------

// Example: health check or root
router.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Extinction Bingo API online' })
})

// Game routes
router.use('/games', gameRoutes)

export default router
