import { t } from "elysia";

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
  data: t.Array(OnlineSessionItemSchema),
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
