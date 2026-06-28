import { HttpError } from "../../lib/http";
import { clampImportance } from "../../lib/validator";
import type { KeyEvent, SummaryUpdateResult } from "../../types/domain";
import type { AIProvider } from "./provider";
import { buildConsultPrompt, buildSummaryUpdatePrompt } from "./prompts";

interface GeminiConfig {
  apiKey: string;
  model: string;
}

interface GeminiGenerateContentRequest {
  contents: Array<{
    parts: Array<{ text: string }>;
  }>;
  generationConfig?: {
    temperature?: number;
    responseMimeType?: string;
  };
}

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

function extractCandidateText(response: GeminiGenerateContentResponse): string {
  const text = response.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new HttpError(502, "AI_EMPTY_RESPONSE", "Gemini returned an empty response");
  }

  return text;
}

function parseJsonObjectFromText(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const candidate = text.slice(start, end + 1);
      try {
        return JSON.parse(candidate) as Record<string, unknown>;
      } catch {
        throw new HttpError(502, "AI_INVALID_JSON", "Gemini response was not valid JSON");
      }
    }
    throw new HttpError(502, "AI_INVALID_JSON", "Gemini response did not contain JSON");
  }
}

function normalizeEvents(value: unknown): Array<Omit<KeyEvent, "id" | "createdAt">> {
  if (!Array.isArray(value)) {
    return [];
  }

  const result: Array<Omit<KeyEvent, "id" | "createdAt">> = [];
  for (const item of value.slice(0, 10)) {
    if (typeof item !== "object" || item === null) {
      continue;
    }
    const event = item as Record<string, unknown>;
    const eventDate = typeof event.eventDate === "string" ? event.eventDate : "";
    const title = typeof event.title === "string" ? event.title : "";
    const description = typeof event.description === "string" ? event.description : "";
    const importanceRaw = typeof event.importance === "number" ? event.importance : 3;

    if (!eventDate || !title) {
      continue;
    }

    result.push({
      eventDate,
      title,
      description,
      importance: clampImportance(importanceRaw)
    });
  }
  return result;
}

export class GeminiProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
  }

  async generateConsultation(input: {
    overallSummary: string;
    recentSummary: string;
    keyEvents: KeyEvent[];
    question: string;
  }): Promise<string> {
    const prompt = buildConsultPrompt(input);
    const text = await this.generateText(prompt);
    return text;
  }

  async summarizeLog(content: string): Promise<SummaryUpdateResult> {
    const prompt = buildSummaryUpdatePrompt(content);
    const text = await this.generateText(prompt, true);
    const json = parseJsonObjectFromText(text);

    const overallSummary = typeof json.overallSummary === "string" ? json.overallSummary : "";
    const recentSummary = typeof json.recentSummary === "string" ? json.recentSummary : "";
    const currentStatus = typeof json.currentStatus === "string" ? json.currentStatus : "";
    const moodRaw = typeof json.moodScore === "number" ? json.moodScore : 0;

    return {
      overallSummary,
      recentSummary,
      currentStatus,
      moodScore: Math.max(-100, Math.min(100, Math.round(moodRaw))),
      events: normalizeEvents(json.events)
    };
  }

  private async generateText(prompt: string, preferJson = false): Promise<string> {
    if (!this.apiKey) {
      throw new HttpError(500, "CONFIG_ERROR", "GEMINI_API_KEY is not configured");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    const payload: GeminiGenerateContentRequest = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: preferJson ? "application/json" : "text/plain"
      }
    };

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": this.apiKey
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      throw new HttpError(502, "AI_FETCH_FAILED", "Failed to reach Gemini API", error);
    }

    if (!response.ok) {
      const bodyText = await response.text();
      throw new HttpError(502, "AI_BAD_RESPONSE", `Gemini API error: ${response.status}`, bodyText);
    }

    let data: GeminiGenerateContentResponse;
    try {
      data = (await response.json()) as GeminiGenerateContentResponse;
    } catch (error) {
      throw new HttpError(502, "AI_INVALID_RESPONSE", "Gemini returned invalid JSON payload", error);
    }

    return extractCandidateText(data);
  }
}
