import { t } from "elysia";

export const ListOperLogSchema = t.Object({
  pageNum: t.Optional(t.Numeric({ minimum: 1 })),
  pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
  operName: t.Optional(t.String()),
  status: t.Optional(t.Union([t.Literal("0"), t.Literal("1")])),
  beginTime: t.Optional(t.String()),
  endTime: t.Optional(t.String()),
});

export type ListOperLogQuery = typeof ListOperLogSchema.static;

export const CleanOperLogResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    count: t.Number(),
  }),
});

export const OperLogItemSchema = t.Object({
  operId: t.Number(),
  title: t.String(),
  operName: t.String(),
  method: t.String(),
  requestMethod: t.String(),
  operUrl: t.String(),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
  operTime: t.String(),
});

export const ListOperLogResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    rows: t.Array(OperLogItemSchema),
    total: t.Number(),
    pageNum: t.Number(),
    pageSize: t.Number(),
  }),
});

export const OperLogFailResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Null(),
});
