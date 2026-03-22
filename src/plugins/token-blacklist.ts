import { redis, REDIS_KEYS } from "./redis";

const TOKEN_BLACKLIST_PREFIX = `${REDIS_KEYS.IDEMPOTENCY}token:blacklist:`;
const TOKEN_TTL = 86400 * 7;

export const tokenBlacklistService = {
  async blacklistToken(token: string, userId: number): Promise<void> {
    const key = `${TOKEN_BLACKLIST_PREFIX}${userId}:${this.hashToken(token)}`;
    await redis.setex(key, TOKEN_TTL, "1");
  },

  async isBlacklisted(token: string, userId: number): Promise<boolean> {
    const key = `${TOKEN_BLACKLIST_PREFIX}${userId}:${this.hashToken(token)}`;
    const result = await redis.get(key);
    return result !== null;
  },

  async blacklistUser(userId: number): Promise<void> {
    const pattern = `${TOKEN_BLACKLIST_PREFIX}${userId}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      const ttl = await redis.ttl(keys[0]);
      await redis.setex(
        `${TOKEN_BLACKLIST_PREFIX}${userId}:all`,
        ttl > 0 ? ttl : TOKEN_TTL,
        "1",
      );
      for (const key of keys) {
        await redis.del(key);
      }
    } else {
      await redis.setex(
        `${TOKEN_BLACKLIST_PREFIX}${userId}:all`,
        TOKEN_TTL,
        "1",
      );
    }
  },

  async isUserBlacklisted(userId: number): Promise<boolean> {
    const key = `${TOKEN_BLACKLIST_PREFIX}${userId}:all`;
    const result = await redis.get(key);
    return result !== null;
  },

  async removeUserFromBlacklist(userId: number): Promise<void> {
    const pattern = `${TOKEN_BLACKLIST_PREFIX}${userId}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  hashToken(token: string): string {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  },
};
