import { Elysia } from "elysia";
import { SECURED_OPER_LOG_KEY } from "./common/auth/secured";
import { fail, ok } from "./common/http/response";
import { authRoutes } from "./modules/auth/routes";
import { MonitorRoutes } from "./modules/monitor/routes";
import type { OperBusinessType } from "./modules/monitor/oper-log/business-type";
import { operLogService } from "./modules/monitor/oper-log/service";
import { systemRoutes } from "./modules/system/routes";
import { exportSseRoutes } from "./modules/export/sse-routes";
import { logger, logRequest, logError } from "./plugins/logger";
import { platformPlugin } from "./plugins/platform";
import { rateLimitPlugin } from "./plugins/rate-limit";
import { redis } from "./plugins/redis";
import { securityPlugin } from "./plugins/security";
import { idempotencyPlugin } from "./plugins/idempotency-plugin";
import { idempotencyService } from "./plugins/idempotency";
import { scheduler, registerScheduledTasks } from "./common/scheduler";

export const app = new Elysia({ name: "ruoyi.elysia.app" })
  .use(platformPlugin)
  .use(securityPlugin)
  .use(rateLimitPlugin)
  .use(idempotencyPlugin)
  .onStart(() => {
    logger.info("RuoYi Elysia server starting...");
    registerScheduledTasks();
    scheduler.start();
  })
  .onStop(() => {
    scheduler.stop();
  })
  .get("/", () => ok("RuoYi Elysia Backend is running"))
  .get("/health", async () => {
    try {
      await redis.ping();
      return ok({ status: "UP", redis: "UP" });
    } catch {
      return ok({ status: "UP", redis: "DOWN" });
    }
  })
  .use(authRoutes)
  .use(exportSseRoutes)
  .use(systemRoutes)
  .use(MonitorRoutes)
  .onAfterHandle(async (context) => {
    const { request, set, result } = context as typeof context & {
      result?: unknown;
    };
    const requestUrl = new URL(request.url);
    const pathname = requestUrl.pathname;
    const statusCode = typeof set.status === "number" ? set.status : 200;

    logRequest(request.method, pathname, statusCode);

    if (request.method === "GET" || pathname.startsWith("/swagger")) {
      return;
    }

    const idempotencyKey = (request as Request & { idempotencyKey?: string })
      .idempotencyKey;
    if (idempotencyKey && result && statusCode >= 200 && statusCode < 300) {
      await idempotencyService.set(idempotencyKey, result);
    }

    if ((set as Record<string, unknown>)[SECURED_OPER_LOG_KEY] === true) {
      return;
    }

    const businessType: OperBusinessType =
      request.method === "POST"
        ? "INSERT"
        : request.method === "PUT" || request.method === "PATCH"
          ? "UPDATE"
          : request.method === "DELETE"
            ? "DELETE"
            : "OTHER";

    const currentUser = (request as Request & { currentUser?: unknown })
      .currentUser as { username?: string } | undefined;

    void operLogService.record({
      title: `${request.method} ${pathname}`,
      businessType,
      operName: currentUser?.username ?? "anonymous",
      method: "ElysiaHandler",
      requestMethod: request.method,
      operUrl: pathname,
      status: statusCode >= 400 ? "1" : "0",
    });
  })
  .onError(({ code, error, request, set }) => {
    const pathname = new URL(request.url).pathname;
    logError(error as Error, { pathname, code });

    if (code === "VALIDATION") {
      set.status = 400;
      return fail(400, (error as Error).message);
    }

    set.status = 500;
    return fail(500, "服务内部错误");
  });
