import type { OperBusinessType } from "../oper-log/business-type";

type OperLogMap = Record<string, { title: string; businessType: OperBusinessType }>;

export const OPER_LOG = {
  FORCE_LOGOUT: { title: "在线用户-强制下线", businessType: "FORCE" },
} as const satisfies OperLogMap;