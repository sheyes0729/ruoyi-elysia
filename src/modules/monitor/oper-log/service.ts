import { monitorStore } from "../store";
import type { OperBusinessType } from "./business-type";
import type { ListOperLogQuery } from "./model";

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
  record(input: RecordOperLogInput): void {
    monitorStore.operLogs.unshift({
      operId: monitorStore.nextOperLogId(),
      title: input.title,
      businessType: input.businessType ?? "OTHER",
      operName: input.operName,
      method: input.method,
      requestMethod: input.requestMethod,
      operUrl: input.operUrl,
      status: input.status,
      operTime: new Date().toISOString(),
    });
  }

  list(query?: ListOperLogQuery) {
    const source = [...monitorStore.operLogs];
    if (!query) {
      return source;
    }

    return source.filter((item) => {
      if (query.operName && !item.operName.includes(query.operName)) {
        return false;
      }

      if (query.status && item.status !== query.status) {
        return false;
      }

      if (query.businessType && item.businessType !== query.businessType) {
        return false;
      }

      if (query.beginTime && item.operTime < query.beginTime) {
        return false;
      }

      if (query.endTime && item.operTime > query.endTime) {
        return false;
      }

      return true;
    });
  }

  clear(): number {
    const count = monitorStore.operLogs.length;
    monitorStore.operLogs.splice(0, monitorStore.operLogs.length);
    return count;
  }
}

export const operLogService = new OperLogService();
