/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENDPOINT_URL: string
  readonly VITE_BRAND: 'audi' | 'audica' | 'vw' | 'vwca'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
