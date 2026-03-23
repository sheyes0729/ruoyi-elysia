import { api } from "@/api";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string>("");
  const refreshToken = ref<string>("");
  const userInfo = ref<{
    userId: number;
    username: string;
    nickName: string;
    email: string;
    phone: string;
    avatar: string;
    roles: string[];
    permissions: string[];
  } | null>(null);

  const isLogin = computed(() => !!token.value);

  const setToken = (accessToken: string, refresh?: string) => {
    token.value = accessToken;
    if (refresh) {
      refreshToken.value = refresh;
    }
  };

  const getUserInfo = async () => {
    const { data } = await api.api.auth.getInfo.get();
    if (data) {
      setUserInfo({
        userId: data.data.user.userId,
        username: data.data.user.userName,
        nickName: data.data.user.nickName,
        roles: data.data.roles,
        permissions: data.data.permissions,
        email: "",
        phone: "",
        avatar: "",
      });
    }
  };

  const setUserInfo = (info: typeof userInfo.value) => {
    userInfo.value = info;
  };

  const logout = () => {
    token.value = "";
    refreshToken.value = "";
    userInfo.value = null;
  };

  return {
    token,
    refreshToken,
    userInfo,
    isLogin,
    setToken,
    setUserInfo,
    logout,
    getUserInfo,
  };
});
