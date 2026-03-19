import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { buildCsvDownload } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
  CleanOperLogResponseSchema,
  ListOperLogResponseSchema,
  ListOperLogSchema,
  OperLogFailResponseSchema,
} from "./model";
import { operLogService } from "./service";

export const OperLogRoutes = new Elysia({
  prefix: "/api/monitor/operlog",
  name: "monitor.oper-log.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    ({ currentUser, query, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "monitor:operlog:list")) {
        set.status = 403;
        return fail(403, "无权限访问操作日志");
      }

      const records = operLogService.list(query);
      return ok(paginateData(records, query));
    },
    {
      query: ListOperLogSchema,
      response: {
        200: ListOperLogResponseSchema,
        401: OperLogFailResponseSchema,
        403: OperLogFailResponseSchema,
      },
      detail: {
        tags: ["监控管理-操作日志"],
        summary: "查询操作日志列表",
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

      if (!hasPermission(currentUser, "monitor:operlog:export")) {
        set.status = 403;
        return fail(403, "无权限导出操作日志");
      }

      const rows = operLogService.list(query);
      return buildCsvDownload(
        set,
        rows,
        [
          { header: "日志ID", value: (row) => row.operId },
          { header: "标题", value: (row) => row.title },
          { header: "操作人", value: (row) => row.operName },
          { header: "方法", value: (row) => row.method },
          { header: "请求方式", value: (row) => row.requestMethod },
          { header: "地址", value: (row) => row.operUrl },
          { header: "状态", value: (row) => row.status },
          { header: "时间", value: (row) => row.operTime },
        ],
        "monitor-oper-log-export.csv"
      );
    },
    {
      query: ListOperLogSchema,
      detail: {
        tags: ["监控管理-操作日志"],
        summary: "导出操作日志",
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

      if (!hasPermission(currentUser, "monitor:operlog:remove")) {
        set.status = 403;
        return fail(403, "无权限清空操作日志");
      }

      const count = operLogService.clear();
      return ok({ count }, "清空成功");
    },
    {
      response: {
        200: CleanOperLogResponseSchema,
        401: OperLogFailResponseSchema,
        403: OperLogFailResponseSchema,
      },
      detail: {
        tags: ["监控管理-操作日志"],
        summary: "清空操作日志",
      },
    }
  );
