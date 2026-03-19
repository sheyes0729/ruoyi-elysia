import { t } from "elysia";

export const ListNoticeSchema = t.Object({
  pageNum: t.Optional(t.Numeric({ minimum: 1 })),
  pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
  noticeTitle: t.Optional(t.String()),
  noticeType: t.Optional(t.Union([t.Literal("1"), t.Literal("2")])),
  status: t.Optional(t.Union([t.Literal("0"), t.Literal("1")])),
});

export type ListNoticeQuery = typeof ListNoticeSchema.static;

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

export const NoticeFailResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Null(),
});
