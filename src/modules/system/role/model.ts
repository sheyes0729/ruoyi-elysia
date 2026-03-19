import { t } from "elysia";

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
    data: t.Array(RoleListItemSchema),
});

export const RoleFailResponseSchema = t.Object({
    code: t.Number(),
    msg: t.String(),
    data: t.Null(),
});
