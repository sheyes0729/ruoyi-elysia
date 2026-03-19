import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { buildCsvDownload } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
  CleanLoginLogResponseSchema,
  ListLoginLogSchema,
  ListLoginLogResponseSchema,
  LoginLogFailResponseSchema,
} from "./model";
import { loginLogService } from "./service";

export const LoginLogRoutes = new Elysia({
  prefix: "/api/monitor/logininfor",
  name: "monitor.login-log.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    ({ currentUser, query, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "monitor:logininfor:list")) {
        set.status = 403;
        return fail(403, "无权限访问登录日志");
      }

      const records = loginLogService.list(query);
      return ok(paginateData(records, query));
    },
    {
      query: ListLoginLogSchema,
      response: {
        200: ListLoginLogResponseSchema,
        401: LoginLogFailResponseSchema,
        403: LoginLogFailResponseSchema,
      },
      detail: {
        tags: ["监控管理-登录日志"],
        summary: "查询登录日志列表",
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

      if (!hasPermission(currentUser, "monitor:logininfor:export")) {
        set.status = 403;
        return fail(403, "无权限导出登录日志");
      }

      const rows = loginLogService.list(query);
      return buildCsvDownload(
        set,
        rows,
        [
          { header: "日志ID", value: (row) => row.infoId },
          { header: "用户名", value: (row) => row.username },
          { header: "IP", value: (row) => row.ip },
          { header: "状态", value: (row) => row.status },
          { header: "消息", value: (row) => row.msg },
          { header: "时间", value: (row) => row.loginTime },
        ],
        "monitor-login-log-export.csv"
      );
    },
    {
      query: ListLoginLogSchema,
      detail: {
        tags: ["监控管理-登录日志"],
        summary: "导出登录日志",
      },
    }
  )
  .delete(
    "/clean",
    ({ currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "monitor:logininfor:remove")) {
        set.status = 403;
        return fail(403, "无权限清空登录日志");
      }

      const count = loginLogService.clear();
      return ok({ count }, "清空成功");
    },
    {
      response: {
        200: CleanLoginLogResponseSchema,
        401: LoginLogFailResponseSchema,
        403: LoginLogFailResponseSchema,
      },
      detail: {
        tags: ["监控管理-登录日志"],
        summary: "清空登录日志",
      },
    }
  );
