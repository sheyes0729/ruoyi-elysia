import { edenTreaty } from "@elysiajs/eden";
import type { App } from "@ruoyi/backend";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";

const baseURL = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_API_BASE_URL || "/api";

export const api = edenTreaty<App>(baseURL, {
  fetchOptions: () => {
    const token = localStorage.getItem("ruoyi_token");
    return {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };
  },
});

export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export function isSuccess<T>(res: { data?: ApiResponse<T> } | { error?: { message?: string } }): boolean {
  if ("error" in res) return false;
  return res.data?.code === 200;
}

export function getData<T>(res: { data?: ApiResponse<T> }): T | null {
  return res.data?.data ?? null;
}

export function getMsg<T>(res: { data?: ApiResponse<T> }): string {
  return res.data?.msg ?? "操作失败";
}

export function handleApiError(error: unknown, defaultMsg = "网络错误"): string {
  if (error && typeof error === "object" && "message" in error) {
    return (error as { message: string }).message;
  }
  return defaultMsg;
}

export function handleUnauthorized(): void {
  const authStore = useAuthStore();
  authStore.logout();
  router.push("/login");
}

export function handleForbidden(): void {
  router.push("/403");
}

export async function apiRequest<T>(
  request: () => Promise<{ data?: ApiResponse<T> }>
): Promise<{ success: true; data: T } | { success: false; msg: string }> {
  try {
    const res = await request();
    if (isSuccess(res)) {
      return { success: true, data: getData(res)! };
    }
    const msg = getMsg(res);
    if (res.data?.code === 401) {
      handleUnauthorized();
    }
    return { success: false, msg };
  } catch (err) {
    return { success: false, msg: handleApiError(err) };
  }
}
