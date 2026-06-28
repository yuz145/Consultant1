import type { KeyEvent } from "../types/domain";
import { DatabaseClient } from "./client";

interface KeyEventRow {
  id: number;
  event_date: string;
  title: string;
  description: string;
  importance: number;
  created_at: string;
}

function mapEvent(row: KeyEventRow): KeyEvent {
  return {
    id: row.id,
    eventDate: row.event_date,
    title: row.title,
    description: row.description,
    importance: row.importance,
    createdAt: row.created_at
  };
}

export class EventsRepository {
  constructor(private readonly db: DatabaseClient) {}

  async list(limit: number): Promise<KeyEvent[]> {
    const rows = await this.db.all<KeyEventRow>(
      `SELECT id, event_date, title, description, importance, created_at
       FROM key_events
       ORDER BY event_date DESC, id DESC
       LIMIT ?`,
      [limit]
    );
    return rows.map(mapEvent);
  }

  async replaceAll(events: Array<Omit<KeyEvent, "id" | "createdAt">>): Promise<void> {
    await this.db.run("DELETE FROM key_events");

    for (const event of events) {
      await this.db.run(
        `INSERT INTO key_events (event_date, title, description, importance, created_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [event.eventDate, event.title, event.description, event.importance]
      );
    }
  }
}
