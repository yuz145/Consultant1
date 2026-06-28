import { DatabaseClient } from "../db/client";
import { EventsRepository } from "../db/events-repo";
import { json } from "../lib/http";
import { parseLimit } from "../lib/validator";
import type { Env } from "../types/env";

export async function getEvents(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const limit = parseLimit(url, 20, 100);

  const db = new DatabaseClient(env);
  const eventsRepo = new EventsRepository(db);
  const events = await eventsRepo.list(limit);

  return json({ events });
}
