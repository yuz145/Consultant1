import { requireAdmin } from "./lib/auth";
import { errorResponse, handleRouteError } from "./lib/http";
import { postConsult } from "./routes/consult";
import { getConsultations } from "./routes/consultations";
import { getEvents } from "./routes/events";
import { postImport } from "./routes/import";
import { getState } from "./routes/state";
import { postUpdateLog } from "./routes/update-log";
import type { Env } from "./types/env";

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

      if (!path.startsWith("/api/")) {
        return notFound();
      }

      requireAdmin(request, env);

      if (path === "/api/state") {
        if (method !== "GET") {
          return methodNotAllowed();
        }
        return getState(env);
      }

      if (path === "/api/events") {
        if (method !== "GET") {
          return methodNotAllowed();
        }
        return getEvents(request, env);
      }

      if (path === "/api/consultations") {
        if (method !== "GET") {
          return methodNotAllowed();
        }
        return getConsultations(request, env);
      }

      if (path === "/api/consult") {
        if (method !== "POST") {
          return methodNotAllowed();
        }
        return postConsult(request, env);
      }

      if (path === "/api/update-log") {
        if (method !== "POST") {
          return methodNotAllowed();
        }
        return postUpdateLog(request, env);
      }

      if (path === "/api/import") {
        if (method !== "POST") {
          return methodNotAllowed();
        }
        return postImport(request, env);
      }

      return notFound();
    } catch (error) {
      return handleRouteError(error);
    }
  }
};
