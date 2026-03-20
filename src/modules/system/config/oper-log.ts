import type { OperBusinessType } from "../../monitor/oper-log/business-type";

type OperLogMap = Record<string, { title: string; businessType: OperBusinessType }>;

export const OPER_LOG = {
  EXPORT: { title: "参数配置-导出", businessType: "EXPORT" },
  DELETE: { title: "参数配置-删除", businessType: "DELETE" },
  CREATE: { title: "参数配置-新增", businessType: "INSERT" },
  UPDATE: { title: "参数配置-编辑", businessType: "UPDATE" },
} as const satisfies OperLogMap;