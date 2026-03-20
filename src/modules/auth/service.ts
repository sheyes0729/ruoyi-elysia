import { eq } from "drizzle-orm";
import type { LoginBody, AuthUser } from "./model";
import { db } from "../../database";
import { sys_user, sys_user_role, sys_role } from "../../database/schema";

export class AuthService {
  async login(payload: LoginBody): Promise<AuthUser | null> {
    const users = await db
      .select()
      .from(sys_user)
      .where(eq(sys_user.username, payload.username));

    const user = users[0];
    if (!user || user.password !== payload.password || user.status !== "0") {
      return null;
    }

    return this.buildAuthUser(user.userId, user.username, user.nickName);
  }

  async getProfile(userId: number): Promise<AuthUser | null> {
    const users = await db
      .select()
      .from(sys_user)
      .where(eq(sys_user.userId, userId));

    const user = users[0];
    if (!user || user.status !== "0") {
      return null;
    }

    return this.buildAuthUser(user.userId, user.username, user.nickName);
  }

  private async buildAuthUser(
    userId: number,
    username: string,
    nickName: string,
  ): Promise<AuthUser> {
    const userRoles = await db
      .select()
      .from(sys_user_role)
      .where(eq(sys_user_role.userId, userId));

    if (userRoles.length === 0) {
      return {
        userId,
        username,
        nickName,
        roles: [],
        permissions: [],
      };
    }

    const roleIds = userRoles.map((ur) => ur.roleId);
    const roles = await db
      .select()
      .from(sys_role)
      .where(eq(sys_role.roleId, roleIds[0]));

    const role = roles[0];
    if (!role) {
      return {
        userId,
        username,
        nickName,
        roles: [],
        permissions: [],
      };
    }

    return {
      userId,
      username,
      nickName,
      roles: [role.roleKey],
      permissions: role.permissions
        ? (JSON.parse(role.permissions) as string[])
        : [],
    };
  }
}

export const authService = new AuthService();
