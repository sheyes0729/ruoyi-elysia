import { t } from "elysia";

export const ListDictDataSchema = t.Object({
  pageNum: t.Optional(t.Numeric({ minimum: 1 })),
  pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
  dictType: t.Optional(t.String()),
  dictLabel: t.Optional(t.String()),
  status: t.Optional(t.Union([t.Literal("0"), t.Literal("1")])),
});

export type ListDictDataQuery = typeof ListDictDataSchema.static;

export const RemoveBatchDictDataSchema = t.Object({
  ids: t.Array(t.Numeric({ minimum: 1 }), { minItems: 1 }),
});

export type DictDataListItem = {
  dictCode: number;
  dictSort: number;
  dictLabel: string;
  dictValue: string;
  dictType: string;
  status: "0" | "1";
};

export const DictDataListItemSchema = t.Object({
  dictCode: t.Number(),
  dictSort: t.Number(),
  dictLabel: t.String(),
  dictValue: t.String(),
  dictType: t.String(),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
});

export const ListDictDataResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    rows: t.Array(DictDataListItemSchema),
    total: t.Number(),
    pageNum: t.Number(),
    pageSize: t.Number(),
  }),
});

export const RemoveBatchDictDataResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    count: t.Number(),
  }),
});

export const DictDataFailResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Null(),
});
