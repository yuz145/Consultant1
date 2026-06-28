import { ConsultationsRepository } from "../db/consultations-repo";
import { EventsRepository } from "../db/events-repo";
import { RelationshipRepository } from "../db/relationship-repo";
import type { Consultation } from "../types/domain";
import type { AIProvider } from "./ai/provider";

export class ConsultationService {
  constructor(
    private readonly relationshipRepo: RelationshipRepository,
    private readonly eventsRepo: EventsRepository,
    private readonly consultationsRepo: ConsultationsRepository,
    private readonly aiProvider: AIProvider
  ) {}

  async consult(question: string): Promise<{
    consultation: Consultation;
    usedContext: {
      overallSummary: string;
      recentSummary: string;
      keyEventsCount: number;
    };
  }> {
    const state = await this.relationshipRepo.getSingleton();
    const keyEvents = await this.eventsRepo.list(20);

    const answer = await this.aiProvider.generateConsultation({
      overallSummary: state.overallSummary,
      recentSummary: state.recentSummary,
      keyEvents,
      question
    });

    const consultation = await this.consultationsRepo.create(question, answer);

    return {
      consultation,
      usedContext: {
        overallSummary: state.overallSummary,
        recentSummary: state.recentSummary,
        keyEventsCount: keyEvents.length
      }
    };
  }
}
