import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
  ListNoticeResponseSchema,
  ListNoticeSchema,
  NoticeFailResponseSchema,
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
  );
