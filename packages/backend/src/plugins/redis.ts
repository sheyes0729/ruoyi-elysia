import Redis from "ioredis";

const redisConfig = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? "6379"),
  password: process.env.REDIS_PASSWORD ?? undefined,
  db: Number(process.env.REDIS_DB ?? "0"),
  retryStrategy: (times: number) => {
    if (times > 10) {
      console.error("Redis: Max reconnection attempts reached");
      return null;
    }
    const delay = Math.min(times * 200, 5000);
    console.log(`Redis: Reconnecting in ${delay}ms (attempt ${times})`);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
};

export const redis = new Redis(redisConfig);

let isConnected = false;

redis.on("error", (err) => {
  console.error("Redis connection error:", err.message);
  isConnected = false;
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
  isConnected = true;
});

redis.on("ready", () => {
  console.log("Redis is ready");
  isConnected = true;
});

redis.on("close", () => {
  console.log("Redis connection closed");
  isConnected = false;
});

redis.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

export const isRedisConnected = (): boolean =>
  isConnected && redis.status === "ready";

export const REDIS_KEYS = {
  ONLINE_SESSION: "ruoyi:online:",
  RATE_LIMIT: "ruoyi:ratelimit:",
  LOGIN_LOG: "ruoyi:loginlog:",
  CAPTCHA: "ruoyi:captcha:",
  IDEMPOTENCY: "ruoyi:idempotency:",
  ACCOUNT_LOCK: "ruoyi:account:lock:",
  IP_POLICY: "ruoyi:ip:policy",
  CACHE: "ruoyi:cache:",
} as const;
