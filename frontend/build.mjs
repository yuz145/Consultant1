import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = resolve(fileURLToPath(new URL(".", import.meta.url)));
process.chdir(frontendRoot);

function parseEnv(content) {
  const env = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim();
    env[key] = value;
  }

  return env;
}

async function loadApiBaseUrl() {
  const fromProcess = process.env.VITE_API_BASE_URL?.trim();
  if (fromProcess) {
    return fromProcess;
  }

  const envPath = resolve(frontendRoot, ".env.production");
  try {
    const content = await readFile(envPath, "utf8");
    const parsed = parseEnv(content);
    return parsed.VITE_API_BASE_URL?.trim() ?? "";
  } catch {
    return "";
  }
}

const apiBaseUrl = await loadApiBaseUrl();

if (!apiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is not configured in process.env or .env.production");
}

await mkdir("public", { recursive: true });
await writeFile(
  "public/runtime-config.js",
  `window.__APP_CONFIG__ = ${JSON.stringify({ VITE_API_BASE_URL: apiBaseUrl })};\n`
);

await build({
  entryPoints: ["src/app.ts"],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2020",
  outfile: "public/bundle.js",
  define: {
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify(apiBaseUrl)
  }
});