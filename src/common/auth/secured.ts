import type { JwtUserPayload } from "../../modules/auth/token";
import type { OperBusinessType } from "../../modules/monitor/oper-log/business-type";
import { operLogService } from "../../modules/monitor/oper-log/service";
import { requireLogin, requirePermission } from "./guard";

type SecuredSet = {
  status?: number | string;
  headers: any;
  [key: string]: unknown;
};

type SecuredContext = {
  currentUser: JwtUserPayload | null;
  request: Request;
  set: SecuredSet;
  [key: string]: unknown;
};

export const SECURED_OPER_LOG_KEY = "__securedOperLogged";

type OperLogMeta = {
  title: string;
  businessType?: OperBusinessType;
  method?: string;
  onlyFailure?: boolean;
};

export type SecuredMeta = {
  permission?: string;
  denyMessage?: string;
  loginMessage?: string;
  operLog?: OperLogMeta;
};

const toStatusCode = (status?: number | string): number => {
  if (typeof status === "number") {
    return status;
  }

  return 200;
};

const toPathname = (request: Request): string => {
  try {
    return new URL(request.url).pathname;
  } catch {
    return request.url;
  }
};

const toBusinessType = (method: string): OperBusinessType => {
  if (method === "POST") {
    return "INSERT";
  }

  if (method === "PUT" || method === "PATCH") {
    return "UPDATE";
  }

  if (method === "DELETE") {
    return "DELETE";
  }

  return "OTHER";
};

const markOperLogged = (set: SecuredSet): void => {
  set[SECURED_OPER_LOG_KEY] = true;
};

const getOperLogMeta = (
  meta: SecuredMeta,
  request: Request,
): OperLogMeta | null => {
  if (meta.operLog) {
    return meta.operLog;
  }

  if (request.method === "GET") {
    return null;
  }

  return {
    title: `${request.method} ${toPathname(request)}`,
    businessType: toBusinessType(request.method),
  };
};

export const secured = <TContext extends SecuredContext, TResult>(
  meta: SecuredMeta,
  handler: (
    context: TContext & { currentUser: JwtUserPayload },
  ) => TResult | Promise<TResult>,
) => {
  return async (context: TContext) => {
    const operLogMeta = getOperLogMeta(meta, context.request);
    const authError = meta.permission
      ? requirePermission(
          context.currentUser,
          context.set,
          meta.permission,
          meta.denyMessage ?? "无权限访问",
        )
      : requireLogin(context.currentUser, context.set, meta.loginMessage);

    if (authError) {
      if (operLogMeta) {
        operLogService.record({
          title: operLogMeta.title,
          operName: context.currentUser?.username ?? "anonymous",
          method: operLogMeta.method ?? "secured",
          businessType:
            operLogMeta.businessType ?? toBusinessType(context.request.method),
          requestMethod: context.request.method,
          operUrl: toPathname(context.request),
          status: "1",
        });
        markOperLogged(context.set);
      }
      return authError;
    }

    let response: TResult;
    let failed = false;

    try {
      response = await handler(
        context as TContext & { currentUser: JwtUserPayload },
      );
      return response;
    } catch (error) {
      failed = true;
      throw error;
    } finally {
      if (operLogMeta) {
        const statusCode = toStatusCode(context.set.status);
        const isFailure = failed || statusCode >= 400;
        if (!operLogMeta.onlyFailure || isFailure) {
          operLogService.record({
            title: operLogMeta.title,
            operName: context.currentUser?.username ?? "anonymous",
            method: operLogMeta.method ?? "secured",
            businessType:
              operLogMeta.businessType ??
              toBusinessType(context.request.method),
            requestMethod: context.request.method,
            operUrl: toPathname(context.request),
            status: isFailure ? "1" : "0",
          });
          markOperLogged(context.set);
        }
      }
    }
  };
};
