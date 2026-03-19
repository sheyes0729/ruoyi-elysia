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

export type RoleListItem = {
    roleId: number;
    roleKey: string;
    roleName: string;
    status: "0" | "1";
};

export const RoleListItemSchema = t.Object({
    roleId: t.Number(),
    roleKey: t.String(),
    roleName: t.String(),
    status: t.Union([t.Literal("0"), t.Literal("1")]),
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

export const RoleFailResponseSchema = t.Object({
    code: t.Number(),
    msg: t.String(),
    data: t.Null(),
});
