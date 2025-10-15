import { Router } from 'express'

// Import feature routers
const router: Router = Router()

// -------------------------------
// Higher-level route definitions
// -------------------------------s

// Example: health check or root
router.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Extinction Bingo API online' })
})

export default router
