import { t } from "elysia";

export const ListRoleSchema = t.Object({
  pageNum: t.Optional(t.Numeric({ minimum: 1 })),
  pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
  roleName: t.Optional(t.String()),
  roleKey: t.Optional(t.String()),
  status: t.Optional(t.Union([t.Literal("0"), t.Literal("1")])),
});

export type ListRoleQuery = typeof ListRoleSchema.static;

export const RemoveBatchRoleSchema = t.Object({
  ids: t.Array(t.Numeric({ minimum: 1 }), { minItems: 1 }),
});

export const CreateRoleSchema = t.Object({
  roleKey: t.String({ minLength: 2, maxLength: 50 }),
  roleName: t.String({ minLength: 1, maxLength: 50 }),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
  menuIds: t.Optional(t.Array(t.Numeric({ minimum: 1 }))),
  dataScope: t.Optional(
    t.Union([
      t.Literal("1"),
      t.Literal("2"),
      t.Literal("3"),
      t.Literal("4"),
      t.Literal("5"),
    ]),
  ),
  deptCheckStrictly: t.Optional(t.Union([t.Literal("0"), t.Literal("1")])),
  deptIds: t.Optional(t.Array(t.Numeric({ minimum: 0 }))),
});

export type CreateRoleBody = typeof CreateRoleSchema.static;

export const UpdateRoleSchema = t.Object({
  roleId: t.Numeric({ minimum: 1 }),
  roleName: t.String({ minLength: 1, maxLength: 50 }),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
  menuIds: t.Optional(t.Array(t.Numeric({ minimum: 1 }))),
  dataScope: t.Optional(
    t.Union([
      t.Literal("1"),
      t.Literal("2"),
      t.Literal("3"),
      t.Literal("4"),
      t.Literal("5"),
    ]),
  ),
  deptCheckStrictly: t.Optional(t.Union([t.Literal("0"), t.Literal("1")])),
  deptIds: t.Optional(t.Array(t.Numeric({ minimum: 0 }))),
});

export type UpdateRoleBody = typeof UpdateRoleSchema.static;

export const AuthRoleMenuSchema = t.Object({
  roleId: t.Numeric({ minimum: 1 }),
  menuIds: t.Array(t.Numeric({ minimum: 1 })),
});

export type AuthRoleMenuBody = typeof AuthRoleMenuSchema.static;

export type RoleListItem = {
  roleId: number;
  roleKey: string;
  roleName: string;
  status: "0" | "1";
  dataScope: "1" | "2" | "3" | "4" | "5";
  deptCheckStrictly: "0" | "1";
  deptIds: number[];
};

export const RoleListItemSchema = t.Object({
  roleId: t.Number(),
  roleKey: t.String(),
  roleName: t.String(),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
  dataScope: t.Union([
    t.Literal("1"),
    t.Literal("2"),
    t.Literal("3"),
    t.Literal("4"),
    t.Literal("5"),
  ]),
  deptCheckStrictly: t.Union([t.Literal("0"), t.Literal("1")]),
  deptIds: t.Array(t.Number()),
});

export const ListRoleResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    rows: t.Array(RoleListItemSchema),
    total: t.Number(),
    pageNum: t.Number(),
    pageSize: t.Number(),
  }),
});

export const RemoveBatchRoleResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    count: t.Number(),
  }),
});

export const CreateRoleResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    roleId: t.Number(),
  }),
});

export const UpdateRoleResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Boolean(),
});

export const AuthRoleMenuResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Boolean(),
});

export const RoleFailResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Null(),
});
