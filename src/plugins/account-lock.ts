import { redis, REDIS_KEYS } from "./redis";

const MAX_LOGIN_FAILURES = 5;
const LOCK_DURATION_SECONDS = 30 * 60;

export interface LoginFailureInfo {
  count: number;
  lockedUntil?: number;
}

const getFailureKey = (username: string): string =>
  `${REDIS_KEYS.ACCOUNT_LOCK}:${username}`;

const getLockKey = (username: string): string =>
  `${REDIS_KEYS.ACCOUNT_LOCK}:lock:${username}`;

export const accountLockService = {
  async isLocked(username: string): Promise<boolean> {
    const lockedUntil = await redis.get(getLockKey(username));
    if (!lockedUntil) {
      return false;
    }

    const until = parseInt(lockedUntil, 10);
    if (Date.now() < until) {
      return true;
    }

    await this.unlock(username);
    return false;
  },

  async recordFailure(username: string): Promise<LoginFailureInfo> {
    const key = getFailureKey(username);
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, LOCK_DURATION_SECONDS);
    }

    if (count >= MAX_LOGIN_FAILURES) {
      const lockedUntil = Date.now() + LOCK_DURATION_SECONDS * 1000;
      await redis.set(
        getLockKey(username),
        lockedUntil.toString(),
        "EX",
        LOCK_DURATION_SECONDS,
      );
      await redis.del(key);

      return { count, lockedUntil };
    }

    return { count };
  },

  async clearFailures(username: string): Promise<void> {
    await redis.del(getFailureKey(username));
    await redis.del(getLockKey(username));
  },

  async unlock(username: string): Promise<void> {
    await redis.del(getFailureKey(username));
    await redis.del(getLockKey(username));
  },

  async getFailureCount(username: string): Promise<number> {
    const count = await redis.get(getFailureKey(username));
    return count ? parseInt(count, 10) : 0;
  },

  async getLockRemainingTime(username: string): Promise<number> {
    const lockedUntil = await redis.get(getLockKey(username));
    if (!lockedUntil) {
      return 0;
    }

    const remaining = parseInt(lockedUntil, 10) - Date.now();
    return remaining > 0 ? remaining : 0;
  },
};
