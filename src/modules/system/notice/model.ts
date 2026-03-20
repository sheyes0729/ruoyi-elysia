import { t } from "elysia";

export const ListNoticeSchema = t.Object({
  pageNum: t.Optional(t.Numeric({ minimum: 1 })),
  pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
  noticeTitle: t.Optional(t.String()),
  noticeType: t.Optional(t.Union([t.Literal("1"), t.Literal("2")])),
  status: t.Optional(t.Union([t.Literal("0"), t.Literal("1")])),
});

export type ListNoticeQuery = typeof ListNoticeSchema.static;

export const RemoveBatchNoticeSchema = t.Object({
  ids: t.Array(t.Numeric({ minimum: 1 }), { minItems: 1 }),
});

export const CreateNoticeSchema = t.Object({
  noticeTitle: t.String({ minLength: 1, maxLength: 100 }),
  noticeType: t.Union([t.Literal("1"), t.Literal("2")]),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
});

export type CreateNoticeBody = typeof CreateNoticeSchema.static;

export const UpdateNoticeSchema = t.Object({
  noticeId: t.Numeric({ minimum: 1 }),
  noticeTitle: t.String({ minLength: 1, maxLength: 100 }),
  noticeType: t.Union([t.Literal("1"), t.Literal("2")]),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
});

export type UpdateNoticeBody = typeof UpdateNoticeSchema.static;

export type NoticeListItem = {
  noticeId: number;
  noticeTitle: string;
  noticeType: "1" | "2";
  status: "0" | "1";
  createTime: string;
};

export const NoticeListItemSchema = t.Object({
  noticeId: t.Number(),
  noticeTitle: t.String(),
  noticeType: t.Union([t.Literal("1"), t.Literal("2")]),
  status: t.Union([t.Literal("0"), t.Literal("1")]),
  createTime: t.String(),
});

export const ListNoticeResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    rows: t.Array(NoticeListItemSchema),
    total: t.Number(),
    pageNum: t.Number(),
    pageSize: t.Number(),
  }),
});

export const RemoveBatchNoticeResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    count: t.Number(),
  }),
});

export const CreateNoticeResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    noticeId: t.Number(),
  }),
});

export const UpdateNoticeResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Boolean(),
});

export const NoticeFailResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Null(),
});
