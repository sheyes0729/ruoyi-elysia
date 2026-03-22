import type {
  CreateUserBody,
  ListUserQuery,
  ResetPasswordBody,
  UpdateUserBody,
  UserImportRow,
  UserListItem,
} from "./model";
import type { ImportResult } from "../../../common/http/csv";
import { userRepository, roleRepository } from "../../../repository";
import { getDataScopeByUserId } from "../../../repository/data-scope";

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
  async list(
    query?: ListUserQuery,
    currentUserId?: number,
  ): Promise<UserListItem[]> {
    const users = await userRepository.findAll();

    const source = users.map((item) => ({
      userId: item.userId,
      username: item.username,
      nickName: item.nickName,
      status: item.status,
      roleIds: item.roleIds,
      deptId: item.deptId,
    }));

    let filtered = source;

    if (query) {
      filtered = filtered.filter((item) => {
        if (query.username && !item.username.includes(query.username)) {
          return false;
        }

        if (query.status && item.status !== query.status) {
          return false;
        }

        return true;
      });
    }

    if (currentUserId) {
      const dataScope = await getDataScopeByUserId(currentUserId);

      if (!dataScope.allData) {
        filtered = filtered.filter((item) => {
          if (item.userId === currentUserId) {
            return true;
          }

          if (dataScope.deptIds.length === 0) {
            return false;
          }

          return (
            item.deptId !== undefined && dataScope.deptIds.includes(item.deptId)
          );
        });
      }
    }

    return filtered;
  }

  async removeBatch(ids: number[]): Promise<number> {
    return userRepository.deleteBatch(ids);
  }

  async create(payload: CreateUserBody): Promise<CreateUserResult> {
    const existed = await userRepository.findByUsername(payload.username);
    if (existed) {
      return { success: false, reason: "username_exists" };
    }

    const roles = await roleRepository.findAll();
    const roleIdsValid = payload.roleIds.every((roleId) =>
      roles.some((role) => role.roleId === roleId),
    );
    if (!roleIdsValid) {
      return { success: false, reason: "role_not_found" };
    }

    const userId = await userRepository.create({
      username: payload.username,
      nickName: payload.nickName,
      password: payload.password,
      status: payload.status,
      roleIds: payload.roleIds,
    });

    return { success: true, userId };
  }

  async update(payload: UpdateUserBody): Promise<UpdateUserResult> {
    const target = await userRepository.findById(payload.userId);
    if (!target) {
      return { success: false, reason: "user_not_found" };
    }

    const roles = await roleRepository.findAll();
    const roleIdsValid = payload.roleIds.every((roleId) =>
      roles.some((role) => role.roleId === roleId),
    );
    if (!roleIdsValid) {
      return { success: false, reason: "role_not_found" };
    }

    await userRepository.update(payload.userId, {
      nickName: payload.nickName,
      status: payload.status,
      roleIds: payload.roleIds,
    });

    return { success: true };
  }

  async resetPassword(
    payload: ResetPasswordBody,
  ): Promise<ResetPasswordResult> {
    const target = await userRepository.findById(payload.userId);
    if (!target) {
      return { success: false, reason: "user_not_found" };
    }

    await userRepository.update(payload.userId, {
      password: payload.password,
    });

    return { success: true };
  }

  async importUsers(rows: Record<string, string>[]): Promise<ImportUserResult> {
    const success: UserImportRow[] = [];
    const failures: {
      row: number;
      data: Record<string, string>;
      error: string;
    }[] = [];

    const roles = await roleRepository.findAll();

    for (const row of rows) {
      const rowNum = rows.indexOf(row) + 2;

      const username = row["用户名"].trim();
      const nickName = row["昵称"].trim();
      const password = row["密码"].trim();
      const roleIdsStr = row["角色ID列表"].trim();
      const status = row["状态"].trim();

      if (!username) {
        failures.push({ row: rowNum, data: row, error: "用户名为空" });
        continue;
      }

      if (username.length < 2 || username.length > 30) {
        failures.push({
          row: rowNum,
          data: row,
          error: "用户名长度需在2-30之间",
        });
        continue;
      }

      if (!nickName) {
        failures.push({ row: rowNum, data: row, error: "昵称为空" });
        continue;
      }

      if (!password || password.length < 6 || password.length > 64) {
        failures.push({
          row: rowNum,
          data: row,
          error: "密码长度需在6-64之间",
        });
        continue;
      }

      if (!roleIdsStr) {
        failures.push({ row: rowNum, data: row, error: "角色ID列表为空" });
        continue;
      }

      const roleIds = roleIdsStr
        .split(",")
        .map((id) => parseInt(id.trim(), 10));
      if (roleIds.some(isNaN)) {
        failures.push({ row: rowNum, data: row, error: "角色ID列表格式错误" });
        continue;
      }

      const roleIdsValid = roleIds.every((roleId) =>
        roles.some((role) => role.roleId === roleId),
      );
      if (!roleIdsValid) {
        failures.push({ row: rowNum, data: row, error: "角色不存在" });
        continue;
      }

      if (!status || !["0", "1"].includes(status)) {
        failures.push({ row: rowNum, data: row, error: "状态必须为0或1" });
        continue;
      }

      const existed = await userRepository.findByUsername(username);
      if (existed) {
        failures.push({ row: rowNum, data: row, error: "用户名已存在" });
        continue;
      }

      await userRepository.create({
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
    }

    return { success, failures };
  }
}

export const userService = new UserService();
