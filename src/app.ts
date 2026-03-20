import { Elysia } from "elysia";
import { SECURED_OPER_LOG_KEY } from "./common/auth/secured";
import { fail, ok } from "./common/http/response";
import { authRoutes } from "./modules/auth/routes";
import { MonitorRoutes } from "./modules/monitor/routes";
import type { OperBusinessType } from "./modules/monitor/oper-log/business-type";
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

    if ((set as Record<string, unknown>)[SECURED_OPER_LOG_KEY] === true) {
      return;
    }

    const statusCode = typeof set.status === "number" ? set.status : 200;
    const businessType: OperBusinessType =
      request.method === "POST"
        ? "INSERT"
        : request.method === "PUT" || request.method === "PATCH"
          ? "UPDATE"
          : request.method === "DELETE"
            ? "DELETE"
            : "OTHER";
    operLogService.record({
      title: `${request.method} ${pathname}`,
      businessType,
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
