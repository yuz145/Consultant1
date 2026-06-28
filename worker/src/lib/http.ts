import type { ApiErrorBody } from "../types/api";

export class HttpError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function json<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export function errorResponse(status: number, code: string, message: string, details?: unknown): Response {
  const body: ApiErrorBody = {
    error: {
      code,
      message,
      details
    }
  };
  return json(body, status);
}

export function handleRouteError(error: unknown): Response {
  if (error instanceof HttpError) {
    return errorResponse(error.status, error.code, error.message, error.details);
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  return errorResponse(500, "INTERNAL_SERVER_ERROR", message);
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch (error) {
    throw new HttpError(400, "INVALID_JSON", "Request body must be valid JSON", error);
  }
}
