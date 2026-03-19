import { accessDataStore } from "../access-data";
import type { ListUserQuery, UserListItem } from "./model";

export class UserService {
  list(query?: ListUserQuery): UserListItem[] {
    const source = accessDataStore.users.map((item) => ({
      userId: item.userId,
      username: item.username,
      nickName: item.nickName,
      status: item.status,
      roleIds: item.roleIds,
    }));

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

      return true;
    });
  }

  removeBatch(ids: number[]): number {
    const idSet = new Set(ids);
    const before = accessDataStore.users.length;
    accessDataStore.users.splice(
      0,
      accessDataStore.users.length,
      ...accessDataStore.users.filter((item) => !idSet.has(item.userId))
    );
    return before - accessDataStore.users.length;
  }
}

export const userService = new UserService();
