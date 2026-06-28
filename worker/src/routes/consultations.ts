import { DatabaseClient } from "../db/client";
import { ConsultationsRepository } from "../db/consultations-repo";
import { json } from "../lib/http";
import { parseLimit } from "../lib/validator";
import type { Env } from "../types/env";

export async function getConsultations(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const limit = parseLimit(url, 20, 100);

  const db = new DatabaseClient(env);
  const consultationsRepo = new ConsultationsRepository(db);
  const consultations = await consultationsRepo.list(limit);

  return json({ consultations });
}
