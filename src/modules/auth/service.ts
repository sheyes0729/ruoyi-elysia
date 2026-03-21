import { eq, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { LoginBody, AuthUser } from "./model";
import { db } from "../../database";
import { sys_user, sys_user_role, sys_role } from "../../database/schema";

export class AuthService {
  async login(payload: LoginBody): Promise<AuthUser | null> {
    const users = await db
      .select()
      .from(sys_user)
      .where(eq(sys_user.username, payload.username));

    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    const passwordValid = await bcrypt.compare(payload.password, user.password);
    if (!passwordValid || user.status !== "0") {
      return null;
    }

    return this.buildAuthUser(user.userId, user.username, user.nickName);
  }

  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async getProfile(userId: number): Promise<AuthUser | null> {
    const users = await db
      .select()
      .from(sys_user)
      .where(eq(sys_user.userId, userId));

    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    if (user.status !== "0") {
      return null;
    }

    return this.buildAuthUser(user.userId, user.username, user.nickName);
  }

  async getUserById(
    userId: number,
  ): Promise<{ username: string; password: string; status: string } | null> {
    const users = await db
      .select()
      .from(sys_user)
      .where(eq(sys_user.userId, userId));

    if (users.length === 0) {
      return null;
    }

    const user = users[0];
    return {
      username: user.username,
      password: user.password,
      status: user.status,
    };
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
      .where(inArray(sys_role.roleId, roleIds));

    if (roles.length === 0) {
      return {
        userId,
        username,
        nickName,
        roles: [],
        permissions: [],
      };
    }

    const allPermissions: string[] = [];
    for (const role of roles) {
      if (role.permissions) {
        const perms = JSON.parse(role.permissions) as string[];
        allPermissions.push(...perms);
      }
    }

    const uniquePermissions = [...new Set(allPermissions)];

    return {
      userId,
      username,
      nickName,
      roles: roles.map((r) => r.roleKey),
      permissions: uniquePermissions,
    };
  }
}

export const authService = new AuthService();
