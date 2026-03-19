import { monitorStore } from "../store";

type RegisterOnlineSessionInput = {
  token: string;
  userId: number;
  username: string;
  ip: string;
};

export class OnlineService {
  registerSession(input: RegisterOnlineSessionInput): void {
    const now = new Date().toISOString();
    const found = monitorStore.onlineSessions.find(
      (item) => item.token === input.token
    );

    if (found) {
      found.lastAccessTime = now;
      found.ip = input.ip;
      return;
    }

    monitorStore.onlineSessions.unshift({
      token: input.token,
      userId: input.userId,
      username: input.username,
      loginTime: now,
      lastAccessTime: now,
      ip: input.ip,
    });
  }

  removeSession(token: string): boolean {
    const index = monitorStore.onlineSessions.findIndex(
      (item) => item.token === token
    );

    if (index < 0) {
      return false;
    }

    monitorStore.onlineSessions.splice(index, 1);
    return true;
  }

  listSessions(): typeof monitorStore.onlineSessions {
    return [...monitorStore.onlineSessions];
  }
}

export const onlineService = new OnlineService();
