import { Elysia } from "elysia";
import { register, redisConnected } from "../../../plugins/monitor";
import { redis } from "../../../plugins/redis";

export const metricsRoutes = new Elysia({
  prefix: "/metrics",
  name: "monitor.metrics.routes",
})
  .get(
    "",
    async () => {
      try {
        await redis.ping();
        redisConnected.set(1);
      } catch {
        redisConnected.set(0);
      }

      return new Response(await register.metrics(), {
        headers: {
          "Content-Type": register.contentType,
        },
      });
    },
    {
      detail: {
        tags: ["系统监控-指标"],
        summary: "获取Prometheus指标",
        description: "暴露Prometheus格式的应用程序指标",
      },
    },
  )
  .get(
    "/health",
    async () => {
      const redisOk = await redis
        .ping()
        .then(() => true)
        .catch(() => false);

      return {
        status: redisOk ? "UP" : "DOWN",
        redis: redisOk ? "UP" : "DOWN",
        timestamp: new Date().toISOString(),
      };
    },
    {
      detail: {
        tags: ["系统监控-指标"],
        summary: "健康检查",
        description: "检查应用程序和Redis连接状态",
      },
    },
  );
