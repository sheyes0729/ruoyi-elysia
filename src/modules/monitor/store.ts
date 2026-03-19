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

export type OperLogRecord = {
  operId: number;
  title: string;
  operName: string;
  method: string;
  requestMethod: string;
  operUrl: string;
  status: "0" | "1";
  operTime: string;
};

const onlineSessions: OnlineSession[] = [];
const loginLogs: LoginLogRecord[] = [];
const operLogs: OperLogRecord[] = [];

let loginLogSeed = 1;
let operLogSeed = 1;

export const monitorStore = {
  onlineSessions,
  loginLogs,
  operLogs,
  nextLoginLogId() {
    const currentId = loginLogSeed;
    loginLogSeed += 1;
    return currentId;
  },
  nextOperLogId() {
    const currentId = operLogSeed;
    operLogSeed += 1;
    return currentId;
  },
};
