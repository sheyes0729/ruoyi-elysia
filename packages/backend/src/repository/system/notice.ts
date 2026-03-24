import { eq } from "drizzle-orm";
import type { SystemNotice } from "../../modules/system/types";
import { sys_notice } from "../../database/schema";
import { db } from "../../database";
import type { Repository } from "../base";

export class DrizzleNoticeRepository implements Repository<
  SystemNotice,
  number
> {
  private toEntity(row: typeof sys_notice.$inferSelect): SystemNotice {
    return {
      noticeId: row.noticeId,
      noticeTitle: row.noticeTitle,
      noticeType: row.noticeType as "1" | "2",
      status: row.status as "0" | "1",
      createTime: row.createTime?.toISOString() ?? new Date().toISOString(),
    };
  }

  async findAll(): Promise<SystemNotice[]> {
    const result = await db.select().from(sys_notice);
    return result.map((row) => this.toEntity(row));
  }

  async findById(noticeId: number): Promise<SystemNotice | null> {
    const result = await db
      .select()
      .from(sys_notice)
      .where(eq(sys_notice.noticeId, noticeId));
    return result.length > 0 ? this.toEntity(result[0]) : null;
  }

  async create(data: Partial<SystemNotice>): Promise<number> {
    const result = await db.insert(sys_notice).values({
      noticeTitle: data.noticeTitle,
      noticeType: data.noticeType,
      status: data.status,
    } as typeof sys_notice.$inferInsert);
    return result[0].insertId;
  }

  async update(
    noticeId: number,
    data: Partial<SystemNotice>,
  ): Promise<boolean> {
    const result = await db
      .update(sys_notice)
      .set(data as typeof sys_notice.$inferInsert)
      .where(eq(sys_notice.noticeId, noticeId));
    return (result as unknown as { affectedRows: number }).affectedRows > 0;
  }

  async delete(noticeId: number): Promise<boolean> {
    const result = await db
      .delete(sys_notice)
      .where(eq(sys_notice.noticeId, noticeId));
    return (result as unknown as { affectedRows: number }).affectedRows > 0;
  }

  async deleteBatch(noticeIds: number[]): Promise<number> {
    const result = await db
      .delete(sys_notice)
      .where(eq(sys_notice.noticeId, noticeIds[0]));
    return (result as unknown as { affectedRows: number }).affectedRows;
  }
}

export const noticeRepository = new DrizzleNoticeRepository();
