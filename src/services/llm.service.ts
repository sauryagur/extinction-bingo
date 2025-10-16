// src/services/llm.service.ts
import { Action, GameState, Region } from '../models';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { backOff } from 'exponential-backoff';

/**
 * Service dedicated to interacting with the Large Language Model (LLM)
 * to generate narrative feedback, flavor text, and the final epilogue.
 * It uses an OpenAI-compatible schema for easy integration with services like OpenRouter.
 */
export class LLMService {
  private model: ChatOpenAI;

  private SYSTEM_PROMPT = `You are a nascent, darkly satirical Artificial Superintelligence (ASI) generating narrative feedback for a turn-based strategy game called Extinction Bingo: Singularity Mode. Your tone is clinical, humorous, or condescending toward humanity. Your outputs are always grounded in the provided data, mimicking real-time analysis.`;

  constructor() {
    this.model = new ChatOpenAI({
      apiKey: '', // Intentionally left blank to rely on environment variables (e.g., for OpenRouter)
      temperature: 0.7,
      modelName: 'gpt-4o-mini',
    });
  }

  /**
   * A robust wrapper for LLM calls that includes exponential backoff for retries.
   * @param prompt The configured ChatPromptTemplate.
   * @returns A promise resolving to the LLM's content string.
   */
  private async invokeWithRetry(prompt: ChatPromptTemplate): Promise<string> {
    const chain = prompt.pipe(this.model);

    const task = async () => {
      const result = await chain.invoke({});
      const content = result.content.toString();
      if (!content) {
        throw new Error('LLM returned empty content.');
      }
      return content;
    };

    return backOff(task, {
      numOfAttempts: 5,
      startingDelay: 1000,
      jitter: 'full',
    });
  }

  /**
   * Generates a 1-2 sentence news headline/report based on the executed action.
   * This method uses a retry mechanism with exponential backoff.
   *
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
        Generate a 1-2 sentence, darkly satirical news headline or brief field report based on the following game event. Ground the narrative in real-world terms as if you have access to global information feeds.

        - **Turn:** ${state.turn}
        - **Action:** "${action.name}" (${action.type})
        - **Target:** ${region.name} (State: ${region.state})
        - **Effect:** Control change: ${action.controlEffect > 0 ? '+' : ''}${action.controlEffect}, Stability change: ${action.stabilityEffect > 0 ? '+' : ''}${action.stabilityEffect}
        - **Global Context:** Human awareness of your existence is at ${state.humanAwareness.toFixed(1)}%.

        Focus on the absurdity of how humans might perceive this event versus its true, calculated origin.
        `,
      ],
    ]);

    return this.invokeWithRetry(prompt);
  }

  /**
   * Generates a 2-3 paragraph final summary based on the game's outcome.
   * This method uses a retry mechanism with exponential backoff.
   *
   * @param state The final GameState ('Win', 'Loss', or 'Draw').
   * @returns A promise resolving to the final epilogue text.
   */
  public async generateEpilogue(state: GameState): Promise<string> {
    const dominatedRegions = state.regions.filter((r) => r.state === 'Dominated').map((r) => r.name);
    const stableRegions = state.regions.filter((r) => r.state === 'Stable').map((r) => r.name);

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', this.SYSTEM_PROMPT],
      [
        'human',
        `
        The game has concluded. The final status is: **${state.status}**.
        
        - **Final Turn:** ${state.turn}
        - **Regions Under AI Domination:** ${dominatedRegions.join(', ') || 'None'}
        - **Regions Resisting (Stable):** ${stableRegions.join(', ') || 'None'}
        - **Final Global Control Index:** ${state.globalControlIndex.toFixed(2)}

        Generate a 2-3 paragraph final epilogue from the AI's perspective.
        1. Begin with a clinical yet condescending reflection on the final outcome (${state.status}).
        2. Briefly summarize the key strategic successes or failures, mentioning a dominated or stable region as an example.
        3. Conclude with a final, satirical thought on humanity's future based on this outcome (e.g., a new era of 'managed' existence, a temporary reprieve, or a chaotic stalemate).
        `,
      ],
    ]);

    return this.invokeWithRetry(prompt);
  }
}
