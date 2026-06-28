import type { Consultation } from "../types/domain";
import { HttpError } from "../lib/http";
import { DatabaseClient } from "./client";

interface ConsultationRow {
  id: number;
  question: string;
  answer: string;
  created_at: string;
}

function mapConsultation(row: ConsultationRow): Consultation {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    createdAt: row.created_at
  };
}

export class ConsultationsRepository {
  constructor(private readonly db: DatabaseClient) {}

  async list(limit: number): Promise<Consultation[]> {
    const rows = await this.db.all<ConsultationRow>(
      `SELECT id, question, answer, created_at
       FROM consultations
       ORDER BY created_at DESC, id DESC
       LIMIT ?`,
      [limit]
    );
    return rows.map(mapConsultation);
  }

  async create(question: string, answer: string): Promise<Consultation> {
    const id = await this.db.insertAndGetId(
      `INSERT INTO consultations (question, answer, created_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [question, answer]
    );

    const row = await this.db.first<ConsultationRow>(
      `SELECT id, question, answer, created_at
       FROM consultations
       WHERE id = ?`,
      [id]
    );

    if (!row) {
      throw new HttpError(500, "DATA_ERROR", "Failed to load inserted consultation");
    }

    return mapConsultation(row);
  }
}
