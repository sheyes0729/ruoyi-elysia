import { Elysia } from "elysia";
import { rateLimit as elysiaRateLimit } from "elysia-rate-limit";
import { fail } from "../common/http/response";
import { env } from "../config/env";
import { getClientIp } from "request-ip";

const rateLimitResponse = new Response(
  JSON.stringify(fail(429, "请求过于频繁，请稍后再试")),
  {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(env.rateLimit.duration / 1000),
    },
  },
);

export const rateLimitPlugin = new Elysia({ name: "rate-limit" }).use(
  elysiaRateLimit({
    duration: env.rateLimit.duration,
    max: env.rateLimit.max,
    errorResponse: rateLimitResponse,
    generator: (request) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return getClientIp(request as any) ?? "unknown";
    },
  }),
);

export const authRateLimitPlugin = new Elysia({
  name: "auth-rate-limit",
}).use(
  elysiaRateLimit({
    duration: env.rateLimit.duration,
    max: env.rateLimit.authMax,
    errorResponse: rateLimitResponse,
    generator: (request) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return getClientIp(request as any) ?? "unknown";
    },
  }),
);
