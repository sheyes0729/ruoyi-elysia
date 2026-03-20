import { Elysia } from "elysia";
import { secured } from "../../../common/auth/secured";
import { toCsv } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { OPER_LOG } from "./oper-log";
import {
  CreateNoticeBody,
  CreateNoticeResponseSchema,
  CreateNoticeSchema,
  ListNoticeQuery,
  ListNoticeResponseSchema,
  ListNoticeSchema,
  NoticeFailResponseSchema,
  RemoveBatchNoticeResponseSchema,
  RemoveBatchNoticeSchema,
  UpdateNoticeBody,
  UpdateNoticeResponseSchema,
  UpdateNoticeSchema,
} from "./model";
import { noticeService } from "./service";

export const NoticeRoutes = new Elysia({
  prefix: "/api/system/notice",
  name: "system.notice.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    secured(
      {
        permission: "system:notice:list",
        denyMessage: "无权限访问通知公告",
      },
      ({ query }) => {
        const typedQuery = query as ListNoticeQuery;
        return ok(paginateData(noticeService.list(typedQuery), typedQuery));
      }
    ),
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
    secured(
      {
        permission: "system:notice:export",
        denyMessage: "无权限导出通知公告",
        operLog: OPER_LOG.EXPORT,
      },
      ({ query, set }) => {
        const typedQuery = query as ListNoticeQuery;
        const rows = noticeService.list(typedQuery);
        const csv = toCsv(rows, [
          { header: "公告ID", value: (row) => row.noticeId },
          { header: "公告标题", value: (row) => row.noticeTitle },
          { header: "公告类型", value: (row) => row.noticeType },
          { header: "状态", value: (row) => row.status },
          { header: "创建时间", value: (row) => row.createTime },
        ]);

        const headers = set.headers as Record<string, string>;
        headers["content-type"] = "text/csv; charset=utf-8";
        headers["content-disposition"] =
          "attachment; filename=system-notice-export.csv";
        return `\uFEFF${csv}`;
      }
    ),
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
    secured(
      {
        permission: "system:notice:remove",
        denyMessage: "无权限删除通知公告",
        operLog: OPER_LOG.DELETE,
      },
      ({ body }) => {
        const typedBody = body as typeof RemoveBatchNoticeSchema.static;
        const count = noticeService.removeBatch(typedBody.ids);
        return ok({ count }, "删除成功");
      }
    ),
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
  )
  .post(
    "/add",
    secured(
      {
        permission: "system:notice:add",
        denyMessage: "无权限新增通知公告",
        operLog: OPER_LOG.CREATE,
      },
      ({ body }) => {
        const typedBody = body as CreateNoticeBody;
        const result = noticeService.create(typedBody);
        return ok({ noticeId: result.noticeId }, "新增成功");
      }
    ),
    {
      body: CreateNoticeSchema,
      response: {
        200: CreateNoticeResponseSchema,
        401: NoticeFailResponseSchema,
        403: NoticeFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-通知公告"],
        summary: "新增通知公告",
      },
    }
  )
  .put(
    "/edit",
    secured(
      {
        permission: "system:notice:edit",
        denyMessage: "无权限编辑通知公告",
        operLog: OPER_LOG.UPDATE,
      },
      ({ body, set }) => {
        const typedBody = body as UpdateNoticeBody;
        const result = noticeService.update(typedBody);
        if (!result.success) {
          set.status = 404;
          return fail(404, "通知公告不存在");
        }

        return ok(true, "修改成功");
      }
    ),
    {
      body: UpdateNoticeSchema,
      response: {
        200: UpdateNoticeResponseSchema,
        401: NoticeFailResponseSchema,
        403: NoticeFailResponseSchema,
        404: NoticeFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-通知公告"],
        summary: "编辑通知公告",
      },
    }
  );
