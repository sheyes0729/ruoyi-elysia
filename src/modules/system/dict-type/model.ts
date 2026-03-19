import { t } from "elysia";

export const ListDictTypeSchema = t.Object({
  pageNum: t.Optional(t.Numeric({ minimum: 1 })),
  pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
  dictName: t.Optional(t.String()),
  dictType: t.Optional(t.String()),
  status: t.Optional(t.Union([t.Literal("0"), t.Literal("1")])),
});

export type ListDictTypeQuery = typeof ListDictTypeSchema.static;

export const RemoveBatchDictTypeSchema = t.Object({
  ids: t.Array(t.Numeric({ minimum: 1 }), { minItems: 1 }),
});

export type DictTypeListItem = {
  dictId: number;
  dictName: string;
  dictType: string;
  status: "0" | "1";
};

export const DictTypeListItemSchema = t.Object({
  dictId: t.Number(),
  dictName: t.String(),
  dictType: t.String(),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
});

export const ListDictTypeResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    rows: t.Array(DictTypeListItemSchema),
    total: t.Number(),
    pageNum: t.Number(),
    pageSize: t.Number(),
  }),
});

export const RemoveBatchDictTypeResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    count: t.Number(),
  }),
});

export const DictTypeFailResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Null(),
});
