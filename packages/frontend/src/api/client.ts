import { TOKEN_KEY } from "@/constant/store";
import { edenTreaty } from "@elysiajs/eden";
import type { App } from "@ruoyi/backend";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const api = edenTreaty<App>(baseURL, {
  $fetch: {
    headers: {
      authorization: localStorage.getItem(TOKEN_KEY)
        ? "Bearer " + localStorage.getItem(TOKEN_KEY)
        : "",
    },
  },
});
