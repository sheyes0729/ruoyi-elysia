import { monitorStore } from "../store";

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

  list(): typeof monitorStore.loginLogs {
    return [...monitorStore.loginLogs];
  }
}

export const loginLogService = new LoginLogService();
