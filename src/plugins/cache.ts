import { redis, REDIS_KEYS } from "./redis";

const DEFAULT_TTL = 3600;

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(`${REDIS_KEYS.CACHE}${key}`);
    if (!data) {
      return null;
    }
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  },

  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {},
  ): Promise<void> {
    const ttl = options.ttl ?? DEFAULT_TTL;
    await redis.setex(`${REDIS_KEYS.CACHE}${key}`, ttl, JSON.stringify(value));
  },

  async del(key: string): Promise<void> {
    await redis.del(`${REDIS_KEYS.CACHE}${key}`);
  },

  async delPattern(pattern: string): Promise<number> {
    const keys = await redis.keys(`${REDIS_KEYS.CACHE}${pattern}`);
    if (keys.length === 0) {
      return 0;
    }
    const deleted = await redis.del(...keys);
    return deleted;
  },

  async exists(key: string): Promise<boolean> {
    const result = await redis.exists(`${REDIS_KEYS.CACHE}${key}`);
    return result === 1;
  },

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    await this.set(key, data, options);
    return data;
  },

  async invalidateUserCache(userId: number): Promise<void> {
    await this.delPattern(`user:${userId}:*`);
    await this.delPattern(`permission:${userId}:*`);
  },

  async invalidateRoleCache(roleId: number): Promise<void> {
    await this.delPattern(`role:${roleId}:*`);
  },

  async invalidateDictCache(dictType: string): Promise<void> {
    await this.del(`dict:${dictType}`);
    await this.delPattern("dict:list:*");
  },

  async invalidateConfigCache(configKey: string): Promise<void> {
    await this.del(`config:${configKey}`);
    await this.delPattern("config:list:*");
  },
};
