import { eq, and, like, gte, lte, desc } from "drizzle-orm";
import { sys_oper_log } from "../../database/schema";
import { db } from "../../database";
import type { OperBusinessType } from "../../modules/monitor/oper-log/business-type";

export interface OperLogRecord {
  operId: number;
  title: string;
  businessType: OperBusinessType;
  operName: string;
  method: string;
  requestMethod: string;
  operUrl: string;
  status: "0" | "1";
  operTime: string;
}

export interface ListOperLogQuery {
  pageNum?: number;
  pageSize?: number;
  operName?: string;
  status?: "0" | "1";
  businessType?: OperBusinessType;
  beginTime?: string;
  endTime?: string;
}

export class DrizzleOperLogRepository {
  private readonly table = sys_oper_log;

  private toEntity(row: typeof sys_oper_log.$inferSelect): OperLogRecord {
    return {
      operId: row.operId,
      title: row.title,
      businessType: row.businessType as OperBusinessType,
      operName: row.operName ?? "",
      method: row.method ?? "",
      requestMethod: row.requestMethod ?? "",
      operUrl: row.operUrl ?? "",
      status: row.status as "0" | "1",
      operTime: row.operTime ? row.operTime.toISOString() : "",
    };
  }

  async create(data: {
    title: string;
    businessType: OperBusinessType;
    method?: string;
    requestMethod?: string;
    operName?: string;
    operUrl?: string;
    status: "0" | "1";
    errorMsg?: string;
  }): Promise<number> {
    const result = await db.insert(sys_oper_log).values({
      title: data.title,
      businessType: data.businessType,
      method: data.method,
      requestMethod: data.requestMethod,
      operName: data.operName,
      operUrl: data.operUrl,
      status: data.status,
      errorMsg: data.errorMsg,
    });
    return result[0].insertId;
  }

  async findAll(query?: ListOperLogQuery): Promise<OperLogRecord[]> {
    const conditions = [];

    if (query?.operName) {
      conditions.push(like(sys_oper_log.operName, `%${query.operName}%`));
    }

    if (query?.status) {
      conditions.push(eq(sys_oper_log.status, query.status));
    }

    if (query?.businessType) {
      conditions.push(eq(sys_oper_log.businessType, query.businessType));
    }

    if (query?.beginTime) {
      conditions.push(gte(sys_oper_log.operTime, new Date(query.beginTime)));
    }

    if (query?.endTime) {
      conditions.push(lte(sys_oper_log.operTime, new Date(query.endTime)));
    }

    const result = await db
      .select()
      .from(sys_oper_log)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(sys_oper_log.operTime))
      .limit(query?.pageSize ?? 100)
      .offset(((query?.pageNum ?? 1) - 1) * (query?.pageSize ?? 100));

    return result.map((row) => this.toEntity(row));
  }

  async count(query?: ListOperLogQuery): Promise<number> {
    const conditions = [];

    if (query?.operName) {
      conditions.push(like(sys_oper_log.operName, `%${query.operName}%`));
    }

    if (query?.status) {
      conditions.push(eq(sys_oper_log.status, query.status));
    }

    if (query?.businessType) {
      conditions.push(eq(sys_oper_log.businessType, query.businessType));
    }

    if (query?.beginTime) {
      conditions.push(gte(sys_oper_log.operTime, new Date(query.beginTime)));
    }

    if (query?.endTime) {
      conditions.push(lte(sys_oper_log.operTime, new Date(query.endTime)));
    }

    const result = await db
      .select()
      .from(sys_oper_log)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result.length;
  }

  async clear(): Promise<number> {
    const result = await db.delete(sys_oper_log);
    return result.length;
  }
}

export const operLogRepository = new DrizzleOperLogRepository();
