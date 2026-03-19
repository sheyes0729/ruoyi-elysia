import { t } from "elysia";

export const ListLoginLogSchema = t.Object({
  pageNum: t.Optional(t.Numeric({ minimum: 1 })),
  pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
  username: t.Optional(t.String()),
  status: t.Optional(t.Union([t.Literal("0"), t.Literal("1")])),
  beginTime: t.Optional(t.String()),
  endTime: t.Optional(t.String()),
});

export type ListLoginLogQuery = typeof ListLoginLogSchema.static;

export const CleanLoginLogResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    count: t.Number(),
  }),
});

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
  data: t.Object({
    rows: t.Array(LoginLogItemSchema),
    total: t.Number(),
    pageNum: t.Number(),
    pageSize: t.Number(),
  }),
});

export const LoginLogFailResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Null(),
});
