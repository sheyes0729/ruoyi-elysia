import { api } from "@/api"
import { defineStore } from "pinia"
import { ref, computed } from "vue"

const TOKEN_KEY = "ruoyi_token"
const REFRESH_TOKEN_KEY = "ruoyi_refresh_token"

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string>("")
  const refreshToken = ref<string>("")

  const userInfo = ref<{
    userId: number
    username: string
    nickName: string
    email: string
    phone: string
    avatar: string
    roles: string[]
    permissions: string[]
  } | null>(null)

  const isLogin = computed(() => !!token.value)

  const initFromStorage = () => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (storedToken) {
      token.value = storedToken
    }
    if (storedRefreshToken) {
      refreshToken.value = storedRefreshToken
    }
  }

  const setToken = (accessToken: string, refresh?: string) => {
    token.value = accessToken
    localStorage.setItem(TOKEN_KEY, accessToken)
    if (refresh) {
      refreshToken.value = refresh
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
    }
  }

  const getUserInfo = async () => {
    const { data, error } = await api.api.auth.getInfo.get()
    if (error) {
      console.error("Failed to get user info:", error)
      return
    }
    if (data?.code === 200 && data.data) {
      setUserInfo({
        userId: data.data.user.userId,
        username: data.data.user.userName,
        nickName: data.data.user.nickName,
        roles: data.data.roles,
        permissions: data.data.permissions,
        email: data.data.user.email || "",
        phone: data.data.user.phone || "",
        avatar: data.data.user.avatar || "",
      })
    }
  }

  const setUserInfo = (info: typeof userInfo.value) => {
    userInfo.value = info
  }

  const logout = async () => {
    try {
      await api.api.auth.logout.post()
    } catch {
      // ignore logout API error
    }
    token.value = ""
    refreshToken.value = ""
    userInfo.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  // Initialize from storage on store creation
  initFromStorage()

  return {
    token,
    refreshToken,
    userInfo,
    isLogin,
    setToken,
    getUserInfo,
    setUserInfo,
    logout,
  }
})
