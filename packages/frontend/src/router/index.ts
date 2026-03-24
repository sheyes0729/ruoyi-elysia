import { createRouter, createWebHistory } from "vue-router";
import generatedPages from "virtual:generated-pages";
import { setupLayouts } from "virtual:meta-layouts";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(generatedPages),
  scrollBehavior: (_, __, savedPosition) => {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0, left: 0 };
  },
});

const whiteList = ["/login"];

router.beforeEach(async (to) => {
  console.log("before:", to);

  const authStore = useAuthStore();

  if (whiteList.includes(to.path)) {
    return true;
  }

  if (!authStore.isLogin) {
    return "/login";
  }

  if (!authStore.userInfo) {
    try {
      await authStore.getUserInfo();
    } catch {
      return "/login";
    }
  }

  return true;
});

export default router;
