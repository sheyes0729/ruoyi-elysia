import type { Directive } from 'vue'
import { useAuthStore } from '@/stores/auth'

export const vPermission: Directive = {
  mounted(el, binding) {
    const { value } = binding
    const authStore = useAuthStore()
    const { permissions } = authStore.userInfo || {}

    if (value && !permissions?.includes(value)) {
      el.parentNode?.removeChild(el)
    }
  },
}
