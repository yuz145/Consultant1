import { requireAdmin } from "./lib/auth";
import { errorResponse, handleRouteError, json, readJsonBody } from "./lib/http";
import { postConsult } from "./routes/consult";
import { getConsultations } from "./routes/consultations";
import { getEvents } from "./routes/events";
import { postImport } from "./routes/import";
import { getState } from "./routes/state";
import { postUpdateLog } from "./routes/update-log";
import type { Env } from "./types/env";

interface AdminLoginRequest {
  token: string;
}

const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type,authorization",
  "access-control-max-age": "86400"
};

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function preflightResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

function methodNotAllowed(): Response {
  return errorResponse(405, "METHOD_NOT_ALLOWED", "Method not allowed");
}

function notFound(): Response {
  return errorResponse(404, "NOT_FOUND", "Route not found");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method.toUpperCase();

      if (method === "OPTIONS") {
        return preflightResponse();
      }

      if (path === "/admin/login") {
        if (method !== "POST") {
          return withCors(methodNotAllowed());
        }

        const body = await readJsonBody<AdminLoginRequest>(request);
        const token = typeof body.token === "string" ? body.token : "";
        if (token === env.ADMIN_TOKEN) {
          return withCors(json({ success: true }, 200));
        }
        return withCors(json({ error: "Unauthorized" }, 401));
      }

      if (!path.startsWith("/api/")) {
        return withCors(notFound());
      }

      requireAdmin(request, env);

      if (path === "/api/state") {
        if (method !== "GET") {
          return withCors(methodNotAllowed());
        }
        return withCors(await getState(env));
      }

      if (path === "/api/events") {
        if (method !== "GET") {
          return withCors(methodNotAllowed());
        }
        return withCors(await getEvents(request, env));
      }

      if (path === "/api/consultations") {
        if (method !== "GET") {
          return withCors(methodNotAllowed());
        }
        return withCors(await getConsultations(request, env));
      }

      if (path === "/api/consult") {
        if (method !== "POST") {
          return withCors(methodNotAllowed());
        }
        return withCors(await postConsult(request, env));
      }

      if (path === "/api/update-log") {
        if (method !== "POST") {
          return withCors(methodNotAllowed());
        }
        return withCors(await postUpdateLog(request, env));
      }

      if (path === "/api/import") {
        if (method !== "POST") {
          return withCors(methodNotAllowed());
        }
        return withCors(await postImport(request, env));
      }

      return withCors(notFound());
    } catch (error) {
      return withCors(handleRouteError(error));
    }
  }
};
