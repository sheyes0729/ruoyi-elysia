import { monitorStore } from "../store";
import type { ListOnlineQuery } from "./model";

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

  listSessions(query?: ListOnlineQuery): typeof monitorStore.onlineSessions {
    const source = [...monitorStore.onlineSessions];
    if (!query?.username) {
      return source;
    }

    return source.filter((item) => item.username.includes(query.username ?? ""));
  }
}

export const onlineService = new OnlineService();
