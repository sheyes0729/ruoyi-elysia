import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./plugins/logger";
import { redis } from "./plugins/redis";
import { scheduler } from "./common/scheduler";
import { sseConnectionManager } from "./plugins/sse-manager";

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
const server = app.listen(env.port) as any;

const hostname = server.server?.hostname ?? "localhost";
const port = server.server?.port ?? env.port;
console.log(`🦊 RuoYi Elysia is running at http://${hostname}:${port}`);
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  const activeSSE = sseConnectionManager.getActiveCount();
  if (activeSSE > 0) {
    logger.info(`Closing ${activeSSE} active SSE connections...`);
    sseConnectionManager.closeAll();
  }

  scheduler.stop();

  await new Promise<void>((resolve) => {
    const httpServer = server.server;
    if (httpServer && typeof httpServer.close === "function") {
      httpServer.close(() => {
        logger.info("HTTP server closed");
        resolve();
      });
    } else {
      logger.info("HTTP server closed (no server found)");
      resolve();
    }
  });
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

  await new Promise<void>((resolve) => {
    redis
      .quit()
      .then(() => {
        logger.info("Redis connection closed");
        resolve();
      })
      .catch(() => {
        logger.info("Redis connection closed (error)");
        resolve();
      });
  });

  logger.info("Graceful shutdown completed");
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export { App } from "./app";
