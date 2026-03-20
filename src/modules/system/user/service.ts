import { removeBatchByNumericId } from "../../../common/data/array";
import { accessDataStore } from "../access-data";
import type {
  CreateUserBody,
  ListUserQuery,
  ResetPasswordBody,
  UpdateUserBody,
  UserImportRow,
  UserListItem,
} from "./model";
import type { ImportResult } from "../../../common/http/csv";

type CreateUserResult =
  | { success: true; userId: number }
  | { success: false; reason: "username_exists" | "role_not_found" };

type UpdateUserResult =
  | { success: true }
  | { success: false; reason: "user_not_found" | "role_not_found" };

type ResetPasswordResult =
  | { success: true }
  | { success: false; reason: "user_not_found" };

type ImportUserResult = ImportResult<UserImportRow>;

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

  importUsers(rows: Record<string, string>[]): ImportUserResult {
    const success: UserImportRow[] = [];
    const failures: { row: number; data: Record<string, string>; error: string }[] = [];

    rows.forEach((row, index) => {
      const rowNum = index + 2;

      const username = row["用户名"]?.trim();
      const nickName = row["昵称"]?.trim();
      const password = row["密码"]?.trim();
      const roleIdsStr = row["角色ID列表"]?.trim();
      const status = row["状态"]?.trim();

      if (!username) {
        failures.push({ row: rowNum, data: row, error: "用户名为空" });
        return;
      }

      if (username.length < 2 || username.length > 30) {
        failures.push({ row: rowNum, data: row, error: "用户名长度需在2-30之间" });
        return;
      }

      if (!nickName) {
        failures.push({ row: rowNum, data: row, error: "昵称为空" });
        return;
      }

      if (!password || password.length < 6 || password.length > 64) {
        failures.push({ row: rowNum, data: row, error: "密码长度需在6-64之间" });
        return;
      }

      if (!roleIdsStr) {
        failures.push({ row: rowNum, data: row, error: "角色ID列表为空" });
        return;
      }

      const roleIds = roleIdsStr.split(",").map((id) => parseInt(id.trim(), 10));
      if (roleIds.some(isNaN)) {
        failures.push({ row: rowNum, data: row, error: "角色ID列表格式错误" });
        return;
      }

      const roleIdsValid = roleIds.every((roleId) =>
        accessDataStore.roles.some((role) => role.roleId === roleId)
      );
      if (!roleIdsValid) {
        failures.push({ row: rowNum, data: row, error: "角色不存在" });
        return;
      }

      if (!status || !["0", "1"].includes(status)) {
        failures.push({ row: rowNum, data: row, error: "状态必须为0或1" });
        return;
      }

      const existed = accessDataStore.users.some((item) => item.username === username);
      if (existed) {
        failures.push({ row: rowNum, data: row, error: "用户名已存在" });
        return;
      }

      const nextId =
        accessDataStore.users.reduce(
          (maxUserId, item) => Math.max(maxUserId, item.userId),
          0
        ) + 1;

      accessDataStore.users.push({
        userId: nextId,
        username,
        nickName,
        password,
        status: status as "0" | "1",
        roleIds,
      });

      success.push({
        用户名: username,
        昵称: nickName,
        密码: password,
        角色ID列表: roleIdsStr,
        状态: status,
      });
    });

    return { success, failures };
  }
}

export const userService = new UserService();
