import { build } from "esbuild";

const apiBaseUrl = process.env.VITE_API_BASE_URL ?? "";

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