import { Router } from 'express'
// import * as actionController from './action.controller'

const router: Router = Router()

/**
 * @route GET /api/action/hand/:gameId
 * @description Generate a new "hand" of potential actions (news events) for the current turn.
 * @access Public
 */
// router.get('/hand/:gameId', actionController.generateActionHand)

/**
 * @route POST /api/action/execute/:gameId
 * @description Execute a chosen action from the hand — applies Power/WAL cost, modifies region metrics, logs narrative.
 * @access Public
 */
// router.post('/execute/:gameId', actionController.executeAction)

/**
 * @route POST /api/action/simulate/:gameId
 * @description (Optional) Preview or simulate an action outcome without committing it to the GameState.
 * @access Public
 */
// router.post('/simulate/:gameId', actionController.simulateAction)

export default router
