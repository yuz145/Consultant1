import type { Consultation, KeyEvent, RawImport, RelationshipState } from "../types";

interface ConsultResponse {
  consultation: Consultation;
  usedContext: {
    overallSummary: string;
    recentSummary: string;
    keyEventsCount: number;
  };
}

interface UpdateLogResponse {
  state: RelationshipState;
  extractedEvents: KeyEvent[];
  rawImport: RawImport;
}

interface ImportResponse {
  rawImport: RawImport;
}

export class ApiClient {
  private readonly baseUrl: string;
  private adminToken: string | null = null;

  constructor(baseUrl = "https://relationship-advisor-worker.yuz145.workers.dev") {
    this.baseUrl = baseUrl;
  }

  setAdminToken(token: string): void {
    this.adminToken = token;
  }

  clearAdminToken(): void {
    this.adminToken = null;
  }

  hasAdminToken(): boolean {
    return Boolean(this.adminToken);
  }

  async getState(): Promise<{ state: RelationshipState }> {
    return this.request<{ state: RelationshipState }>("/api/state", { method: "GET" });
  }

  async getEvents(limit = 20): Promise<{ events: KeyEvent[] }> {
    return this.request<{ events: KeyEvent[] }>(`/api/events?limit=${encodeURIComponent(String(limit))}`, {
      method: "GET"
    });
  }

  async getConsultations(limit = 20): Promise<{ consultations: Consultation[] }> {
    return this.request<{ consultations: Consultation[] }>(
      `/api/consultations?limit=${encodeURIComponent(String(limit))}`,
      {
        method: "GET"
      }
    );
  }

  async postConsult(question: string): Promise<ConsultResponse> {
    return this.request<ConsultResponse>("/api/consult", {
      method: "POST",
      body: JSON.stringify({ question })
    });
  }

  async postUpdateLog(input: {
    sourceType: "manual" | "line_txt";
    content: string;
    fileName?: string;
  }): Promise<UpdateLogResponse> {
    return this.request<UpdateLogResponse>("/api/update-log", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  async postImport(input: {
    sourceType: "line_txt" | "manual" | "other";
    fileName?: string;
    r2Key?: string;
    contentPreview?: string;
  }): Promise<ImportResponse> {
    return this.request<ImportResponse>("/api/import", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    if (!this.adminToken) {
      throw new Error("ADMIN_TOKEN is not set. Please authenticate first.");
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.adminToken}`,
          ...(init.headers ?? {})
        }
      });
    } catch {
      throw new Error("APIへの接続に失敗しました。WorkerのURLを確認してください。");
    }

    let parsed: unknown;
    const text = await response.text();
    if (text) {
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        throw new Error("APIレスポンスのJSON解析に失敗しました。");
      }
    }

    if (!response.ok) {
      const message = this.resolveErrorMessage(parsed, response.status);
      throw new Error(message);
    }

    return parsed as T;
  }

  private resolveErrorMessage(body: unknown, status: number): string {
    if (typeof body === "object" && body !== null && "error" in body) {
      const withError = body as {
        error?: { message?: unknown };
      };
      if (typeof withError.error?.message === "string") {
        return withError.error.message;
      }
    }

    if (status === 401 || status === 403) {
      return "認証に失敗しました。ADMIN_TOKENを確認してください。";
    }

    return `APIエラーが発生しました (status: ${status})`;
  }
}
