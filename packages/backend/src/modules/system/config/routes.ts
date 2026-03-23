import { Elysia } from "elysia";
import { secured } from "../../../common/auth/secured";
import { toCsv } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { OPER_LOG } from "./oper-log";
import {
  ConfigFailResponseSchema,
  type CreateConfigBody,
  CreateConfigResponseSchema,
  CreateConfigSchema,
  type ListConfigQuery,
  ListConfigResponseSchema,
  ListConfigSchema,
  RemoveBatchConfigResponseSchema,
  RemoveBatchConfigSchema,
  type UpdateConfigBody,
  UpdateConfigResponseSchema,
  UpdateConfigSchema,
} from "./model";
import { configService } from "./service";

export const ConfigRoutes = new Elysia({
  prefix: "/api/system/config",
  name: "system.config.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    secured(
      {
        permission: "system:config:list",
        denyMessage: "无权限访问参数配置",
      },
      async ({ query }) => {
        const typedQuery = query as ListConfigQuery;
        return ok(
          paginateData(await configService.list(typedQuery), typedQuery),
        );
      },
    ),
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
        description: "分页查询系统参数配置列表",
      },
    },
  )
  .post(
    "/export",
    secured(
      {
        permission: "system:config:export",
        denyMessage: "无权限导出参数配置",
        operLog: OPER_LOG.EXPORT,
      },
      async ({ query, set }) => {
        const typedQuery = query as ListConfigQuery;
        const rows = await configService.list(typedQuery);
        const csv = toCsv(rows, [
          { header: "参数ID", value: (row) => row.configId },
          { header: "参数名称", value: (row) => row.configName },
          { header: "参数键名", value: (row) => row.configKey },
          { header: "参数键值", value: (row) => row.configValue },
          { header: "系统内置", value: (row) => row.configType },
        ]);

        const headers = set.headers as Record<string, string>;
        headers["content-type"] = "text/csv; charset=utf-8";
        headers["content-disposition"] =
          "attachment; filename=system-config-export.csv";
        return `\uFEFF${csv}`;
      },
    ),
    {
      query: ListConfigSchema,
      detail: {
        tags: ["系统管理-参数配置"],
        summary: "导出参数配置列表",
        description: "导出参数配置为CSV文件",
      },
    },
  )
  .delete(
    "/batch",
    secured(
      {
        permission: "system:config:remove",
        denyMessage: "无权限删除参数配置",
        operLog: OPER_LOG.DELETE,
      },
      async ({ body }) => {
        const typedBody = body as typeof RemoveBatchConfigSchema.static;
        const count = await configService.removeBatch(typedBody.ids);
        return ok({ count }, "删除成功");
      },
    ),
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
        description: "根据ID批量删除参数配置",
      },
    },
  )
  .post(
    "/add",
    secured(
      {
        permission: "system:config:add",
        denyMessage: "无权限新增参数配置",
        operLog: OPER_LOG.CREATE,
      },
      async ({ body, set }) => {
        const typedBody = body as CreateConfigBody;
        const result = await configService.create(typedBody);
        if (!result.success) {
          set.status = 409;
          return fail(409, "参数键名已存在");
        }

        return ok({ configId: result.configId }, "新增成功");
      },
    ),
    {
      body: CreateConfigSchema,
      response: {
        200: CreateConfigResponseSchema,
        401: ConfigFailResponseSchema,
        403: ConfigFailResponseSchema,
        409: ConfigFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-参数配置"],
        summary: "新增参数配置",
        description: "创建新的系统参数配置",
      },
    },
  )
  .put(
    "/edit",
    secured(
      {
        permission: "system:config:edit",
        denyMessage: "无权限编辑参数配置",
        operLog: OPER_LOG.UPDATE,
      },
      async ({ body, set }) => {
        const typedBody = body as UpdateConfigBody;
        const result = await configService.update(typedBody);
        if (!result.success) {
          if (result.reason === "config_not_found") {
            set.status = 404;
            return fail(404, "参数配置不存在");
          }

          set.status = 409;
          return fail(409, "参数键名已存在");
        }

        return ok(true, "修改成功");
      },
    ),
    {
      body: UpdateConfigSchema,
      response: {
        200: UpdateConfigResponseSchema,
        401: ConfigFailResponseSchema,
        403: ConfigFailResponseSchema,
        404: ConfigFailResponseSchema,
        409: ConfigFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-参数配置"],
        summary: "编辑参数配置",
        description: "更新指定参数配置信息",
      },
    },
  );
