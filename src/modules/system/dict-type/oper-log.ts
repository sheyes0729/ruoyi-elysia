import type { OperBusinessType } from "../../monitor/oper-log/business-type";

type OperLogMap = Record<string, { title: string; businessType: OperBusinessType }>;

export const OPER_LOG = {
  EXPORT: { title: "字典类型-导出", businessType: "EXPORT" },
  DELETE: { title: "字典类型-删除", businessType: "DELETE" },
  CREATE: { title: "字典类型-新增", businessType: "INSERT" },
  UPDATE: { title: "字典类型-编辑", businessType: "UPDATE" },
} as const satisfies OperLogMap;