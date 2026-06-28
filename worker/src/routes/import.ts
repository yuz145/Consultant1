import { DatabaseClient } from "../db/client";
import { ImportsRepository } from "../db/imports-repo";
import { json, readJsonBody } from "../lib/http";
import { optionalString, requireSourceType } from "../lib/validator";
import type { ImportRequest } from "../types/api";
import type { Env } from "../types/env";

export async function postImport(request: Request, env: Env): Promise<Response> {
  const body = await readJsonBody<ImportRequest>(request);
  const sourceType = requireSourceType(body.sourceType);
  const fileName = optionalString(body.fileName, "fileName", 255);
  const r2Key = optionalString(body.r2Key, "r2Key", 1024);
  const contentPreview = optionalString(body.contentPreview, "contentPreview", 5000);

  const db = new DatabaseClient(env);
  const importsRepo = new ImportsRepository(db);

  const rawImport = await importsRepo.create({
    sourceType,
    fileName,
    r2Key,
    contentPreview
  });

  return json({ rawImport }, 201);
}
