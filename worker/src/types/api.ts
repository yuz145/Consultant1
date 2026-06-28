import type { Consultation, KeyEvent, RawImport, RelationshipState } from "./domain";

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface StateResponse {
  state: RelationshipState;
}

export interface EventsResponse {
  events: KeyEvent[];
}

export interface ConsultationsResponse {
  consultations: Consultation[];
}

export interface ConsultRequest {
  question: string;
}

export interface ConsultResponse {
  consultation: Consultation;
  usedContext: {
    overallSummary: string;
    recentSummary: string;
    keyEventsCount: number;
  };
}

export interface UpdateLogRequest {
  sourceType: "manual" | "line_txt";
  content: string;
  fileName?: string;
}

export interface UpdateLogResponse {
  state: RelationshipState;
  extractedEvents: KeyEvent[];
  rawImport: RawImport;
}

export interface ImportRequest {
  sourceType: "line_txt" | "manual" | "other";
  fileName?: string;
  r2Key?: string;
  contentPreview?: string;
}

export interface ImportResponse {
  rawImport: RawImport;
}
