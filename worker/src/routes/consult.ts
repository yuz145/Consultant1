import { DatabaseClient } from "../db/client";
import { ConsultationsRepository } from "../db/consultations-repo";
import { EventsRepository } from "../db/events-repo";
import { RelationshipRepository } from "../db/relationship-repo";
import { HttpError, json, readJsonBody } from "../lib/http";
import { requireString } from "../lib/validator";
import { createAIProvider } from "../services/ai/provider";
import { ConsultationService } from "../services/consultation-service";
import type { ConsultRequest } from "../types/api";
import type { Env } from "../types/env";

export async function postConsult(request: Request, env: Env): Promise<Response> {
  const body = await readJsonBody<ConsultRequest>(request);
  const question = requireString(body.question, "question", 4000);

  const db = new DatabaseClient(env);
  const relationshipRepo = new RelationshipRepository(db);
  const eventsRepo = new EventsRepository(db);
  const consultationsRepo = new ConsultationsRepository(db);
  const aiProvider = createAIProvider(env);

  const service = new ConsultationService(relationshipRepo, eventsRepo, consultationsRepo, aiProvider);
  const result = await service.consult(question);

  if (!result.consultation.answer.trim()) {
    throw new HttpError(502, "AI_EMPTY_RESPONSE", "AI answer is empty");
  }

  return json(result);
}
