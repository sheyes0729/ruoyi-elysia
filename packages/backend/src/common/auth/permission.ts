import type { JwtUserPayload } from "../../modules/auth/token";

export const hasPermission = (
  user: JwtUserPayload | null,
  permission: string
): boolean => {
  if (!user) {
    return false;
  }

  if (user.permissions.includes("*:*:*")) {
    return true;
  }

  return user.permissions.includes(permission);
};
