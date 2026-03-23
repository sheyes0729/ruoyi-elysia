import { t } from "elysia";

export const ListOnlineSchema = t.Object({
  pageNum: t.Optional(t.Numeric({ minimum: 1 })),
  pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
  username: t.Optional(t.String()),
});

export type ListOnlineQuery = typeof ListOnlineSchema.static;

export const ForceLogoutOnlineSchema = t.Object({
  token: t.String({ minLength: 10 }),
});

export type ForceLogoutOnlinePayload = typeof ForceLogoutOnlineSchema.static;

export const OnlineSessionItemSchema = t.Object({
  token: t.String(),
  userId: t.Number(),
  username: t.String(),
  loginTime: t.String(),
  lastAccessTime: t.String(),
  ip: t.String(),
});

export const ListOnlineResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    rows: t.Array(OnlineSessionItemSchema),
    total: t.Number(),
    pageNum: t.Number(),
    pageSize: t.Number(),
  }),
});

export const ForceLogoutOnlineResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Boolean(),
});

export const OnlineFailResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Null(),
});
