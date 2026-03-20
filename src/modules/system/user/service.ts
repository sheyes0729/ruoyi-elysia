import { removeBatchByNumericId } from "../../../common/data/array";
import { accessDataStore } from "../access-data";
import type {
  CreateUserBody,
  ListUserQuery,
  ResetPasswordBody,
  UpdateUserBody,
  UserListItem,
} from "./model";

type CreateUserResult =
  | { success: true; userId: number }
  | { success: false; reason: "username_exists" | "role_not_found" };

type UpdateUserResult =
  | { success: true }
  | { success: false; reason: "user_not_found" | "role_not_found" };

type ResetPasswordResult =
  | { success: true }
  | { success: false; reason: "user_not_found" };

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
    return removeBatchByNumericId(accessDataStore.users, ids, (item) => item.userId);
  }

  create(payload: CreateUserBody): CreateUserResult {
    const existed = accessDataStore.users.some(
      (item) => item.username === payload.username
    );
    if (existed) {
      return { success: false, reason: "username_exists" };
    }

    const roleIdsValid = payload.roleIds.every((roleId) =>
      accessDataStore.roles.some((role) => role.roleId === roleId)
    );
    if (!roleIdsValid) {
      return { success: false, reason: "role_not_found" };
    }

    const nextId =
      accessDataStore.users.reduce(
        (maxUserId, item) => Math.max(maxUserId, item.userId),
        0
      ) + 1;

    accessDataStore.users.push({
      userId: nextId,
      username: payload.username,
      nickName: payload.nickName,
      password: payload.password,
      status: payload.status,
      roleIds: payload.roleIds,
    });

    return { success: true, userId: nextId };
  }

  update(payload: UpdateUserBody): UpdateUserResult {
    const target = accessDataStore.users.find((item) => item.userId === payload.userId);
    if (!target) {
      return { success: false, reason: "user_not_found" };
    }

    const roleIdsValid = payload.roleIds.every((roleId) =>
      accessDataStore.roles.some((role) => role.roleId === roleId)
    );
    if (!roleIdsValid) {
      return { success: false, reason: "role_not_found" };
    }

    target.nickName = payload.nickName;
    target.status = payload.status;
    target.roleIds = payload.roleIds;

    return { success: true };
  }

  resetPassword(payload: ResetPasswordBody): ResetPasswordResult {
    const target = accessDataStore.users.find((item) => item.userId === payload.userId);
    if (!target) {
      return { success: false, reason: "user_not_found" };
    }

    target.password = payload.password;
    return { success: true };
  }
}

export const userService = new UserService();
