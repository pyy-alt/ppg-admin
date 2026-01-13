/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_BRAND: 'audi' | 'audica' | 'vw' | 'vwca'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
