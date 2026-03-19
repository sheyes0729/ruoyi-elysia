import type { LoginBody } from "./model";
import type { AuthUser } from "./model";
import { accessDataStore } from "../system/access-data";

const buildAuthUser = (userId: number): AuthUser | null => {
  const user = accessDataStore.users.find(
    (item) => item.userId === userId && item.status === "0"
  );

  if (!user) {
    return null;
  }

  const roles = accessDataStore.roles.filter((role) =>
    user.roleIds.includes(role.roleId)
  );

  return {
    userId: user.userId,
    username: user.username,
    nickName: user.nickName,
    roles: roles.map((item) => item.roleKey),
    permissions: roles.flatMap((item) => item.permissions),
  };
};

export class AuthService {
  login(payload: LoginBody): AuthUser | null {
    const user = accessDataStore.users.find(
      (item) =>
        item.username === payload.username &&
        item.password === payload.password &&
        item.status === "0"
    );

    if (!user) {
      return null;
    }

    return buildAuthUser(user.userId);
  }

  getProfile(userId: number): AuthUser | null {
    return buildAuthUser(userId);
  }
}

export const authService = new AuthService();
