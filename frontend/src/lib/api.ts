const API_BASE_URL =
  __APP_CONFIG__?.VITE_API_BASE_URL?.trim() ?? import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

export function isApiBaseUrlConfigured(): boolean {
  return API_BASE_URL.length > 0;
}

export function apiUrl(path: string): string {
  if (!isApiBaseUrlConfigured()) {
    const message = "VITE_API_BASE_URL is not configured";
    console.error(message);
    throw new Error(message);
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, API_BASE_URL).toString();
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers ?? {});

  if (init.body !== undefined && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return fetch(apiUrl(path), {
    ...init,
    headers
  });
}

export async function readJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("APIレスポンスのJSON解析に失敗しました。");
  }
}

declare global {
  interface Window {
    __APP_CONFIG__?: {
      VITE_API_BASE_URL?: string;
    };
  }

  // eslint-disable-next-line no-var
  var __APP_CONFIG__: Window["__APP_CONFIG__"];
}