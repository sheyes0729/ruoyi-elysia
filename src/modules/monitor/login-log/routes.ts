import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
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
  );
