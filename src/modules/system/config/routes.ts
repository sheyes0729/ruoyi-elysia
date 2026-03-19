import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { toCsv } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
  ConfigFailResponseSchema,
  ListConfigResponseSchema,
  ListConfigSchema,
  RemoveBatchConfigResponseSchema,
  RemoveBatchConfigSchema,
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
  )
  .post(
    "/export",
    ({ currentUser, query, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:config:export")) {
        set.status = 403;
        return fail(403, "无权限导出参数配置");
      }

      const rows = configService.list(query);
      const csv = toCsv(rows, [
        { header: "参数ID", value: (row) => row.configId },
        { header: "参数名称", value: (row) => row.configName },
        { header: "参数键名", value: (row) => row.configKey },
        { header: "参数键值", value: (row) => row.configValue },
        { header: "系统内置", value: (row) => row.configType },
      ]);

      set.headers["content-type"] = "text/csv; charset=utf-8";
      set.headers["content-disposition"] =
        "attachment; filename=system-config-export.csv";
      return `\uFEFF${csv}`;
    },
    {
      query: ListConfigSchema,
      detail: {
        tags: ["系统管理-参数配置"],
        summary: "导出参数配置列表",
      },
    }
  )
  .delete(
    "/batch",
    ({ body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:config:remove")) {
        set.status = 403;
        return fail(403, "无权限删除参数配置");
      }

      const count = configService.removeBatch(body.ids);
      return ok({ count }, "删除成功");
    },
    {
      body: RemoveBatchConfigSchema,
      response: {
        200: RemoveBatchConfigResponseSchema,
        401: ConfigFailResponseSchema,
        403: ConfigFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-参数配置"],
        summary: "批量删除参数配置",
      },
    }
  );
