export type OnlineSession = {
  token: string;
  userId: number;
  username: string;
  loginTime: string;
  lastAccessTime: string;
  ip: string;
};

export type LoginLogRecord = {
  infoId: number;
  username: string;
  ip: string;
  status: "0" | "1";
  msg: string;
  loginTime: string;
};

const onlineSessions: OnlineSession[] = [];
const loginLogs: LoginLogRecord[] = [];

let loginLogSeed = 1;

export const monitorStore = {
  onlineSessions,
  loginLogs,
  nextLoginLogId() {
    const currentId = loginLogSeed;
    loginLogSeed += 1;
    return currentId;
  },
};
