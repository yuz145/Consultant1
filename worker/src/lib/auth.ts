import type { Env } from "../types/env";
import { HttpError } from "./http";

export function requireAdmin(request: Request, env: Env): void {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    throw new HttpError(401, "UNAUTHORIZED", "Missing Bearer token");
  }

  const token = auth.slice("Bearer ".length).trim();
  if (!token || token !== env.ADMIN_TOKEN) {
    throw new HttpError(403, "FORBIDDEN", "Invalid admin token");
  }
}
