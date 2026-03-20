import type { OperBusinessType } from "../../monitor/oper-log/business-type";

type OperLogMap = Record<string, { title: string; businessType: OperBusinessType }>;

export const OPER_LOG = {
  EXPORT: { title: "用户管理-导出", businessType: "EXPORT" },
  IMPORT: { title: "用户管理-导入", businessType: "IMPORT" },
  DELETE: { title: "用户管理-删除", businessType: "DELETE" },
  CREATE: { title: "用户管理-新增", businessType: "INSERT" },
  UPDATE: { title: "用户管理-编辑", businessType: "UPDATE" },
  RESET_PASSWORD: { title: "用户管理-重置密码", businessType: "UPDATE" },
} as const satisfies OperLogMap;