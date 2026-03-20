import { Elysia } from "elysia";
import { secured } from "../../../common/auth/secured";
import { buildCsvDownload } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { OPER_LOG } from "./oper-log";
import {
  CleanLoginLogResponseSchema,
  type ListLoginLogQuery,
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
    secured(
      {
        permission: "monitor:logininfor:list",
        denyMessage: "无权限访问登录日志",
      },
      ({ query }) => {
        const typedQuery = query as ListLoginLogQuery;
        const records = loginLogService.list(typedQuery);
        return ok(paginateData(records, typedQuery));
      }
    ),
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
    secured(
      {
        permission: "monitor:logininfor:export",
        denyMessage: "无权限导出登录日志",
        operLog: OPER_LOG.EXPORT,
      },
      ({ query, set }) => {
        const typedQuery = query as ListLoginLogQuery;
        const rows = loginLogService.list(typedQuery);
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
      }
    ),
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
    secured(
      {
        permission: "monitor:logininfor:remove",
        denyMessage: "无权限清空登录日志",
        operLog: OPER_LOG.CLEAN,
      },
      () => {
        const count = loginLogService.clear();
        return ok({ count }, "清空成功");
      }
    ),
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
