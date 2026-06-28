import type { Env } from "../types/env";

interface RunMeta {
  last_row_id?: number;
}

interface RunResult {
  meta?: RunMeta;
}

export class DatabaseClient {
  private readonly db: D1Database;

  constructor(env: Env) {
    this.db = env.DB;
  }

  async first<T>(sql: string, binds: unknown[] = []): Promise<T | null> {
    return this.db.prepare(sql).bind(...binds).first<T>();
  }

  async all<T>(sql: string, binds: unknown[] = []): Promise<T[]> {
    const result = await this.db.prepare(sql).bind(...binds).all<T>();
    return result.results;
  }

  async run(sql: string, binds: unknown[] = []): Promise<RunResult> {
    return (await this.db.prepare(sql).bind(...binds).run()) as RunResult;
  }

  async insertAndGetId(sql: string, binds: unknown[] = []): Promise<number> {
    const result = await this.run(sql, binds);
    const id = result.meta?.last_row_id;
    if (typeof id === "number" && Number.isFinite(id) && id > 0) {
      return id;
    }

    const row = await this.first<{ id: number }>("SELECT last_insert_rowid() AS id");
    if (!row || typeof row.id !== "number") {
      throw new Error("Failed to get inserted row id");
    }
    return row.id;
  }
}
