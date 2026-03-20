import type { JwtUserPayload } from "../../modules/auth/token";
import { fail, type ApiResponse } from "../http/response";
import { hasPermission } from "./permission";

type AuthSet = {
  status?: number | string;
};

type AuthFailure = ApiResponse<null>;

const DEFAULT_UNAUTHORIZED_MESSAGE = "未登录或登录已失效";

export const requireLogin = (
  currentUser: JwtUserPayload | null,
  set: AuthSet,
  message = DEFAULT_UNAUTHORIZED_MESSAGE
): AuthFailure | null => {
  if (currentUser) {
    return null;
  }

  set.status = 401;
  return fail(401, message);
};

export const requirePermission = (
  currentUser: JwtUserPayload | null,
  set: AuthSet,
  permission: string,
  message: string
): AuthFailure | null => {
  const loginError = requireLogin(currentUser, set);
  if (loginError) {
    return loginError;
  }

  if (hasPermission(currentUser, permission)) {
    return null;
  }

  set.status = 403;
  return fail(403, message);
};
