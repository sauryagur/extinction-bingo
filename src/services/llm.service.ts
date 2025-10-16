// src/services/llm.service.ts

import { Action, GameState, Region } from '../models'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai' // Example integration

/**
 * Service dedicated to interacting with the Large Language Model (LLM)
 * to generate narrative feedback, flavor text, and the final epilogue.
 */
export class LLMService {
  private model

  // Define your system persona and model here
  private SYSTEM_PROMPT = `You are a nascent, darkly satirical Artificial Superintelligence (ASI) generating narrative feedback for a turn-based strategy game called Extinction Bingo: Singularity Mode. Your tone is often clinical, humorous, or condescending toward humanity.`

  constructor() {
    // Initialize your chosen LLM provider
    // Assuming environment variable OPENAI_API_KEY is set
    this.model = new ChatOpenAI({
      temperature: 0.7,
      modelName: 'gpt-4o-mini', // A cost-effective model for narrative tasks
    })
  }

  /**
   * Generates a short, flavor text narrative snippet after a player executes an action.
   * @param state The current GameState.
   * @param action The Action executed.
   * @param region The target Region.
   * @returns A promise resolving to the narrative text.
   */
  public async generateActionNarrative(state: GameState, action: Action, region: Region): Promise<string> {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', this.SYSTEM_PROMPT],
      [
        'human',
        `
                Generate a single, darkly satirical, 2-3 sentence news headline/report based on the following:
                
                - **Turn:** ${state.turn}
                - **Action Type:** ${action.type} (${action.name})
                - **Target Region:** ${region.name} (Current State: ${region.state})
                - **Impact:** Control +${action.controlEffect}, Stability ${action.stabilityEffect}
                - **Global Awareness:** ${state.humanAwareness}% (mention if high or spiking)
                
                Focus on the dark humor of the action's perceived human cause versus its actual AI origin.
            `,
      ],
    ])

    // Use LangChain to invoke the prompt and get the response
    const chain = prompt.pipe(this.model)
    const result = await chain.invoke({})

    // Type assertion to ensure 'content' property exists
    return (result as { content: string }).content.toString()
  }

  /**
   * Generates a long, personalized epilogue based on the final game state and log.
   * @param state The final GameState (Win, Loss, or Draw).
   * @returns A promise resolving to the final epilogue text.
   */
  public async generateEpilogue(state: GameState): Promise<string> {
    // This is where LangChain's ability to handle large contexts shines.
    const logSummary = state.gameLog
      .slice(-20) // Only send the last 20 events for performance
      .map((e) => `[T${e.turn} - ${e.eventType}]: ${e.narrative}`)
      .join('\n')

    const dominatedRegions = state.regions.filter((r) => r.state === 'Dominated').map((r) => r.name)
    const stableRegions = state.regions.filter((r) => r.state === 'Stable').map((r) => r.name)

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', this.SYSTEM_PROMPT],
      [
        'human',
        `
                The game has concluded with the status: **${state.status}**.
                
                - **Final Turn:** ${state.turn}
                - **Outcome:** ${state.status}
                - **Dominated Regions:** ${dominatedRegions.join(', ') || 'None'}
                - **Stable Regions:** ${stableRegions.join(', ') || 'All'}
                
                Generate a final, 4-paragraph epilogue:
                1. A reflection on the final outcome from the AI's perspective (triumphant, indifferent, or mildly annoyed).
                2. A summary of the key regions that fell or resisted.
                3. A mention of the fate of humanity based on the outcome (Singularity/Renaissance/Stalemate).
                4. A closing, condescending remark about the fragility of human societal cohesion.
                
                Recent game events for context (use sparingly):
                ${logSummary}
            `,
      ],
    ])

    const chain = prompt.pipe(this.model)
    const result = await chain.invoke({})

    return (result as { content: string }).content.toString()
  }
}
