import { DatabaseClient } from "../db/client";
import { EventsRepository } from "../db/events-repo";
import { ImportsRepository } from "../db/imports-repo";
import { RelationshipRepository } from "../db/relationship-repo";
import { json, readJsonBody } from "../lib/http";
import { optionalString, requireString, requireUpdateSourceType } from "../lib/validator";
import { createAIProvider } from "../services/ai/provider";
import { SummaryUpdateService } from "../services/summary-update-service";
import type { Env } from "../types/env";
import type { UpdateLogRequest } from "../types/api";

export async function postUpdateLog(request: Request, env: Env): Promise<Response> {
  const body = await readJsonBody<UpdateLogRequest>(request);
  const sourceType = requireUpdateSourceType(body.sourceType);
  const content = requireString(body.content, "content", 20000);
  const fileName = optionalString(body.fileName, "fileName", 255);

  const db = new DatabaseClient(env);
  const relationshipRepo = new RelationshipRepository(db);
  const eventsRepo = new EventsRepository(db);
  const importsRepo = new ImportsRepository(db);
  const aiProvider = createAIProvider(env);

  const service = new SummaryUpdateService(relationshipRepo, eventsRepo, importsRepo, aiProvider);
  const result = await service.updateFromLog({
    sourceType,
    content,
    fileName
  });

  return json(result);
}
