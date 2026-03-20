import { eq } from "drizzle-orm";
import type { SystemDept } from "../../modules/system/access-data";
import { sys_dept } from "../../database/schema";
import { db } from "../../database";
import type { Repository } from "../base";

export interface DeptRepository extends Repository<SystemDept, number> {
  findByParentId(parentId: number): Promise<SystemDept[]>;
}

export class DrizzleDeptRepository implements DeptRepository {
  private readonly table = sys_dept;

  private toEntity(row: typeof sys_dept.$inferSelect): SystemDept {
    return {
      deptId: row.deptId,
      deptName: row.deptName,
      parentId: row.parentId,
      orderNum: row.orderNum,
      status: row.status as "0" | "1",
    };
  }

  private readonly pkColumn = sys_dept.deptId;

  async findAll(): Promise<SystemDept[]> {
    const result = await db.select().from(sys_dept);
    return result.map((row) => this.toEntity(row));
  }

  async findById(deptId: number): Promise<SystemDept | null> {
    const result = await db
      .select()
      .from(sys_dept)
      .where(eq(sys_dept.deptId, deptId));
    return result.length > 0 ? this.toEntity(result[0]) : null;
  }

  async findByParentId(parentId: number): Promise<SystemDept[]> {
    const result = await db
      .select()
      .from(sys_dept)
      .where(eq(sys_dept.parentId, parentId));
    return result.map((row) => this.toEntity(row));
  }

  async create(data: Partial<SystemDept>): Promise<number> {
    const result = await db.insert(sys_dept).values({
      deptName: data.deptName,
      parentId: data.parentId,
      orderNum: data.orderNum,
      status: data.status,
    } as typeof sys_dept.$inferInsert);
    return result[0].insertId;
  }

  async update(deptId: number, data: Partial<SystemDept>): Promise<boolean> {
    const result = await db
      .update(sys_dept)
      .set(data as typeof sys_dept.$inferInsert)
      .where(eq(sys_dept.deptId, deptId));
    return result.length > 0;
  }

  async delete(deptId: number): Promise<boolean> {
    const result = await db.delete(sys_dept).where(eq(sys_dept.deptId, deptId));
    return result.length > 0;
  }

  async deleteBatch(deptIds: number[]): Promise<number> {
    const result = await db
      .delete(sys_dept)
      .where(eq(sys_dept.deptId, deptIds[0]));
    return result.length;
  }
}

export const deptRepository = new DrizzleDeptRepository();
