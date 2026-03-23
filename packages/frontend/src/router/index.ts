import { createRouter, createWebHistory } from 'vue-router'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'
import { setupLayouts } from 'virtual:generated-layouts'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(routes),
})

const whiteList = ['/login']

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (whiteList.includes(to.path)) {
    return true
  }

  if (!authStore.isLogin) {
    return '/login'
  }

  if (!authStore.userInfo) {
    try {
      const { data } = await api.api.auth.getInfo.get()
      if (data) {
        authStore.setUserInfo(data)
      }
    } catch {
      return '/login'
    }
  }

  return true
})

if (import.meta.hot) {
  handleHotUpdate(router)
}

export default router
