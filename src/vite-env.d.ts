/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TAVILY_API_KEY: string
  readonly VITE_STEPFUN_API_KEY: string
  readonly VITE_STEPFUN_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
