import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
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
  );
