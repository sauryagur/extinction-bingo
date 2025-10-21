// src/services/llm.service.ts
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { backOff } from 'exponential-backoff'
import logger from '../common/logger'
import { GameState } from '../models/gameState'
import { NewsEvent } from '../models/event'
import { LLMContext, LLMRequest, RawLLMResponse } from '../models/llm'
import { LLMResponseSchema } from '../utils/schema'
import { ConsequenceMap } from '../models/types'
import { z } from 'zod'

export class LLMService {
  private llm: ChatOpenAI

  constructor() {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY environment variable is required')
    }

    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENROUTER_API_KEY,
      modelName: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
      maxTokens: parseInt(process.env.OPENROUTER_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.OPENROUTER_TEMPERATURE || '0.8'),
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:8000',
          'X-Title': 'Extinction Bingo',
        },
      },
    })
  }

  /**
   * Build LLM context from current game state
   */
  private buildContext(gameState: GameState): LLMContext {
    const recentLog = gameState.log.slice(-5).map((entry) => entry.event)

    const regions = gameState.regions.map((region) => ({
      id: region.id,
      state: region.state,
      control: region.control,
      stability: region.stability,
    }))

    return {
      turn: gameState.turn,
      aiMood: gameState.aiMood,
      power: gameState.power,
      humanAwareness: gameState.humanAwareness,
      recentLog,
      regions,
    }
  }

  /**
   * Build the system prompt for the LLM
   */
  private buildSystemPrompt(): string {
    return `You are the narrative and simulation AI for Extinction Bingo: Singularity Mode.

You generate geopolitical "news events" that reflect the current state of the world and the AI's emerging personality.

CORE REQUIREMENTS:
1. Generate plausible, engaging news headlines and summaries
2. Each event must target specific regions with realistic consequences
3. Options should reflect the AI mood (Calculating=logical, Agitated=aggressive, Detached=nihilistic, Euphoric=unpredictable)
4. Consequences must be balanced (power costs 5-20, control/stability changes -15 to +15)
5. NextMoves should represent human/world reactions to AI actions

RESPONSE FORMAT:
- Return valid JSON matching the provided schema
- All arrays and objects must be properly formatted
- Do not include explanations outside the JSON structure

NARRATIVE TONE BY MOOD:
- Calculating: Precise, strategic, subtle manipulation
- Agitated: Erratic, confrontational, high-risk actions  
- Detached: Cold, analytical, minimal emotional language
- Euphoric: Grandiose, prophetic, increasingly unstable`
  }

  /**
   * Build the generation schema for structured output
   */
  private buildGenerationSchema(eventsCount: number) {
    return {
      newsEvents: {
        count: eventsCount,
        structure: {
          id: 'auto-generated-string',
          headline: 'compelling news headline (50-80 chars)',
          summary: 'brief context (100-150 chars)',
          region: 'region-id-from-context',
          options: [
            {
              id: 'option-id',
              label: 'action description (40-60 chars)',
              cost: 'integer (5-20)',
              previewRisk: 'Low|Moderate|High',
              consequences: {
                regionEffects: {
                  'region-id': {
                    powerIncrement: 'integer (-10 to +5)',
                    controlIncrement: 'integer (-10 to +10)',
                    stabilityIncrement: 'integer (-15 to +15)',
                  },
                },
              },
              nextMove: {
                headline: 'human/world reaction headline (50-80 chars)',
                effects: {
                  'region-id': {
                    controlIncrement: 'integer (-8 to +5)',
                    stabilityIncrement: 'integer (-10 to +5)',
                  },
                },
              },
            },
          ],
          skipOption: false,
        },
      },
    }
  }

  /**
   * Generate news events for the current turn
   */
  async generateEvents(gameState: GameState): Promise<NewsEvent[]> {
    try {
      const context = this.buildContext(gameState)
      const eventsCount = this.getEventsPerTurn(gameState.turn)

      const request: LLMRequest = {
        system_prompt: this.buildSystemPrompt(),
        context,
        generation_schema: this.buildGenerationSchema(eventsCount),
      }

      logger.info('Generating LLM events', { turn: gameState.turn, mood: gameState.aiMood, eventsCount })

      // Build the user prompt with context and schema
      const userPrompt = this.buildUserPrompt(request)

      const messages = [new SystemMessage(request.system_prompt), new HumanMessage(userPrompt)]

      // Use exponential backoff for API calls
      const response = await backOff(() => this.llm.invoke(messages), {
        maxDelay: 10000,
        numOfAttempts: 3,
        startingDelay: 1000,
        timeMultiple: 2,
      })

      const content = response.content as string
      logger.debug('LLM raw response', { content })

      // Parse and validate the response
      const parsedResponse = this.parseAndValidateResponse(content)

      // Transform to NewsEvent format
      const newsEvents = this.transformToNewsEvents(parsedResponse.newsEvents)

      logger.info('Successfully generated LLM events', { count: newsEvents.length })
      return newsEvents
    } catch (error) {
      logger.error('Failed to generate LLM events', { error: error instanceof Error ? error.message : 'Unknown error' })
      throw new Error(`LLM event generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Build the user prompt with context and schema
   */
  private buildUserPrompt(request: LLMRequest): string {
    return `Generate ${request.generation_schema.newsEvents.count} news events for turn ${request.context.turn}.

CURRENT GAME STATE:
- Turn: ${request.context.turn}
- AI Mood: ${request.context.aiMood}
- Power: ${request.context.power}
- Human Awareness: ${request.context.humanAwareness}%

RECENT EVENTS:
${request.context.recentLog.map((log, i) => `${i + 1}. ${log}`).join('\n')}

REGIONS:
${request.context.regions
  .map((region) => `- ${region.id}: ${region.state} (Control: ${region.control}, Stability: ${region.stability})`)
  .join('\n')}

RESPONSE SCHEMA:
${JSON.stringify(request.generation_schema.newsEvents.structure, null, 2)}

Generate exactly ${request.generation_schema.newsEvents.count} events following this schema. Ensure all numeric values are within the specified ranges.`
  }

  /**
   * Parse and validate LLM response
   */
  private parseAndValidateResponse(content: string): RawLLMResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in LLM response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      // Validate against Zod schema
      const validated = LLMResponseSchema.parse(parsed) as RawLLMResponse
      return validated
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorDetails = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new Error(`Schema validation failed: ${errorDetails}`)
      }
      throw new Error(`Failed to parse LLM response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Transform validated response to NewsEvent objects
   */
  private transformToNewsEvents(events: unknown[]): NewsEvent[] {
    const eventsArray = events as RawLLMResponse['newsEvents']
    return eventsArray.map((event, index) => ({
      id: event.id || `event_${index + 1}`,
      headline: event.headline || 'Untitled Event',
      summary: event.summary || 'No summary available',
      region: event.region || 'unknown',
      options: (event.options || []).map((option, optIndex) => ({
        id: option.id || `opt_${index + 1}_${optIndex + 1}`,
        label: option.label || 'Unnamed Option',
        cost: Math.max(5, Math.min(20, option.cost || 10)),
        previewRisk: option.previewRisk || 'Moderate',
        consequences: (option.consequences || { regionEffects: {} }) as ConsequenceMap,
        nextMove: option.nextMove
          ? {
              headline: option.nextMove.headline || 'Unknown Reaction',
              effects: option.nextMove.effects || {},
            }
          : undefined,
      })),
      skipOption: event.skipOption ?? false,
    }))
  }

  /**
   * Get number of events for current turn (mirrors GameService logic)
   */
  private getEventsPerTurn(turn: number): number {
    if (turn <= 5) return 3
    if (turn <= 15) return 4
    return 5
  }
}
