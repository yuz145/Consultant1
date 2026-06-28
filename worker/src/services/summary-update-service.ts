import { EventsRepository } from "../db/events-repo";
import { ImportsRepository } from "../db/imports-repo";
import { RelationshipRepository } from "../db/relationship-repo";
import type { RawImport, RelationshipState } from "../types/domain";
import type { AIProvider } from "./ai/provider";

export class SummaryUpdateService {
  constructor(
    private readonly relationshipRepo: RelationshipRepository,
    private readonly eventsRepo: EventsRepository,
    private readonly importsRepo: ImportsRepository,
    private readonly aiProvider: AIProvider
  ) {}

  async updateFromLog(input: {
    sourceType: "manual" | "line_txt";
    content: string;
    fileName?: string;
  }): Promise<{
    state: RelationshipState;
    extractedEvents: Array<{
      id: number;
      eventDate: string;
      title: string;
      description: string;
      importance: number;
      createdAt: string;
    }>;
    rawImport: RawImport;
  }> {
    const summary = await this.aiProvider.summarizeLog(input.content);

    const state = await this.relationshipRepo.upsert({
      overallSummary: summary.overallSummary,
      recentSummary: summary.recentSummary,
      currentStatus: summary.currentStatus,
      moodScore: summary.moodScore
    });

    await this.eventsRepo.replaceAll(
      summary.events.map((event) => ({
        eventDate: event.eventDate,
        title: event.title,
        description: event.description,
        importance: event.importance
      }))
    );

    const extractedEvents = await this.eventsRepo.list(50);

    const rawImport = await this.importsRepo.create({
      sourceType: input.sourceType,
      fileName: input.fileName,
      contentPreview: input.content.slice(0, 500)
    });

    return {
      state,
      extractedEvents,
      rawImport
    };
  }
}
