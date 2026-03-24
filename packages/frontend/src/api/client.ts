import { edenTreaty } from "@elysiajs/eden";
import type { App } from "@ruoyi/backend";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import { TOKEN_KEY } from "@/constant/store";

const baseURL = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_API_BASE_URL || "/api";

export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

export interface ApiError {
  code: number;
  msg: string;
  data: null;
}

export function isSuccess<T>(res: { data?: ApiResponse<T> }): boolean {
  return res.data?.code === 200;
}

export function getData<T>(res: { data?: ApiResponse<T> }): T | null {
  return res.data?.data ?? null;
}

export function getMsg<T>(res: { data?: ApiResponse<T> }): string {
  return res.data?.msg ?? "操作失败";
}

class ApiInterceptor {
  private onUnauthorizedCallback: (() => void) | null = null;
  private onForbiddenCallback: (() => void) | null = null;
  private onErrorCallback: ((msg: string, code: number) => void) | null = null;

  onUnauthorized(callback: () => void) {
    this.onUnauthorizedCallback = callback;
  }

  onForbidden(callback: () => void) {
    this.onForbiddenCallback = callback;
  }

  onError(callback: (msg: string, code: number) => void) {
    this.onErrorCallback = callback;
  }

  handleResponse<T>(
    res: { data?: ApiResponse<T> } | { error?: unknown },
  ): void {
    const hasError = "error" in res;
    if (hasError) {
      this.onErrorCallback?.("网络错误", -1);
      return;
    }

    const data = (res as { data?: ApiResponse<T> }).data;
    if (!data) {
      return;
    }

    const code = data.code;

    if (code === 401) {
      this.onUnauthorizedCallback?.();
      return;
    }

    if (code === 403) {
      this.onForbiddenCallback?.();
      return;
    }

    if (code !== 200) {
      this.onErrorCallback?.(data.msg ?? "操作失败", code);
    }
  }
}

export const apiInterceptor = new ApiInterceptor();

apiInterceptor.onUnauthorized(() => {
  const authStore = useAuthStore();
  authStore.logout();
  router.push("/login");
});

apiInterceptor.onForbidden(() => {
  router.push("/403");
});

apiInterceptor.onError((msg) => {
  console.error("API Error:", msg);
});

export const api = edenTreaty<App>(baseURL, {
  $fetch: {
    headers: {
      Authorization: localStorage.getItem(TOKEN_KEY)
        ? `Bearer ${localStorage.getItem(TOKEN_KEY)}`
        : "",
    },
  },
});
