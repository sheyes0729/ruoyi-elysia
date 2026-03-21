import { t } from "elysia";

export const QueryPageSchema = t.Object({
  pageNum: t.Optional(t.Numeric({ minimum: 1 })),
  pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
});

export type QueryPage = typeof QueryPageSchema.static;

export const toPage = (
  query: QueryPage,
): { pageNum: number; pageSize: number } => ({
  pageNum: query.pageNum ?? 1,
  pageSize: query.pageSize ?? 10,
});

export const paginateData = <T>(
  rows: T[],
  query: QueryPage,
  total?: number,
) => {
  const { pageNum, pageSize } = toPage(query);
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;

  return {
    rows: rows.slice(start, end),
    total: total ?? rows.length,
    pageNum,
    pageSize,
  };
};
