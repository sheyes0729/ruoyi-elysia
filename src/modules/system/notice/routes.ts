import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { toCsv } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
  ListNoticeResponseSchema,
  ListNoticeSchema,
  NoticeFailResponseSchema,
  RemoveBatchNoticeResponseSchema,
  RemoveBatchNoticeSchema,
} from "./model";
import { noticeService } from "./service";

export const NoticeRoutes = new Elysia({
  prefix: "/api/system/notice",
  name: "system.notice.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    ({ currentUser, query, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:notice:list")) {
        set.status = 403;
        return fail(403, "无权限访问通知公告");
      }

      return ok(paginateData(noticeService.list(query), query));
    },
    {
      query: ListNoticeSchema,
      response: {
        200: ListNoticeResponseSchema,
        401: NoticeFailResponseSchema,
        403: NoticeFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-通知公告"],
        summary: "查询通知公告列表",
      },
    }
  )
  .post(
    "/export",
    ({ currentUser, query, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:notice:export")) {
        set.status = 403;
        return fail(403, "无权限导出通知公告");
      }

      const rows = noticeService.list(query);
      const csv = toCsv(rows, [
        { header: "公告ID", value: (row) => row.noticeId },
        { header: "公告标题", value: (row) => row.noticeTitle },
        { header: "公告类型", value: (row) => row.noticeType },
        { header: "状态", value: (row) => row.status },
        { header: "创建时间", value: (row) => row.createTime },
      ]);

      set.headers["content-type"] = "text/csv; charset=utf-8";
      set.headers["content-disposition"] =
        "attachment; filename=system-notice-export.csv";
      return `\uFEFF${csv}`;
    },
    {
      query: ListNoticeSchema,
      detail: {
        tags: ["系统管理-通知公告"],
        summary: "导出通知公告列表",
      },
    }
  )
  .delete(
    "/batch",
    ({ body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:notice:remove")) {
        set.status = 403;
        return fail(403, "无权限删除通知公告");
      }

      const count = noticeService.removeBatch(body.ids);
      return ok({ count }, "删除成功");
    },
    {
      body: RemoveBatchNoticeSchema,
      response: {
        200: RemoveBatchNoticeResponseSchema,
        401: NoticeFailResponseSchema,
        403: NoticeFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-通知公告"],
        summary: "批量删除通知公告",
      },
    }
  );
