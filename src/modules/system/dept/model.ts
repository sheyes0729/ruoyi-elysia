import { t } from "elysia";

export const ListDeptSchema = t.Object({
  deptName: t.Optional(t.String()),
  status: t.Optional(t.Union([t.Literal("0"), t.Literal("1")])),
});

export type ListDeptQuery = typeof ListDeptSchema.static;

export const RemoveBatchDeptSchema = t.Object({
  ids: t.Array(t.Numeric({ minimum: 1 }), { minItems: 1 }),
});

export type DeptTreeItem = {
  deptId: number;
  parentId: number;
  deptName: string;
  orderNum: number;
  status: "0" | "1";
  children?: DeptTreeItem[];
};

export const DeptTreeItemSchema = t.Object({
  deptId: t.Number(),
  parentId: t.Number(),
  deptName: t.String(),
  orderNum: t.Number(),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
  children: t.Optional(t.Array(t.Any())),
});

export const ListDeptResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Array(DeptTreeItemSchema),
});

export const RemoveBatchDeptResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    count: t.Number(),
  }),
});

export const DeptFailResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Null(),
});
