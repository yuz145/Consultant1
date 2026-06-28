import type { RelationshipState } from "../types/domain";
import { HttpError } from "../lib/http";
import { DatabaseClient } from "./client";

interface RelationshipStateRow {
  id: number;
  overall_summary: string;
  recent_summary: string;
  current_status: string;
  mood_score: number;
  updated_at: string;
}

function mapState(row: RelationshipStateRow): RelationshipState {
  return {
    id: row.id,
    overallSummary: row.overall_summary,
    recentSummary: row.recent_summary,
    currentStatus: row.current_status,
    moodScore: row.mood_score,
    updatedAt: row.updated_at
  };
}

export class RelationshipRepository {
  constructor(private readonly db: DatabaseClient) {}

  async getSingleton(): Promise<RelationshipState> {
    const row = await this.db.first<RelationshipStateRow>(
      `SELECT id, overall_summary, recent_summary, current_status, mood_score, updated_at
       FROM relationship_state
       WHERE id = 1`
    );

    if (!row) {
      throw new HttpError(500, "DATA_ERROR", "relationship_state row not found");
    }

    return mapState(row);
  }

  async upsert(state: Omit<RelationshipState, "id" | "updatedAt">): Promise<RelationshipState> {
    await this.db.run(
      `INSERT INTO relationship_state (id, overall_summary, recent_summary, current_status, mood_score, updated_at)
       VALUES (1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET
         overall_summary = excluded.overall_summary,
         recent_summary = excluded.recent_summary,
         current_status = excluded.current_status,
         mood_score = excluded.mood_score,
         updated_at = CURRENT_TIMESTAMP`,
      [state.overallSummary, state.recentSummary, state.currentStatus, state.moodScore]
    );

    return this.getSingleton();
  }
}
