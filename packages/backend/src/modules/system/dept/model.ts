import { t } from "elysia";

export const ListDeptSchema = t.Object({
  deptName: t.Optional(t.String()),
  status: t.Optional(t.Union([t.Literal("0"), t.Literal("1")])),
});

export type ListDeptQuery = typeof ListDeptSchema.static;

export const RemoveBatchDeptSchema = t.Object({
  ids: t.Array(t.Numeric({ minimum: 1 }), { minItems: 1 }),
});

export const CreateDeptSchema = t.Object({
  parentId: t.Numeric({ minimum: 0 }),
  deptName: t.String({ minLength: 1, maxLength: 100 }),
  orderNum: t.Numeric({ minimum: 0 }),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
});

export type CreateDeptBody = typeof CreateDeptSchema.static;

export const UpdateDeptSchema = t.Object({
  deptId: t.Numeric({ minimum: 1 }),
  parentId: t.Numeric({ minimum: 0 }),
  deptName: t.String({ minLength: 1, maxLength: 100 }),
  orderNum: t.Numeric({ minimum: 0 }),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
});

export type UpdateDeptBody = typeof UpdateDeptSchema.static;

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

export const CreateDeptResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    deptId: t.Number(),
  }),
});

export const UpdateDeptResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Boolean(),
});

export const DeptFailResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Null(),
});
