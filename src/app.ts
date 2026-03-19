import { Elysia } from "elysia";
import { fail, ok } from "./common/http/response";
import { authRoutes } from "./modules/auth/routes";
import { MonitorRoutes } from "./modules/monitor/routes";
import { operLogService } from "./modules/monitor/oper-log/service";
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
  .onAfterHandle(({ currentUser, request, set }) => {
    const requestUrl = new URL(request.url);
    const pathname = requestUrl.pathname;

    if (request.method === "GET" || pathname.startsWith("/swagger")) {
      return;
    }

    const statusCode = typeof set.status === "number" ? set.status : 200;
    operLogService.record({
      title: `${request.method} ${pathname}`,
      operName: currentUser?.username ?? "anonymous",
      method: "ElysiaHandler",
      requestMethod: request.method,
      operUrl: pathname,
      status: statusCode >= 400 ? "1" : "0",
    });
  })
  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return fail(400, error.message);
    }

    set.status = 500;
    return fail(500, "服务内部错误");
  });
