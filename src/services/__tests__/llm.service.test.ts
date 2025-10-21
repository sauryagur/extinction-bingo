// src/services/__tests__/llm.service.test.ts
import { LLMService } from '../llm.service'
import { GameState } from '../../models/gameState'

// Mock OpenAI module
jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn(),
}))

// Mock exponential backoff
jest.mock('exponential-backoff', () => ({
  backOff: jest.fn(),
}))

// Mock logger
jest.mock('../../common/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}))

describe('LLMService', () => {
  let llmService: LLMService
  let mockInvoke: jest.MockedFunction<(...args: unknown[]) => Promise<unknown>>
  let mockExponentialBackoff: jest.MockedFunction<(...args: unknown[]) => Promise<unknown>>

  beforeEach(() => {
    // Set required environment variables
    process.env.OPENROUTER_API_KEY = 'test-key'

    const { ChatOpenAI } = jest.requireMock('@langchain/openai')
    const mockInstance = {
      invoke: jest.fn(),
    }
    ChatOpenAI.mockImplementation(() => mockInstance)
    mockInvoke = mockInstance.invoke

    mockInvoke.mockResolvedValue({
      content: JSON.stringify({
        newsEvents: [
          {
            id: 'test-event-1',
            headline: 'Test Event Headline',
            summary: 'Test event summary',
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
                  effects: { europe: { controlIncrement: -1 } },
                },
              },
            ],
            skipOption: false,
          },
        ],
      }),
    })

    const { backOff } = jest.requireMock('exponential-backoff')
    mockExponentialBackoff = backOff
    mockExponentialBackoff.mockImplementation((fn: () => unknown) => Promise.resolve(fn()))

    llmService = new LLMService()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('generateEvents', () => {
    it('should generate events successfully', async () => {
      const mockGameState: GameState = {
        sessionId: 'test-session',
        turn: 1,
        power: 100,
        aiMood: 'Calculating',
        humanAwareness: 0,
        regions: [
          {
            id: 'europe',
            name: 'Europe',
            state: 'Stable',
            control: 25,
            stability: 80,
            intelLevel: 1,
            progressToNextState: 0,
            neighbors: ['north_america', 'africa'],
            memoryLog: [],
          },
        ],
        pendingNextMoves: [],
        log: [{ turn: 1, event: 'Game started' }],
      }

      const events = await llmService.generateEvents(mockGameState)

      expect(events).toHaveLength(1)
      expect(events[0]).toMatchObject({
        id: 'test-event-1',
        headline: 'Test Event Headline',
        summary: 'Test event summary',
        region: 'europe',
      })
      expect(events[0].options).toHaveLength(1)
      expect(events[0].options[0]).toMatchObject({
        id: 'opt1',
        label: 'Test Option',
        cost: 10,
        previewRisk: 'Low',
      })
    })

    it('should handle API errors gracefully', async () => {
      mockExponentialBackoff.mockRejectedValue(new Error('API Error'))

      const mockGameState: GameState = {
        sessionId: 'test-session',
        turn: 1,
        power: 100,
        aiMood: 'Calculating',
        humanAwareness: 0,
        regions: [],
        pendingNextMoves: [],
        log: [],
      }

      await expect(llmService.generateEvents(mockGameState)).rejects.toThrow('LLM event generation failed: API Error')
    })

    it('should handle invalid JSON response', async () => {
      mockInvoke.mockResolvedValue({
        content: 'Invalid JSON response',
      })

      const mockGameState: GameState = {
        sessionId: 'test-session',
        turn: 1,
        power: 100,
        aiMood: 'Calculating',
        humanAwareness: 0,
        regions: [],
        pendingNextMoves: [],
        log: [],
      }

      await expect(llmService.generateEvents(mockGameState)).rejects.toThrow(
        'LLM event generation failed: Failed to parse LLM response: No valid JSON found in LLM response',
      )
    })

    it('should handle schema validation errors', async () => {
      mockInvoke.mockResolvedValue({
        content: JSON.stringify({
          // Invalid structure - missing newsEvents array
          invalidField: 'test',
        }),
      })

      const mockGameState: GameState = {
        sessionId: 'test-session',
        turn: 1,
        power: 100,
        aiMood: 'Calculating',
        humanAwareness: 0,
        regions: [],
        pendingNextMoves: [],
        log: [],
      }

      await expect(llmService.generateEvents(mockGameState)).rejects.toThrow(
        'LLM event generation failed: Schema validation failed',
      )
    })

    it('should throw error when OPENROUTER_API_KEY is missing', () => {
      delete process.env.OPENROUTER_API_KEY

      expect(() => new LLMService()).toThrow('OPENROUTER_API_KEY environment variable is required')
    })
  })
})
