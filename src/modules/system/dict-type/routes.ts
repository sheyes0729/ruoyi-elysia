import { Elysia } from "elysia";
import { secured } from "../../../common/auth/secured";
import { toCsv } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { OPER_LOG } from "./oper-log";
import {
  CreateDictTypeBody,
  CreateDictTypeResponseSchema,
  CreateDictTypeSchema,
  DictTypeFailResponseSchema,
  ListDictTypeQuery,
  ListDictTypeResponseSchema,
  ListDictTypeSchema,
  RemoveBatchDictTypeResponseSchema,
  RemoveBatchDictTypeSchema,
  UpdateDictTypeBody,
  UpdateDictTypeResponseSchema,
  UpdateDictTypeSchema,
} from "./model";
import { dictTypeService } from "./service";

export const DictTypeRoutes = new Elysia({
  prefix: "/api/system/dict/type",
  name: "system.dict-type.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    secured(
      {
        permission: "system:dict:type:list",
        denyMessage: "无权限访问字典类型",
      },
      ({ query }) => {
        const typedQuery = query as ListDictTypeQuery;
        return ok(paginateData(dictTypeService.list(typedQuery), typedQuery));
      }
    ),
    {
      query: ListDictTypeSchema,
      response: {
        200: ListDictTypeResponseSchema,
        401: DictTypeFailResponseSchema,
        403: DictTypeFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-字典类型"],
        summary: "查询字典类型列表",
      },
    }
  )
  .post(
    "/export",
    secured(
      {
        permission: "system:dict:type:export",
        denyMessage: "无权限导出字典类型",
        operLog: OPER_LOG.EXPORT,
      },
      ({ query, set }) => {
        const typedQuery = query as ListDictTypeQuery;
        const rows = dictTypeService.list(typedQuery);
        const csv = toCsv(rows, [
          { header: "字典ID", value: (row) => row.dictId },
          { header: "字典名称", value: (row) => row.dictName },
          { header: "字典类型", value: (row) => row.dictType },
          { header: "状态", value: (row) => row.status },
        ]);

        const headers = set.headers as Record<string, string>;
        headers["content-type"] = "text/csv; charset=utf-8";
        headers["content-disposition"] =
          "attachment; filename=system-dict-type-export.csv";
        return `\uFEFF${csv}`;
      }
    ),
    {
      query: ListDictTypeSchema,
      detail: {
        tags: ["系统管理-字典类型"],
        summary: "导出字典类型列表",
      },
    }
  )
  .delete(
    "/batch",
    secured(
      {
        permission: "system:dict:type:remove",
        denyMessage: "无权限删除字典类型",
        operLog: OPER_LOG.DELETE,
      },
      ({ body }) => {
        const typedBody = body as typeof RemoveBatchDictTypeSchema.static;
        const count = dictTypeService.removeBatch(typedBody.ids);
        return ok({ count }, "删除成功");
      }
    ),
    {
      body: RemoveBatchDictTypeSchema,
      response: {
        200: RemoveBatchDictTypeResponseSchema,
        401: DictTypeFailResponseSchema,
        403: DictTypeFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-字典类型"],
        summary: "批量删除字典类型",
      },
    }
  )
  .post(
    "/add",
    secured(
      {
        permission: "system:dict:type:add",
        denyMessage: "无权限新增字典类型",
        operLog: OPER_LOG.CREATE,
      },
      ({ body, set }) => {
        const typedBody = body as CreateDictTypeBody;
        const result = dictTypeService.create(typedBody);
        if (!result.success) {
          set.status = 409;
          return fail(409, "字典类型已存在");
        }

        return ok({ dictId: result.dictId }, "新增成功");
      }
    ),
    {
      body: CreateDictTypeSchema,
      response: {
        200: CreateDictTypeResponseSchema,
        401: DictTypeFailResponseSchema,
        403: DictTypeFailResponseSchema,
        409: DictTypeFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-字典类型"],
        summary: "新增字典类型",
      },
    }
  )
  .put(
    "/edit",
    secured(
      {
        permission: "system:dict:type:edit",
        denyMessage: "无权限编辑字典类型",
        operLog: OPER_LOG.UPDATE,
      },
      ({ body, set }) => {
        const typedBody = body as UpdateDictTypeBody;
        const result = dictTypeService.update(typedBody);
        if (!result.success) {
          if (result.reason === "dict_type_not_found") {
            set.status = 404;
            return fail(404, "字典类型不存在");
          }

          set.status = 409;
          return fail(409, "字典类型已存在");
        }

        return ok(true, "修改成功");
      }
    ),
    {
      body: UpdateDictTypeSchema,
      response: {
        200: UpdateDictTypeResponseSchema,
        401: DictTypeFailResponseSchema,
        403: DictTypeFailResponseSchema,
        404: DictTypeFailResponseSchema,
        409: DictTypeFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-字典类型"],
        summary: "编辑字典类型",
      },
    }
  );
