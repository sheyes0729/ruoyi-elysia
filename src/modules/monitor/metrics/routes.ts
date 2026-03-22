import { Elysia } from "elysia";
import { register, redisConnected } from "../../../plugins/monitor";
import { redis } from "../../../plugins/redis";

export const metricsRoutes = new Elysia({
  prefix: "/metrics",
  name: "monitor.metrics.routes",
})
  .get("", async () => {
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
  })
  .get("/health", async () => {
    const redisOk = await redis
      .ping()
      .then(() => true)
      .catch(() => false);

    return {
      status: redisOk ? "UP" : "DOWN",
      redis: redisOk ? "UP" : "DOWN",
      timestamp: new Date().toISOString(),
    };
  });
