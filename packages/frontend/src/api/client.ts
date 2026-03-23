import { edenTreaty } from '@elysiajs/eden'
import type { App } from '@ruoyi/backend'

const baseURL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_BASE_URL || '/api'

export const api = edenTreaty<App>(baseURL)
