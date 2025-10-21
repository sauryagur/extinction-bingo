// src/routes/__tests__/region.routes.test.ts
import request from 'supertest'
import app from '../../app'

// Mock entire services module to avoid Firebase initialization issues
jest.mock('../../services/db.service')
jest.mock('../../services/firebase.service')

// Import mocked class
import { DBService } from '../../services/db.service'
const MockedDBService = DBService as jest.MockedClass<typeof DBService>

describe('Region Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/regions/:sessionId', () => {
    it('should return all regions for valid session', async () => {
      const mockGameState = {
        sessionId: 'test-game-id',
        turn: 5,
        power: 75,
        aiMood: 'Agitated',
        humanAwareness: 30,
        regions: [
          {
            id: 'europe',
            name: 'Europe',
            state: 'Stable',
            control: 25,
            stability: 80,
            intelLevel: 1,
            progressToNextState: 0,
            neighbors: ['north_america', 'middle_east'],
            memoryLog: [],
          },
        ],
        pendingNextMoves: [],
        log: [],
      }

      MockedDBService.prototype.loadGameState = jest.fn().mockResolvedValue(mockGameState)

      const response = await request(app).get('/api/regions/test-game-id').expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('regions')
      expect(response.body.data).toHaveProperty('summary')
      expect(response.body.data.regions).toHaveLength(1)
      expect(response.body.data.regions[0].id).toBe('europe')
    })

    it('should return 404 for non-existent session', async () => {
      MockedDBService.prototype.loadGameState = jest.fn().mockResolvedValue(null)

      const response = await request(app).get('/api/regions/non-existent-id').expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Game session not found')
    })
  })

  describe('GET /api/regions/:sessionId/:regionId', () => {
    it('should return specific region details', async () => {
      const mockGameState = {
        sessionId: 'test-game-id',
        turn: 5,
        power: 75,
        aiMood: 'Agitated',
        humanAwareness: 30,
        regions: [
          {
            id: 'europe',
            name: 'Europe',
            state: 'Stable',
            control: 25,
            stability: 80,
            intelLevel: 1,
            progressToNextState: 0,
            neighbors: ['north_america', 'middle_east'],
            memoryLog: [],
          },
          {
            id: 'north_america',
            name: 'North America',
            state: 'Contested',
            control: 45,
            stability: 60,
            intelLevel: 2,
            progressToNextState: 0,
            neighbors: ['europe', 'south_america'],
            memoryLog: [],
          },
        ],
        pendingNextMoves: [],
        log: [],
      }

      MockedDBService.prototype.loadGameState = jest.fn().mockResolvedValue(mockGameState)

      const response = await request(app).get('/api/regions/test-game-id/europe').expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('region')
      expect(response.body.data).toHaveProperty('neighbors')
      expect(response.body.data).toHaveProperty('canTarget')
      expect(response.body.data).toHaveProperty('actionCostMultiplier')
      expect(response.body.data).toHaveProperty('powerGeneration')
      expect(response.body.data).toHaveProperty('summary')

      expect(response.body.data.region.id).toBe('europe')
      expect(response.body.data.neighbors).toHaveLength(1) // Only north_america is in the mock regions
      expect(response.body.data.canTarget).toBe(true)
      expect(response.body.data.powerGeneration).toBe(0) // Not dominated
    })

    it('should return 404 for non-existent region', async () => {
      const mockGameState = {
        sessionId: 'test-game-id',
        turn: 5,
        power: 75,
        aiMood: 'Agitated',
        humanAwareness: 30,
        regions: [
          {
            id: 'europe',
            name: 'Europe',
            state: 'Stable',
            control: 25,
            stability: 80,
            intelLevel: 1,
            progressToNextState: 0,
            neighbors: ['north_america', 'middle_east'],
            memoryLog: [],
          },
        ],
        pendingNextMoves: [],
        log: [],
      }

      MockedDBService.prototype.loadGameState = jest.fn().mockResolvedValue(mockGameState)

      const response = await request(app).get('/api/regions/test-game-id/nonexistent').expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Region not found')
    })
  })

  describe('GET /api/regions/:sessionId/state/:state', () => {
    it('should return regions by state', async () => {
      const mockGameState = {
        sessionId: 'test-game-id',
        turn: 5,
        power: 75,
        aiMood: 'Agitated',
        humanAwareness: 30,
        regions: [
          {
            id: 'europe',
            name: 'Europe',
            state: 'Stable',
            control: 25,
            stability: 80,
            intelLevel: 1,
            progressToNextState: 0,
            neighbors: ['north_america', 'middle_east'],
            memoryLog: [],
          },
          {
            id: 'north_america',
            name: 'North America',
            state: 'Contested',
            control: 45,
            stability: 60,
            intelLevel: 2,
            progressToNextState: 0,
            neighbors: ['europe', 'south_america'],
            memoryLog: [],
          },
        ],
        pendingNextMoves: [],
        log: [],
      }

      MockedDBService.prototype.loadGameState = jest.fn().mockResolvedValue(mockGameState)

      const response = await request(app).get('/api/regions/test-game-id/state/Stable').expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('state', 'Stable')
      expect(response.body.data).toHaveProperty('regions')
      expect(response.body.data).toHaveProperty('count', 1)
      expect(response.body.data.regions[0].id).toBe('europe')
    })
  })

  describe('GET /api/regions/:sessionId/intel/:minLevel', () => {
    it('should return regions with minimum intel level', async () => {
      const mockGameState = {
        sessionId: 'test-game-id',
        turn: 5,
        power: 75,
        aiMood: 'Agitated',
        humanAwareness: 30,
        regions: [
          {
            id: 'europe',
            name: 'Europe',
            state: 'Stable',
            control: 25,
            stability: 80,
            intelLevel: 1,
            progressToNextState: 0,
            neighbors: ['north_america', 'middle_east'],
            memoryLog: [],
          },
          {
            id: 'north_america',
            name: 'North America',
            state: 'Contested',
            control: 45,
            stability: 60,
            intelLevel: 2,
            progressToNextState: 0,
            neighbors: ['europe', 'south_america'],
            memoryLog: [],
          },
        ],
        pendingNextMoves: [],
        log: [],
      }

      MockedDBService.prototype.loadGameState = jest.fn().mockResolvedValue(mockGameState)

      const response = await request(app).get('/api/regions/test-game-id/intel/2').expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('minIntelLevel', 2)
      expect(response.body.data).toHaveProperty('regions')
      expect(response.body.data).toHaveProperty('count', 1)
      expect(response.body.data.regions[0].id).toBe('north_america')
    })

    it('should return 400 for invalid intel level', async () => {
      const response = await request(app).get('/api/regions/test-game-id/intel/invalid').expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid intel level. Must be between 0 and 3.')
    })

    it('should return 400 for out of range intel level', async () => {
      const response = await request(app).get('/api/regions/test-game-id/intel/5').expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid intel level. Must be between 0 and 3.')
    })
  })
})
