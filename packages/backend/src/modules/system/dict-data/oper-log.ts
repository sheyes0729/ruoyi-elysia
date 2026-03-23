import type { OperBusinessType } from "../../monitor/oper-log/business-type";

type OperLogMap = Record<string, { title: string; businessType: OperBusinessType }>;

export const OPER_LOG = {
  EXPORT: { title: "字典数据-导出", businessType: "EXPORT" },
  IMPORT: { title: "字典数据-导入", businessType: "IMPORT" },
  DELETE: { title: "字典数据-删除", businessType: "DELETE" },
  CREATE: { title: "字典数据-新增", businessType: "INSERT" },
  UPDATE: { title: "字典数据-编辑", businessType: "UPDATE" },
} as const satisfies OperLogMap;