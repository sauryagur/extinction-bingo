// src/core/stateManager.ts (Updated Constructor and Methods)
import { GameState, GameEvent } from '../models' // Import all types needed by the methods
import { DBService } from '../services/db.service'
import { generateUniqueId } from '../common/utils'
/**
 * Manages the loading, saving, and initialization of the entire GameState object.
 */
export class StateManager {
  private dbService: DBService

  constructor() {
    // DBService handles all Firestore interactions now
    this.dbService = new DBService()
  }

  // ... (rest of the methods remain similar)

  public async initializeNewGame(): Promise<GameState> {
    // ... (creation of regions, bingo, hand)

    const initialState: GameState = {
      id: generateUniqueId(),
      turn: 0,
      status: 'InProgress',
      power: 0,
      globalControlIndex: 0,
      humanAwareness: 0,
      regions: [],
      winPersistenceCounter: 0,
      lossPersistenceCounter: 0,
      progressCapPerAction: 0,
      bingoCard: [],
      actionHand: [],
      gameLog: [],
    }

    // Use createGame for first save, since ID is generated locally
    await this.dbService.createGame(initialState)

    return initialState
  }

  public async loadGame(gameId: string): Promise<GameState | null> {
    // Use loadGameState for loading
    const state = await this.dbService.loadGameState(gameId)
    return state ? (state as GameState) : null
  }

  public async saveGame(state: GameState): Promise<void> {
    // Use saveGameState for subsequent updates
    await this.dbService.saveGameState(state)
  }

  public async logEventAndSave(state: GameState, event: GameEvent): Promise<void> {
    // FIX: Ensure 'state' and 'event' are used explicitly
    state.gameLog.push(event) // uses state
    await this.saveGame(state) // uses state
    // If necessary, add a line that uses 'event' for logging or checking if the linter complains:
    // console.log(`Logged event type: ${event.eventType}`);
  }
}
