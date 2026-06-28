import type { KeyEvent, SummaryUpdateResult } from "../../types/domain";
import type { Env } from "../../types/env";
import { GeminiProvider } from "./gemini";

export interface AIProvider {
  generateConsultation(input: {
    overallSummary: string;
    recentSummary: string;
    keyEvents: KeyEvent[];
    question: string;
  }): Promise<string>;

  summarizeLog(content: string): Promise<SummaryUpdateResult>;
}

export function createAIProvider(env: Env): AIProvider {
  return new GeminiProvider({
    apiKey: env.GEMINI_API_KEY,
    model: env.GEMINI_MODEL
  });
}
