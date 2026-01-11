/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_CLOUDFLARE_ACCOUNT_HASH: string
  readonly VITE_IMAGE_CDN_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
