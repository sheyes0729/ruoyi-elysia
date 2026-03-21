import { redis, REDIS_KEYS } from "../../../plugins/redis";
import type { ListOnlineQuery } from "./model";

type OnlineSession = {
  token: string;
  userId: number;
  username: string;
  loginTime: string;
  lastAccessTime: string;
  ip: string;
};

type RegisterOnlineSessionInput = {
  token: string;
  userId: number;
  username: string;
  ip: string;
};

export class OnlineService {
  private getKey(token: string): string {
    return `${REDIS_KEYS.ONLINE_SESSION}${token}`;
  }

  async registerSession(input: RegisterOnlineSessionInput): Promise<void> {
    const now = new Date().toISOString();
    const key = this.getKey(input.token);

    const existing = await redis.get(key);
    if (existing) {
      await redis.hset(key, "lastAccessTime", now, "ip", input.ip);
      await redis.expire(key, 86400);
      return;
    }

    await redis.hset(key, {
      token: input.token,
      userId: String(input.userId),
      username: input.username,
      loginTime: now,
      lastAccessTime: now,
      ip: input.ip,
    });
    await redis.expire(key, 86400);
  }

  async removeSession(token: string): Promise<boolean> {
    const key = this.getKey(token);
    const result = await redis.del(key);
    return result > 0;
  }

  async listSessions(query?: ListOnlineQuery): Promise<OnlineSession[]> {
    const keys = await redis.keys(`${REDIS_KEYS.ONLINE_SESSION}*`);
    if (keys.length === 0) {
      return [];
    }

    const sessions: OnlineSession[] = [];
    for (const key of keys) {
      const data = await redis.hgetall(key);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (data) {
        sessions.push({
          token: data.token || "",
          userId: parseInt(data.userId || "0", 10),
          username: data.username || "",
          loginTime: data.loginTime || "",
          lastAccessTime: data.lastAccessTime || "",
          ip: data.ip || "",
        });
      }
    }

    if (!query?.username) {
      return sessions;
    }

    return sessions.filter((item) =>
      item.username.includes(query.username ?? ""),
    );
  }
}

export const onlineService = new OnlineService();
