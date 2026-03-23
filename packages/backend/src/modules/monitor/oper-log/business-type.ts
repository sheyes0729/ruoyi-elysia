export const OPER_BUSINESS_TYPES = [
  "OTHER",
  "INSERT",
  "UPDATE",
  "DELETE",
  "EXPORT",
  "IMPORT",
  "CLEAN",
  "GRANT",
  "FORCE",
  "LOGIN",
  "LOGOUT",
] as const;

export type OperBusinessType = (typeof OPER_BUSINESS_TYPES)[number];
