// src/services/__tests__/game.service.test.ts
import { GameService } from '../game.service'
import { NewsEvent } from '../../models/event'

describe('GameService', () => {
  describe('createNewGame', () => {
    it('should create a new game with initial state', () => {
      const game = GameService.createNewGame()

      expect(game.turn).toBe(1)
      expect(game.power).toBe(100)
      expect(game.aiMood).toBe('Calculating')
      expect(game.humanAwareness).toBe(0)
      expect(game.regions).toHaveLength(9)
      expect(game.pendingNextMoves).toHaveLength(0)
      expect(game.log).toHaveLength(1)
    })
  })

  describe('initializeRegions', () => {
    it('should create 9 predefined regions', () => {
      const regions = GameService.initializeRegions()

      expect(regions).toHaveLength(9)
      expect(regions[0].id).toBe('europe')
      expect(regions[0].name).toBe('Europe')
      expect(regions[0].state).toBe('Stable')
    })
  })

  describe('executeAction', () => {
    it('should deduct power and apply consequences', () => {
      const game = GameService.createNewGame()
      const mockEvent: NewsEvent = {
        id: 'test-event',
        headline: 'Test Event',
        summary: 'Test summary',
        region: 'europe',
        options: [
          {
            id: 'opt1',
            label: 'Test Option',
            cost: 10,
            previewRisk: 'Low',
            consequences: {
              regionEffects: {
                europe: { controlIncrement: 5, stabilityIncrement: -2 },
              },
            },
            nextMove: {
              headline: 'Test NextMove',
              effects: {},
            },
          },
        ],
        skipOption: false,
      }

      const result = GameService.executeAction(game, 'test-event', 'opt1', [mockEvent])

      expect(result.power).toBe(90) // 100 - 10
      expect(result.log).toHaveLength(2)
      expect(result.pendingNextMoves).toHaveLength(1)

      const europe = result.regions.find((r) => r.id === 'europe')
      expect(europe?.control).toBe(30) // 25 + 5
      expect(europe?.stability).toBe(78) // 80 - 2
    })

    it('should throw error for insufficient power', () => {
      const game = GameService.createNewGame()
      game.power = 5

      const mockEvent: NewsEvent = {
        id: 'test-event',
        headline: 'Test Event',
        summary: 'Test summary',
        region: 'europe',
        options: [
          {
            id: 'opt1',
            label: 'Test Option',
            cost: 10,
            previewRisk: 'Low',
            consequences: { regionEffects: {} },
          },
        ],
        skipOption: false,
      }

      expect(() => {
        GameService.executeAction(game, 'test-event', 'opt1', [mockEvent])
      }).toThrow('Insufficient power')
    })
  })

  describe('executeHumanTurn', () => {
    it('should execute pending nextMoves and update awareness', () => {
      const game = GameService.createNewGame()
      game.pendingNextMoves = [{ turnTrigger: 1, eventId: 'test-nextmove' }]

      const result = GameService.executeHumanTurn(game)

      expect(result.pendingNextMoves).toHaveLength(0)
      expect(result.humanAwareness).toBe(2)
      expect(result.log).toHaveLength(2)
    })
  })

  describe('updateRegionStates', () => {
    it('should update region states based on control and stability', () => {
      const regions = GameService.initializeRegions()

      // Make Europe dominated
      regions[0].control = 80
      regions[0].stability = 60

      // Make East Africa collapsed
      const eastAfrica = regions.find((r) => r.id === 'east_africa')
      if (eastAfrica) {
        eastAfrica.control = 10
        eastAfrica.stability = 15
      }

      const updated = GameService.updateRegionStates(regions)

      expect(updated[0].state).toBe('Dominated')
      expect(updated.find((r) => r.id === 'east_africa')?.state).toBe('Collapsed')
    })
  })

  describe('calculateAIMood', () => {
    it('should return Agitated when awareness is high', () => {
      const game = GameService.createNewGame()
      game.humanAwareness = 80

      const mood = GameService.calculateAIMood(game)
      expect(mood).toBe('Agitated')
    })

    it('should return Euphoric when power and control are high', () => {
      const game = GameService.createNewGame()
      game.power = 200
      game.regions.forEach((r) => (r.state = 'Dominated'))

      const mood = GameService.calculateAIMood(game)
      expect(mood).toBe('Euphoric')
    })
  })

  describe('getGamePhase', () => {
    it('should return correct phase based on turn', () => {
      expect(GameService.getGamePhase(3)).toBe('early')
      expect(GameService.getGamePhase(10)).toBe('mid')
      expect(GameService.getGamePhase(20)).toBe('late')
    })
  })

  describe('getEventsPerTurn', () => {
    it('should return correct number of events based on turn', () => {
      expect(GameService.getEventsPerTurn(3)).toBe(3)
      expect(GameService.getEventsPerTurn(10)).toBe(4)
      expect(GameService.getEventsPerTurn(20)).toBe(5)
    })
  })
})
