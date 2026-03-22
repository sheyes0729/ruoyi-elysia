import { redis, REDIS_KEYS } from "./redis";

const IDEMPOTENCY_EXPIRE_SECONDS = 86400;

export type IdempotencyResult<T> =
  | { isNew: true; result: T }
  | { isNew: false; result: T };

export const idempotencyService = {
  async check<T>(
    key: string,
    processor: () => Promise<T>,
  ): Promise<IdempotencyResult<T>> {
    const redisKey = `${REDIS_KEYS.IDEMPOTENCY}${key}`;

    const cached = await redis.get(redisKey);
    if (cached) {
      const result = JSON.parse(cached) as T;
      return { isNew: false, result };
    }

    const result = await processor();

    await redis.setex(
      redisKey,
      IDEMPOTENCY_EXPIRE_SECONDS,
      JSON.stringify(result),
    );

    return { isNew: true, result };
  },

  async isProcessed(key: string): Promise<boolean> {
    const redisKey = `${REDIS_KEYS.IDEMPOTENCY}${key}`;
    const cached = await redis.get(redisKey);
    return cached !== null;
  },

  async get<T>(key: string): Promise<T | null> {
    const redisKey = `${REDIS_KEYS.IDEMPOTENCY}${key}`;
    const cached = await redis.get(redisKey);
    if (!cached) {
      return null;
    }
    return JSON.parse(cached) as T;
  },

  async set<T>(key: string, value: T): Promise<void> {
    const redisKey = `${REDIS_KEYS.IDEMPOTENCY}${key}`;
    await redis.setex(
      redisKey,
      IDEMPOTENCY_EXPIRE_SECONDS,
      JSON.stringify(value),
    );
  },
};
