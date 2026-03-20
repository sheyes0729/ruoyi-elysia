import { eq } from "drizzle-orm";
import type { SystemDictData } from "../../modules/system/access-data";
import { sys_dict_data } from "../../database/schema";
import { db } from "../../database";
import type { Repository } from "../base";

export interface DictDataRepository extends Repository<SystemDictData, number> {
  findByDictType(dictType: string): Promise<SystemDictData[]>;
}

export class DrizzleDictDataRepository implements DictDataRepository {
  private readonly table = sys_dict_data;

  private toEntity(row: typeof sys_dict_data.$inferSelect): SystemDictData {
    return {
      dictCode: row.dictCode,
      dictSort: row.dictSort,
      dictLabel: row.dictLabel,
      dictValue: row.dictValue,
      dictType: row.dictType,
      status: row.status as "0" | "1",
    };
  }

  private readonly pkColumn = sys_dict_data.dictCode;

  async findAll(): Promise<SystemDictData[]> {
    const result = await db.select().from(sys_dict_data);
    return result.map((row) => this.toEntity(row));
  }

  async findById(dictCode: number): Promise<SystemDictData | null> {
    const result = await db
      .select()
      .from(sys_dict_data)
      .where(eq(sys_dict_data.dictCode, dictCode));
    return result.length > 0 ? this.toEntity(result[0]) : null;
  }

  async findByDictType(dictType: string): Promise<SystemDictData[]> {
    const result = await db
      .select()
      .from(sys_dict_data)
      .where(eq(sys_dict_data.dictType, dictType));
    return result.map((row) => this.toEntity(row));
  }

  async create(data: Partial<SystemDictData>): Promise<number> {
    const result = await db.insert(sys_dict_data).values({
      dictSort: data.dictSort,
      dictLabel: data.dictLabel,
      dictValue: data.dictValue,
      dictType: data.dictType,
      status: data.status,
    } as typeof sys_dict_data.$inferInsert);
    return result[0].insertId;
  }

  async update(
    dictCode: number,
    data: Partial<SystemDictData>,
  ): Promise<boolean> {
    const result = await db
      .update(sys_dict_data)
      .set(data as typeof sys_dict_data.$inferInsert)
      .where(eq(sys_dict_data.dictCode, dictCode));
    return result.length > 0;
  }

  async delete(dictCode: number): Promise<boolean> {
    const result = await db
      .delete(sys_dict_data)
      .where(eq(sys_dict_data.dictCode, dictCode));
    return result.length > 0;
  }

  async deleteBatch(dictCodes: number[]): Promise<number> {
    const result = await db
      .delete(sys_dict_data)
      .where(eq(sys_dict_data.dictCode, dictCodes[0]));
    return result.length;
  }
}

export const dictDataRepository = new DrizzleDictDataRepository();
