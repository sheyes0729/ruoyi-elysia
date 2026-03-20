import { eq } from "drizzle-orm";
import type { SystemRole } from "../../modules/system/access-data";
import { sys_role } from "../../database/schema";
import { db } from "../../database";
import type { Repository } from "../base";

export interface RoleRepository extends Repository<SystemRole, number> {
  findByRoleKey(roleKey: string): Promise<SystemRole | null>;
}

export class DrizzleRoleRepository implements RoleRepository {
  private readonly table = sys_role;

  private toEntity(row: typeof sys_role.$inferSelect): SystemRole {
    return {
      roleId: row.roleId,
      roleKey: row.roleKey,
      roleName: row.roleName,
      status: row.status as "0" | "1",
      menuIds: row.menuIds ? (JSON.parse(row.menuIds) as number[]) : [],
      permissions: row.permissions
        ? (JSON.parse(row.permissions) as string[])
        : [],
    };
  }

  private readonly pkColumn = sys_role.roleId;

  async findAll(): Promise<SystemRole[]> {
    const result = await db.select().from(sys_role);
    return result.map((row) => this.toEntity(row));
  }

  async findById(roleId: number): Promise<SystemRole | null> {
    const result = await db
      .select()
      .from(sys_role)
      .where(eq(sys_role.roleId, roleId));
    return result.length > 0 ? this.toEntity(result[0]) : null;
  }

  async findByRoleKey(roleKey: string): Promise<SystemRole | null> {
    const result = await db
      .select()
      .from(sys_role)
      .where(eq(sys_role.roleKey, roleKey));
    return result.length > 0 ? this.toEntity(result[0]) : null;
  }

  async create(data: Partial<SystemRole>): Promise<number> {
    const result = await db.insert(sys_role).values({
      roleKey: data.roleKey,
      roleName: data.roleName,
      status: data.status,
      menuIds: data.menuIds ? JSON.stringify(data.menuIds) : null,
      permissions: data.permissions ? JSON.stringify(data.permissions) : null,
    } as typeof sys_role.$inferInsert);
    return result[0].insertId;
  }

  async update(roleId: number, data: Partial<SystemRole>): Promise<boolean> {
    const result = await db
      .update(sys_role)
      .set({
        roleName: data.roleName,
        status: data.status,
        menuIds: data.menuIds ? JSON.stringify(data.menuIds) : undefined,
        permissions: data.permissions
          ? JSON.stringify(data.permissions)
          : undefined,
      } as typeof sys_role.$inferInsert)
      .where(eq(sys_role.roleId, roleId));
    return result.length > 0;
  }

  async delete(roleId: number): Promise<boolean> {
    const result = await db.delete(sys_role).where(eq(sys_role.roleId, roleId));
    return result.length > 0;
  }

  async deleteBatch(roleIds: number[]): Promise<number> {
    const result = await db
      .delete(sys_role)
      .where(eq(sys_role.roleId, roleIds[0]));
    return result.length;
  }
}

export const roleRepository = new DrizzleRoleRepository();
