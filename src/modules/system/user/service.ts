import { accessDataStore } from "../access-data";
import type { UserListItem } from "./model";

export class UserService {
  list(): UserListItem[] {
    return accessDataStore.users.map((item) => ({
      userId: item.userId,
      username: item.username,
      nickName: item.nickName,
      status: item.status,
      roleIds: item.roleIds,
    }));
  }
}

export const userService = new UserService();
