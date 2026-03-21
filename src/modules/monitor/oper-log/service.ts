import { operLogRepository } from "../../../repository/monitor/oper-log";
import type { OperBusinessType } from "./business-type";
import type { ListOperLogQuery } from "./model";
import type { OperLogRecord } from "../../../repository/monitor/oper-log";

type RecordOperLogInput = {
  title: string;
  businessType?: OperBusinessType;
  operName: string;
  method: string;
  requestMethod: string;
  operUrl: string;
  status: "0" | "1";
};

export class OperLogService {
  async record(input: RecordOperLogInput): Promise<void> {
    await operLogRepository.create({
      title: input.title,
      businessType: input.businessType ?? "OTHER",
      method: input.method,
      requestMethod: input.requestMethod,
      operName: input.operName,
      operUrl: input.operUrl,
      status: input.status,
    });
  }

  async list(query?: ListOperLogQuery): Promise<OperLogRecord[]> {
    return operLogRepository.findAll(query);
  }

  async count(query?: ListOperLogQuery): Promise<number> {
    return operLogRepository.count(query);
  }

  async clear(): Promise<number> {
    return operLogRepository.clear();
  }
}

export const operLogService = new OperLogService();
