import type { OperBusinessType } from "./business-type";

type OperLogMap = Record<string, { title: string; businessType: OperBusinessType }>;

export const OPER_LOG = {
  EXPORT: { title: "操作日志-导出", businessType: "EXPORT" },
  CLEAN: { title: "操作日志-清空", businessType: "CLEAN" },
} as const satisfies OperLogMap;
