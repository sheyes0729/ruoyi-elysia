import { redis, REDIS_KEYS } from "../../../plugins/redis";
import type { ListLoginLogQuery } from "./model";

type LoginLog = {
  infoId: number;
  username: string;
  ip: string;
  status: "0" | "1";
  msg: string;
  loginTime: string;
};

type RecordLoginLogInput = {
  username: string;
  ip: string;
  status: "0" | "1";
  msg: string;
};

const LOG_LIST_KEY = `${REDIS_KEYS.LOGIN_LOG}list`;
const LOG_COUNTER_KEY = `${REDIS_KEYS.LOGIN_LOG}counter`;
const MAX_LOG_ENTRIES = 1000;

export class LoginLogService {
  async record(input: RecordLoginLogInput): Promise<void> {
    const id = await redis.incr(LOG_COUNTER_KEY);
    const now = new Date().toISOString();

    await redis.lpush(
      LOG_LIST_KEY,
      JSON.stringify({
        infoId: id,
        username: input.username,
        ip: input.ip,
        status: input.status,
        msg: input.msg,
        loginTime: now,
      }),
    );

    await redis.ltrim(LOG_LIST_KEY, 0, MAX_LOG_ENTRIES - 1);
  }

  async list(query?: ListLoginLogQuery): Promise<LoginLog[]> {
    const logs = await redis.lrange(LOG_LIST_KEY, 0, MAX_LOG_ENTRIES - 1);

    let result: LoginLog[] = logs
      .map((log) => JSON.parse(log) as LoginLog)
      .filter((item) => item !== null);

    if (!query) {
      return result;
    }

    if (query.username) {
      result = result.filter((item) =>
        item.username.includes(query.username ?? ""),
      );
    }

    if (query.status) {
      result = result.filter((item) => item.status === query.status);
    }

    if (query.beginTime) {
      result = result.filter((item) => item.loginTime >= query.beginTime!);
    }

    if (query.endTime) {
      result = result.filter((item) => item.loginTime <= query.endTime!);
    }

    return result;
  }

  async clear(): Promise<number> {
    const count = await redis.llen(LOG_LIST_KEY);
    await redis.del(LOG_LIST_KEY);
    await redis.del(LOG_COUNTER_KEY);
    return count;
  }
}

export const loginLogService = new LoginLogService();
