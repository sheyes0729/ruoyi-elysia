import { t } from "elysia";

export const LoginLogItemSchema = t.Object({
  infoId: t.Number(),
  username: t.String(),
  ip: t.String(),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
  msg: t.String(),
  loginTime: t.String(),
});

export const ListLoginLogResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Array(LoginLogItemSchema),
});

export const LoginLogFailResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Null(),
});
