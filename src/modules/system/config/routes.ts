import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
  ConfigFailResponseSchema,
  ListConfigResponseSchema,
  ListConfigSchema,
} from "./model";
import { configService } from "./service";

export const ConfigRoutes = new Elysia({
  prefix: "/api/system/config",
  name: "system.config.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    ({ currentUser, query, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:config:list")) {
        set.status = 403;
        return fail(403, "无权限访问参数配置");
      }

      return ok(paginateData(configService.list(query), query));
    },
    {
      query: ListConfigSchema,
      response: {
        200: ListConfigResponseSchema,
        401: ConfigFailResponseSchema,
        403: ConfigFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-参数配置"],
        summary: "查询参数配置列表",
      },
    }
  );
