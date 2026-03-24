import { ref } from "vue";
import { useMessage } from "naive-ui";
import {
  api,
  handleApiError,
  handleUnauthorized,
  type ApiResponse,
} from "@/api/client";
import { useAuthStore } from "@/stores/auth";

export function useApi() {
  const message = useMessage();
  const loading = ref(false);

  async function get<T>(
    request: () => Promise<{ data?: ApiResponse<T> }>,
    options?: { showError?: boolean; onSuccess?: (data: T) => void }
  ): Promise<T | null> {
    loading.value = true;
    try {
      const res = await request();
      if (res.data?.code === 200) {
        if (options?.onSuccess) {
          options.onSuccess(res.data.data);
        }
        return res.data.data as T;
      }
      if (res.data?.code === 401) {
        handleUnauthorized();
        return null;
      }
      const msg = res.data?.msg ?? "操作失败";
      if (options?.showError !== false) {
        message.error(msg);
      }
      return null;
    } catch (err) {
      const msg = handleApiError(err);
      if (options?.showError !== false) {
        message.error(msg);
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function post<T>(
    request: () => Promise<{ data?: ApiResponse<T> }>,
    options?: { showError?: boolean; showSuccess?: boolean; onSuccess?: (data: T) => void }
  ): Promise<T | null> {
    loading.value = true;
    try {
      const res = await request();
      if (res.data?.code === 200) {
        if (options?.showSuccess) {
          message.success(res.data.msg ?? "操作成功");
        }
        if (options?.onSuccess) {
          options.onSuccess(res.data.data);
        }
        return res.data.data as T;
      }
      if (res.data?.code === 401) {
        handleUnauthorized();
        return null;
      }
      const msg = res.data?.msg ?? "操作失败";
      if (options?.showError !== false) {
        message.error(msg);
      }
      return null;
    } catch (err) {
      const msg = handleApiError(err);
      if (options?.showError !== false) {
        message.error(msg);
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    get,
    post,
    api,
  };
}

export function useAuthStoreWithMessage() {
  const message = useMessage();
  const authStore = useAuthStore();

  function logout(msg = "登录已过期，请重新登录") {
    message.warning(msg);
    setTimeout(() => {
      authStore.logout();
      window.location.href = "/login";
    }, 1500);
  }

  return {
    ...authStore,
    logout,
  };
}
