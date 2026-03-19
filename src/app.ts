import { Elysia } from "elysia";
import { fail, ok } from "./common/http/response";
import { authRoutes } from "./modules/auth/routes";
import { MonitorRoutes } from "./modules/monitor/routes";
import { systemRoutes } from "./modules/system/routes";
import { platformPlugin } from "./plugins/platform";
import { securityPlugin } from "./plugins/security";

export const app = new Elysia({ name: "ruoyi.elysia.app" })
  .use(platformPlugin)
  .use(securityPlugin)
  .get("/", () => ok("RuoYi Elysia Backend is running"))
  .get("/health", () => ok({ status: "UP" }))
  .use(authRoutes)
  .use(systemRoutes)
  .use(MonitorRoutes)
  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return fail(400, error.message);
    }

    set.status = 500;
    return fail(500, "服务内部错误");
  });
