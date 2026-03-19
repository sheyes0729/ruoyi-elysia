import { t } from "elysia";

export const ListPostSchema = t.Object({
  pageNum: t.Optional(t.Numeric({ minimum: 1 })),
  pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
  postCode: t.Optional(t.String()),
  postName: t.Optional(t.String()),
  status: t.Optional(t.Union([t.Literal("0"), t.Literal("1")])),
});

export type ListPostQuery = typeof ListPostSchema.static;

export const RemoveBatchPostSchema = t.Object({
  ids: t.Array(t.Numeric({ minimum: 1 }), { minItems: 1 }),
});

export type PostListItem = {
  postId: number;
  postCode: string;
  postName: string;
  postSort: number;
  status: "0" | "1";
};

export const PostListItemSchema = t.Object({
  postId: t.Number(),
  postCode: t.String(),
  postName: t.String(),
  postSort: t.Number(),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
});

export const ListPostResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    rows: t.Array(PostListItemSchema),
    total: t.Number(),
    pageNum: t.Number(),
    pageSize: t.Number(),
  }),
});

export const RemoveBatchPostResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    count: t.Number(),
  }),
});

export const PostFailResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Null(),
});
