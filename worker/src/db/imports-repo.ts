import type { RawImport } from "../types/domain";
import { HttpError } from "../lib/http";
import { DatabaseClient } from "./client";

interface RawImportRow {
  id: number;
  source_type: "manual" | "line_txt" | "other";
  file_name: string | null;
  r2_key: string | null;
  content_preview: string;
  created_at: string;
}

function mapImport(row: RawImportRow): RawImport {
  return {
    id: row.id,
    sourceType: row.source_type,
    fileName: row.file_name,
    r2Key: row.r2_key,
    contentPreview: row.content_preview,
    createdAt: row.created_at
  };
}

export class ImportsRepository {
  constructor(private readonly db: DatabaseClient) {}

  async create(input: {
    sourceType: "manual" | "line_txt" | "other";
    fileName?: string;
    r2Key?: string;
    contentPreview?: string;
  }): Promise<RawImport> {
    const id = await this.db.insertAndGetId(
      `INSERT INTO raw_imports (source_type, file_name, r2_key, content_preview, created_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        input.sourceType,
        input.fileName ?? null,
        input.r2Key ?? null,
        input.contentPreview ?? ""
      ]
    );

    const row = await this.db.first<RawImportRow>(
      `SELECT id, source_type, file_name, r2_key, content_preview, created_at
       FROM raw_imports
       WHERE id = ?`,
      [id]
    );

    if (!row) {
      throw new HttpError(500, "DATA_ERROR", "Failed to load inserted import record");
    }

    return mapImport(row);
  }
}
