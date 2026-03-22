import { eq } from "drizzle-orm";
import type { SystemDictType } from "../../modules/system/types";
import { sys_dict_type } from "../../database/schema";
import { db } from "../../database";
import type { Repository } from "../base";

export interface DictTypeRepository extends Repository<SystemDictType, number> {
  findByDictType(dictType: string): Promise<SystemDictType | null>;
}

export class DrizzleDictTypeRepository implements DictTypeRepository {
  private readonly table = sys_dict_type;

  private toEntity(row: typeof sys_dict_type.$inferSelect): SystemDictType {
    return {
      dictId: row.dictId,
      dictName: row.dictName,
      dictType: row.dictType,
      status: row.status as "0" | "1",
    };
  }

  private readonly pkColumn = sys_dict_type.dictId;

  async findAll(): Promise<SystemDictType[]> {
    const result = await db.select().from(sys_dict_type);
    return result.map((row) => this.toEntity(row));
  }

  async findById(dictId: number): Promise<SystemDictType | null> {
    const result = await db
      .select()
      .from(sys_dict_type)
      .where(eq(sys_dict_type.dictId, dictId));
    return result.length > 0 ? this.toEntity(result[0]) : null;
  }

  async findByDictType(dictType: string): Promise<SystemDictType | null> {
    const result = await db
      .select()
      .from(sys_dict_type)
      .where(eq(sys_dict_type.dictType, dictType));
    return result.length > 0 ? this.toEntity(result[0]) : null;
  }

  async create(data: Partial<SystemDictType>): Promise<number> {
    const result = await db.insert(sys_dict_type).values({
      dictName: data.dictName,
      dictType: data.dictType,
      status: data.status,
    } as typeof sys_dict_type.$inferInsert);
    return result[0].insertId;
  }

  async update(
    dictId: number,
    data: Partial<SystemDictType>,
  ): Promise<boolean> {
    const result = await db
      .update(sys_dict_type)
      .set(data as typeof sys_dict_type.$inferInsert)
      .where(eq(sys_dict_type.dictId, dictId));
    return (result as unknown as { affectedRows: number }).affectedRows > 0;
  }

  async delete(dictId: number): Promise<boolean> {
    const result = await db
      .delete(sys_dict_type)
      .where(eq(sys_dict_type.dictId, dictId));
    return (result as unknown as { affectedRows: number }).affectedRows > 0;
  }

  async deleteBatch(dictIds: number[]): Promise<number> {
    const result = await db
      .delete(sys_dict_type)
      .where(eq(sys_dict_type.dictId, dictIds[0]));
    return (result as unknown as { affectedRows: number }).affectedRows;
  }
}

export const dictTypeRepository = new DrizzleDictTypeRepository();
