/// <reference types="vite/client" />

declare module 'virtual:generated-layouts' {
  import type { RouteRecordRaw } from 'vue-router'
  const layouts: RouteRecordRaw[]
  export default layouts
}

declare module 'virtual:uno-css' {
  const uno: import('unocss').UnoGenerator
  export default uno
}

declare module 'vue-router/auto-routes' {
  import type { RouteRecordRaw } from 'vue-router'
  export const routes: RouteRecordRaw[]
  export function handleHotUpdate(router: import('vue-router').Router): void
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
