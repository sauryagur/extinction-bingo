import { Router } from 'express'
// import * as gameController from './game.controller'

const router: Router = Router()

/**
 * @route POST /api/game/new
 * @description Initialize a new game session and create the base GameState document.
 * @access Public
 */
//router.post('/new', gameController.createNewGame)

/**
 * @route GET /api/game/:id
 * @description Retrieve the full current GameState for a given session ID.
 * @access Public
 */
//router.get('/:id', gameController.getGameState)

/**
 * @route POST /api/game/:id/turn
 * @description Progress the game by one turn — applies passive effects, recalculates metrics, checks win/loss conditions.
 * @access Public
 */
//router.post('/:id/turn', gameController.progressTurn)

/**
 * @route DELETE /api/game/:id
 * @description Delete or reset a specific game session.
 * @access Public
 */
// router.delete('/:id', gameController.deleteGame)

export default router
