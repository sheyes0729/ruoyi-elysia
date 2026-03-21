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
      async ({ query }) => {
        const typedQuery = query as ListLoginLogQuery;
        const records = await loginLogService.list(typedQuery);
        return ok(paginateData(records, typedQuery));
      },
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
    },
  )
  .post(
    "/export",
    secured(
      {
        permission: "monitor:logininfor:export",
        denyMessage: "无权限导出登录日志",
        operLog: OPER_LOG.EXPORT,
      },
      async ({ query, set }) => {
        const typedQuery = query as ListLoginLogQuery;
        const rows = await loginLogService.list(typedQuery);
        return buildCsvDownload(
          set,
          rows as unknown[],
          [
            {
              header: "日志ID",
              value: (row) => (row as { infoId: number }).infoId,
            },
            {
              header: "用户名",
              value: (row) => (row as { username: string }).username,
            },
            { header: "IP", value: (row) => (row as { ip: string }).ip },
            {
              header: "状态",
              value: (row) => (row as { status: string }).status,
            },
            { header: "消息", value: (row) => (row as { msg: string }).msg },
            {
              header: "时间",
              value: (row) => (row as { loginTime: string }).loginTime,
            },
          ],
          "monitor-login-log-export.csv",
        );
      },
    ),
    {
      query: ListLoginLogSchema,
      detail: {
        tags: ["监控管理-登录日志"],
        summary: "导出登录日志",
      },
    },
  )
  .delete(
    "/clean",
    secured(
      {
        permission: "monitor:logininfor:remove",
        denyMessage: "无权限清空登录日志",
        operLog: OPER_LOG.CLEAN,
      },
      async () => {
        const count = await loginLogService.clear();
        return ok({ count }, "清空成功");
      },
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
    },
  );
