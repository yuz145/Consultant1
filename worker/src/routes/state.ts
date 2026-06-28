import { RelationshipRepository } from "../db/relationship-repo";
import { json } from "../lib/http";
import type { Env } from "../types/env";
import { DatabaseClient } from "../db/client";

export async function getState(env: Env): Promise<Response> {
  const db = new DatabaseClient(env);
  const relationshipRepo = new RelationshipRepository(db);
  const state = await relationshipRepo.getSingleton();
  return json({ state });
}
