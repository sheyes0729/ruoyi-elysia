import { createRouter, createWebHistory } from "vue-router";
import { routes, handleHotUpdate } from "vue-router/auto-routes";
import { setupLayouts } from "virtual:generated-layouts";
import { useAuthStore } from "@/stores/auth";
import blankLayout from "@/layouts/blank.vue";
import loginPage from "@/pages/login.vue";

// Create a custom login route without layout
const loginRoute = {
  path: "/login",
  component: blankLayout,
  children: [
    {
      path: "",
      component: loginPage,
    },
  ],
};

// Filter out the auto-generated login route and prepend our custom one
const filteredRoutes = routes.filter((r) => r.path !== "/login");

const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts([loginRoute, ...filteredRoutes]),
});

const whiteList = ["/login"];

router.beforeEach(async (to) => {
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

if (import.meta.hot) {
  handleHotUpdate(router);
}

export default router;
