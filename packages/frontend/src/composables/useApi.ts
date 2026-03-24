import { ref } from "vue";
import { useMessage } from "naive-ui";
import { api, apiInterceptor, type ApiResponse } from "@/api/client";

export function useApi() {
  const message = useMessage();
  const loading = ref(false);

  apiInterceptor.onError((msg) => {
    message.error(msg);
  });

  async function get<T>(
    request: () => Promise<{ data?: ApiResponse<T> }>,
  ): Promise<T | null> {
    loading.value = true;
    try {
      const res = await request();
      apiInterceptor.handleResponse(res);
      if (res.data?.code === 200) {
        return res.data.data as T;
      }
      return null;
    } catch (err) {
      apiInterceptor.handleResponse({ error: err });
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function post<T>(
    request: () => Promise<{ data?: ApiResponse<T> }>,
    options?: { showSuccess?: boolean },
  ): Promise<T | null> {
    loading.value = true;
    try {
      const res = await request();
      apiInterceptor.handleResponse(res);
      if (res.data?.code === 200) {
        if (options?.showSuccess) {
          message.success(res.data.msg ?? "操作成功");
        }
        return res.data.data as T;
      }
      return null;
    } catch (err) {
      apiInterceptor.handleResponse({ error: err });
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function del<T>(
    request: () => Promise<{ data?: ApiResponse<T> }>,
    options?: { showSuccess?: boolean },
  ): Promise<T | null> {
    return post(request, options);
  }

  async function put<T>(
    request: () => Promise<{ data?: ApiResponse<T> }>,
    options?: { showSuccess?: boolean },
  ): Promise<T | null> {
    return post(request, options);
  }

  return {
    loading,
    get,
    post,
    put,
    del,
    api,
  };
}
