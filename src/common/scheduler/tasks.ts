import { redis, REDIS_KEYS } from "../../plugins/redis";
import { scheduler } from "./index";

const CLEANUP_INTERVAL = "0 */6 * * *";

async function cleanupExpiredSessions(): Promise<void> {
  const pattern = `${REDIS_KEYS.ONLINE_SESSION}*`;
  const keys = await redis.keys(pattern);

  let removedCount = 0;
  for (const key of keys) {
    const ttl = await redis.ttl(key);
    if (ttl === -2) {
      await redis.del(key);
      removedCount++;
    }
  }

  if (removedCount > 0) {
    console.log(`[Scheduler] Cleaned up ${removedCount} expired session keys`);
  }
}

async function cleanupOldLoginLogs(): Promise<void> {
  const LOG_LIST_KEY = REDIS_KEYS.LOGIN_LOG;
  const now = Date.now();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  const logs = await redis.lrange(LOG_LIST_KEY, 0, -1);

  let removedCount = 0;
  for (const log of logs) {
    try {
      const parsed = JSON.parse(log) as { timestamp?: number };
      if (parsed.timestamp && now - parsed.timestamp > SEVEN_DAYS_MS) {
        await redis.lrem(LOG_LIST_KEY, 1, log);
        removedCount++;
      }
    } catch {
      // skip invalid entries
    }
  }

  if (removedCount > 0) {
    console.log(`[Scheduler] Cleaned up ${removedCount} old login log entries`);
  }
}

export const scheduledTasks = [
  {
    name: "cleanupExpiredSessions",
    cron: CLEANUP_INTERVAL,
    handler: cleanupExpiredSessions,
    enabled: process.env.SCHEDULER_ENABLED !== "false",
  },
  {
    name: "cleanupOldLoginLogs",
    cron: "0 3 * * *",
    handler: cleanupOldLoginLogs,
    enabled: process.env.SCHEDULER_ENABLED !== "false",
  },
];

export function registerScheduledTasks(): void {
  for (const task of scheduledTasks) {
    scheduler.register(task);
  }
}
