import type { OperBusinessType } from "../../monitor/oper-log/business-type";

type OperLogMap = Record<string, { title: string; businessType: OperBusinessType }>;

export const OPER_LOG = {
  EXPORT: { title: "部门管理-导出", businessType: "EXPORT" },
  DELETE: { title: "部门管理-删除", businessType: "DELETE" },
  CREATE: { title: "部门管理-新增", businessType: "INSERT" },
  UPDATE: { title: "部门管理-编辑", businessType: "UPDATE" },
} as const satisfies OperLogMap;