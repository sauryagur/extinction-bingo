/**
 * @file db.service.ts
 * @description Firestore helper functions for interacting with the 'games' collection.
 */

import { db } from './firebase.service'
import { GameState } from '../models/GameState'

const gameCollection = db.collection('games')

export async function createGame(gameState: GameState): Promise<string> {
  const docRef = await gameCollection.add({
    ...gameState,
    updatedAt: Date.now(),
  })
  return docRef.id
}

export async function getGameById(id: string): Promise<GameState | null> {
  const doc = await gameCollection.doc(id).get()
  return doc.exists ? (doc.data() as GameState) : null
}

export async function updateGame(id: string, data: Partial<GameState>): Promise<void> {
  await gameCollection.doc(id).update({
    ...data,
    updatedAt: Date.now(),
  })
}

export async function deleteGame(id: string): Promise<void> {
  await gameCollection.doc(id).delete()
}

export default { createGame, getGameById, updateGame, deleteGame }
