export interface RelationshipState {
  id: number;
  overallSummary: string;
  recentSummary: string;
  currentStatus: string;
  moodScore: number;
  updatedAt: string;
}

export interface KeyEvent {
  id: number;
  eventDate: string;
  title: string;
  description: string;
  importance: number;
  createdAt: string;
}

export interface Consultation {
  id: number;
  question: string;
  answer: string;
  createdAt: string;
}

export interface RawImport {
  id: number;
  sourceType: "manual" | "line_txt" | "other";
  fileName: string | null;
  r2Key: string | null;
  contentPreview: string;
  createdAt: string;
}

export interface SummaryUpdateResult {
  overallSummary: string;
  recentSummary: string;
  currentStatus: string;
  moodScore: number;
  events: Array<{
    eventDate: string;
    title: string;
    description: string;
    importance: number;
  }>;
}
