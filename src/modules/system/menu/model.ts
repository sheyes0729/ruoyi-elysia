import { t } from "elysia";

export const ListMenuSchema = t.Object({
    pageNum: t.Optional(t.Numeric({ minimum: 1 })),
    pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
    menuName: t.Optional(t.String()),
    status: t.Optional(t.Union([t.Literal("0"), t.Literal("1")])),
});

export type ListMenuQuery = typeof ListMenuSchema.static;

export const RemoveBatchMenuSchema = t.Object({
    ids: t.Array(t.Numeric({ minimum: 1 }), { minItems: 1 }),
});

export type MenuListItem = {
    menuId: number;
    menuName: string;
    parentId: number;
    orderNum: number;
    path: string;
    component: string;
    menuType: "M" | "C" | "F";
    perms: string;
    visible: "0" | "1";
    status: "0" | "1";
};

export const MenuListItemSchema = t.Object({
    menuId: t.Number(),
    menuName: t.String(),
    parentId: t.Number(),
    orderNum: t.Number(),
    path: t.String(),
    component: t.String(),
    menuType: t.Union([t.Literal("M"), t.Literal("C"), t.Literal("F")]),
    perms: t.String(),
    visible: t.Union([t.Literal("0"), t.Literal("1")]),
    status: t.Union([t.Literal("0"), t.Literal("1")]),
});

export const ListMenuResponseSchema = t.Object({
    code: t.Number(),
    msg: t.String(),
    data: t.Object({
        rows: t.Array(MenuListItemSchema),
        total: t.Number(),
        pageNum: t.Number(),
        pageSize: t.Number(),
    }),
});

export const RemoveBatchMenuResponseSchema = t.Object({
    code: t.Number(),
    msg: t.String(),
    data: t.Object({
        count: t.Number(),
    }),
});

export const MenuFailResponseSchema = t.Object({
    code: t.Number(),
    msg: t.String(),
    data: t.Null(),
});
