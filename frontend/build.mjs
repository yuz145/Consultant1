import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";

const apiBaseUrl = process.env.VITE_API_BASE_URL ?? "";

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