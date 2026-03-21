import { Elysia } from "elysia";
import { secured } from "../../../common/auth/secured";
import { buildCsvDownload } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { OPER_LOG } from "./oper-log";
import {
  CleanOperLogResponseSchema,
  type ListOperLogQuery,
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
    secured(
      {
        permission: "monitor:operlog:list",
        denyMessage: "无权限访问操作日志",
      },
      async ({ query }) => {
        const typedQuery = query as ListOperLogQuery;
        const records = await operLogService.list(typedQuery);
        const total = await operLogService.count(typedQuery);
        return ok(paginateData(records, typedQuery, total));
      },
    ) as any,
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
    },
  )
  .post(
    "/export",
    secured(
      {
        permission: "monitor:operlog:export",
        denyMessage: "无权限导出操作日志",
        operLog: OPER_LOG.EXPORT,
      },
      async ({ query, set }) => {
        const typedQuery = query as ListOperLogQuery;
        const rows = await operLogService.list(typedQuery);
        return buildCsvDownload(
          set,
          rows,
          [
            { header: "日志ID", value: (row) => row.operId },
            { header: "标题", value: (row) => row.title },
            { header: "业务类型", value: (row) => row.businessType },
            { header: "操作人", value: (row) => row.operName },
            { header: "方法", value: (row) => row.method },
            { header: "请求方式", value: (row) => row.requestMethod },
            { header: "地址", value: (row) => row.operUrl },
            { header: "状态", value: (row) => row.status },
            { header: "时间", value: (row) => row.operTime },
          ],
          "monitor-oper-log-export.csv",
        );
      },
    ),
    {
      query: ListOperLogSchema,
      detail: {
        tags: ["监控管理-操作日志"],
        summary: "导出操作日志",
      },
    },
  )
  .delete(
    "/clean",
    secured(
      {
        permission: "monitor:operlog:remove",
        denyMessage: "无权限清空操作日志",
        operLog: OPER_LOG.CLEAN,
      },
      async () => {
        const count = await operLogService.clear();
        return ok({ count }, "清空成功");
      },
    ),
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
    },
  );
