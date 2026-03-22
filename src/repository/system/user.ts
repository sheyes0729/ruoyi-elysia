import { eq, inArray } from "drizzle-orm";
import type { SystemUser } from "../../modules/system/types";
import { sys_user, sys_user_role } from "../../database/schema";
import { db } from "../../database";
import type { Repository } from "../base";

export interface UserRepository extends Repository<SystemUser, number> {
  findByUsername(username: string): Promise<SystemUser | null>;
  findByRoleId(roleId: number): Promise<SystemUser[]>;
  findByDeptIds(deptIds: number[]): Promise<SystemUser[]>;
}

export class DrizzleUserRepository implements UserRepository {
  private readonly table = sys_user;

  private toEntity(row: typeof sys_user.$inferSelect): SystemUser {
    return {
      userId: row.userId,
      username: row.username,
      nickName: row.nickName,
      password: row.password,
      status: row.status as "0" | "1",
      roleIds: [],
      deptId: row.deptId ?? undefined,
    };
  }

  private readonly pkColumn = sys_user.userId;

  async findAll(): Promise<SystemUser[]> {
    const result = await db.select().from(sys_user);
    return result.map((row) => this.toEntity(row));
  }

  async findById(userId: number): Promise<SystemUser | null> {
    const result = await db
      .select()
      .from(sys_user)
      .where(eq(sys_user.userId, userId));
    return result.length > 0 ? this.toEntity(result[0]) : null;
  }

  async findByUsername(username: string): Promise<SystemUser | null> {
    const result = await db
      .select()
      .from(sys_user)
      .where(eq(sys_user.username, username));
    return result.length > 0 ? this.toEntity(result[0]) : null;
  }

  async findByRoleId(roleId: number): Promise<SystemUser[]> {
    const userRoleResult = await db
      .select()
      .from(sys_user_role)
      .where(eq(sys_user_role.roleId, roleId));

    if (userRoleResult.length === 0) {
      return [];
    }

    const userIds = userRoleResult.map((ur) => ur.userId);
    const result = await db
      .select()
      .from(sys_user)
      .where(inArray(sys_user.userId, userIds));

    return result.map((row) => this.toEntity(row));
  }

  async findByDeptIds(deptIds: number[]): Promise<SystemUser[]> {
    if (deptIds.length === 0) {
      return [];
    }
    const result = await db
      .select()
      .from(sys_user)
      .where(inArray(sys_user.deptId, deptIds));
    return result.map((row) => this.toEntity(row));
  }

  async create(data: Partial<SystemUser>): Promise<number> {
    const result = await db.insert(sys_user).values({
      username: data.username,
      nickName: data.nickName,
      password: data.password,
      status: data.status,
      deptId: data.deptId,
    } as typeof sys_user.$inferInsert);
    return result[0].insertId;
  }

  async update(userId: number, data: Partial<SystemUser>): Promise<boolean> {
    const result = await db
      .update(sys_user)
      .set({
        nickName: data.nickName,
        status: data.status,
        deptId: data.deptId,
      } as typeof sys_user.$inferInsert)
      .where(eq(sys_user.userId, userId));
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return result.length > 0;
  }

  async delete(userId: number): Promise<boolean> {
    const result = await db.delete(sys_user).where(eq(sys_user.userId, userId));
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return result.length > 0;
  }

  async deleteBatch(userIds: number[]): Promise<number> {
    const result = await db
      .delete(sys_user)
      .where(inArray(sys_user.userId, userIds));
    return result.length;
  }
}

export const userRepository = new DrizzleUserRepository();
