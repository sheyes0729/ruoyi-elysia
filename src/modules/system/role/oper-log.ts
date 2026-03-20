import type { OperBusinessType } from "../../monitor/oper-log/business-type";

type OperLogMap = Record<string, { title: string; businessType: OperBusinessType }>;

export const OPER_LOG = {
  EXPORT: { title: "角色管理-导出", businessType: "EXPORT" },
  DELETE: { title: "角色管理-删除", businessType: "DELETE" },
  CREATE: { title: "角色管理-新增", businessType: "INSERT" },
  UPDATE: { title: "角色管理-编辑", businessType: "UPDATE" },
  GRANT_MENU: { title: "角色管理-分配菜单", businessType: "GRANT" },
} as const satisfies OperLogMap;