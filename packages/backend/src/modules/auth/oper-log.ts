import type { OperBusinessType } from "../monitor/oper-log/business-type";

type OperLogMap = Record<string, { title: string; businessType: OperBusinessType }>;

export const OPER_LOG = {
    LOGOUT: { title: "认证-退出登录", businessType: "LOGOUT" },
} as const satisfies OperLogMap;