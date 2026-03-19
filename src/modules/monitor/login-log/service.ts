import { monitorStore } from "../store";
import type { ListLoginLogQuery } from "./model";

type RecordLoginLogInput = {
  username: string;
  ip: string;
  status: "0" | "1";
  msg: string;
};

export class LoginLogService {
  record(input: RecordLoginLogInput): void {
    monitorStore.loginLogs.unshift({
      infoId: monitorStore.nextLoginLogId(),
      username: input.username,
      ip: input.ip,
      status: input.status,
      msg: input.msg,
      loginTime: new Date().toISOString(),
    });
  }

  list(query?: ListLoginLogQuery): typeof monitorStore.loginLogs {
    const source = [...monitorStore.loginLogs];
    if (!query) {
      return source;
    }

    return source.filter((item) => {
      if (query.username && !item.username.includes(query.username)) {
        return false;
      }

      if (query.status && item.status !== query.status) {
        return false;
      }

      if (query.beginTime && item.loginTime < query.beginTime) {
        return false;
      }

      if (query.endTime && item.loginTime > query.endTime) {
        return false;
      }

      return true;
    });
  }

  clear(): number {
    const count = monitorStore.loginLogs.length;
    monitorStore.loginLogs.splice(0, monitorStore.loginLogs.length);
    return count;
  }
}

export const loginLogService = new LoginLogService();
