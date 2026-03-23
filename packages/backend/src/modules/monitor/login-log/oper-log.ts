import type { OperBusinessType } from "../oper-log/business-type";

type OperLogMap = Record<string, { title: string; businessType: OperBusinessType }>;

export const OPER_LOG = {
  EXPORT: { title: "登录日志-导出", businessType: "EXPORT" },
  CLEAN: { title: "登录日志-清空", businessType: "CLEAN" },
} as const satisfies OperLogMap;