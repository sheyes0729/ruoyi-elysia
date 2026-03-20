import { t } from "elysia";

export const ListUserSchema = t.Object({
  pageNum: t.Optional(t.Numeric({ minimum: 1 })),
  pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
  username: t.Optional(t.String()),
  status: t.Optional(t.Union([t.Literal("0"), t.Literal("1")])),
});

export type ListUserQuery = typeof ListUserSchema.static;

export const RemoveBatchUserSchema = t.Object({
  ids: t.Array(t.Numeric({ minimum: 1 }), { minItems: 1 }),
});

export const CreateUserSchema = t.Object({
  username: t.String({ minLength: 2, maxLength: 30 }),
  nickName: t.String({ minLength: 1, maxLength: 30 }),
  password: t.String({ minLength: 6, maxLength: 64 }),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
  roleIds: t.Array(t.Numeric({ minimum: 1 }), { minItems: 1 }),
});

export type CreateUserBody = typeof CreateUserSchema.static;

export const UpdateUserSchema = t.Object({
  userId: t.Numeric({ minimum: 1 }),
  nickName: t.String({ minLength: 1, maxLength: 30 }),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
  roleIds: t.Array(t.Numeric({ minimum: 1 }), { minItems: 1 }),
});

export type UpdateUserBody = typeof UpdateUserSchema.static;

export const ResetPasswordSchema = t.Object({
  userId: t.Numeric({ minimum: 1 }),
  password: t.String({ minLength: 6, maxLength: 64 }),
});

export type ResetPasswordBody = typeof ResetPasswordSchema.static;

export type UserListItem = {
  userId: number;
  username: string;
  nickName: string;
  status: "0" | "1";
  roleIds: number[];
};

export const UserListItemSchema = t.Object({
  userId: t.Number(),
  username: t.String(),
  nickName: t.String(),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
  roleIds: t.Array(t.Number()),
});

export const ListUserResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    rows: t.Array(UserListItemSchema),
    total: t.Number(),
    pageNum: t.Number(),
    pageSize: t.Number(),
  }),
});

export const RemoveBatchUserResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    count: t.Number(),
  }),
});

export const CreateUserResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    userId: t.Number(),
  }),
});

export const UpdateUserResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Boolean(),
});

export const ResetPasswordResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Boolean(),
});

export const UserFailResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Null(),
});
