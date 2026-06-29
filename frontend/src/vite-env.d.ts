interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __APP_CONFIG__?: {
    VITE_API_BASE_URL?: string;
  };
}

declare var __APP_CONFIG__: Window["__APP_CONFIG__"];