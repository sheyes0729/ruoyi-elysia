import { eq } from "drizzle-orm";
import type { SystemMenu } from "../../modules/system/access-data";
import { sys_menu } from "../../database/schema";
import { db } from "../../database";
import type { Repository } from "../base";

export interface MenuRepository extends Repository<SystemMenu, number> {
  findByParentId(parentId: number): Promise<SystemMenu[]>;
}

export class DrizzleMenuRepository implements MenuRepository {
  private readonly table = sys_menu;

  private toEntity(row: typeof sys_menu.$inferSelect): SystemMenu {
    return {
      menuId: row.menuId,
      menuName: row.menuName,
      parentId: row.parentId,
      orderNum: row.orderNum,
      path: row.path,
      component: row.component ?? "",
      menuType: row.menuType as "M" | "C" | "F",
      perms: row.perms ?? "",
      visible: row.visible as "0" | "1",
      status: row.status as "0" | "1",
    };
  }

  private readonly pkColumn = sys_menu.menuId;

  async findAll(): Promise<SystemMenu[]> {
    const result = await db.select().from(sys_menu);
    return result.map((row) => this.toEntity(row));
  }

  async findById(menuId: number): Promise<SystemMenu | null> {
    const result = await db
      .select()
      .from(sys_menu)
      .where(eq(sys_menu.menuId, menuId));
    return result.length > 0 ? this.toEntity(result[0]) : null;
  }

  async findByParentId(parentId: number): Promise<SystemMenu[]> {
    const result = await db
      .select()
      .from(sys_menu)
      .where(eq(sys_menu.parentId, parentId));
    return result.map((row) => this.toEntity(row));
  }

  async create(data: Partial<SystemMenu>): Promise<number> {
    const result = await db.insert(sys_menu).values({
      menuName: data.menuName,
      parentId: data.parentId,
      orderNum: data.orderNum,
      path: data.path,
      component: data.component,
      menuType: data.menuType,
      perms: data.perms,
      visible: data.visible,
      status: data.status,
    } as typeof sys_menu.$inferInsert);
    return result[0].insertId;
  }

  async update(menuId: number, data: Partial<SystemMenu>): Promise<boolean> {
    const result = await db
      .update(sys_menu)
      .set(data as typeof sys_menu.$inferInsert)
      .where(eq(sys_menu.menuId, menuId));
    return result.length > 0;
  }

  async delete(menuId: number): Promise<boolean> {
    const result = await db.delete(sys_menu).where(eq(sys_menu.menuId, menuId));
    return result.length > 0;
  }

  async deleteBatch(menuIds: number[]): Promise<number> {
    const result = await db
      .delete(sys_menu)
      .where(eq(sys_menu.menuId, menuIds[0]));
    return result.length;
  }
}

export const menuRepository = new DrizzleMenuRepository();
