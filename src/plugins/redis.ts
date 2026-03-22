import Redis from "ioredis";

const redisConfig = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? "6379"),
  password: process.env.REDIS_PASSWORD ?? undefined,
  db: Number(process.env.REDIS_DB ?? "0"),
};

export const redis = new Redis(redisConfig);

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

export const REDIS_KEYS = {
  ONLINE_SESSION: "ruoyi:online:",
  RATE_LIMIT: "ruoyi:ratelimit:",
  LOGIN_LOG: "ruoyi:loginlog:",
  CAPTCHA: "ruoyi:captcha:",
  IDEMPOTENCY: "ruoyi:idempotency:",
  ACCOUNT_LOCK: "ruoyi:account:lock:",
} as const;
