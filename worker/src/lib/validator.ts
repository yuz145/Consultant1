import { HttpError } from "./http";

export function requireString(value: unknown, name: string, maxLength: number): string {
  if (typeof value !== "string") {
    throw new HttpError(400, "VALIDATION_ERROR", `${name} must be a string`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new HttpError(400, "VALIDATION_ERROR", `${name} is required`);
  }
  if (trimmed.length > maxLength) {
    throw new HttpError(400, "VALIDATION_ERROR", `${name} must be <= ${maxLength} characters`);
  }
  return trimmed;
}

export function optionalString(value: unknown, name: string, maxLength: number): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new HttpError(400, "VALIDATION_ERROR", `${name} must be a string`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new HttpError(400, "VALIDATION_ERROR", `${name} must be <= ${maxLength} characters`);
  }
  return trimmed || undefined;
}

export function parseLimit(url: URL, defaultValue: number, maxValue: number): number {
  const raw = url.searchParams.get("limit");
  if (!raw) {
    return defaultValue;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new HttpError(400, "VALIDATION_ERROR", "limit must be a positive integer");
  }
  return Math.min(parsed, maxValue);
}

export function requireSourceType(value: unknown): "manual" | "line_txt" | "other" {
  if (value === "manual" || value === "line_txt" || value === "other") {
    return value;
  }
  throw new HttpError(400, "VALIDATION_ERROR", "sourceType must be manual, line_txt, or other");
}

export function requireUpdateSourceType(value: unknown): "manual" | "line_txt" {
  if (value === "manual" || value === "line_txt") {
    return value;
  }
  throw new HttpError(400, "VALIDATION_ERROR", "sourceType must be manual or line_txt");
}

export function clampImportance(value: number): number {
  if (!Number.isFinite(value)) {
    return 3;
  }
  const rounded = Math.round(value);
  return Math.max(1, Math.min(5, rounded));
}
