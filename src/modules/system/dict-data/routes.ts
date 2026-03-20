import { Elysia } from "elysia";
import { secured } from "../../../common/auth/secured";
import { toCsv } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { OPER_LOG } from "./oper-log";
import {
  CreateDictDataBody,
  CreateDictDataResponseSchema,
  CreateDictDataSchema,
  DictDataFailResponseSchema,
  ListDictDataQuery,
  ListDictDataResponseSchema,
  ListDictDataSchema,
  RemoveBatchDictDataResponseSchema,
  RemoveBatchDictDataSchema,
  UpdateDictDataBody,
  UpdateDictDataResponseSchema,
  UpdateDictDataSchema,
} from "./model";
import { dictDataService } from "./service";

export const DictDataRoutes = new Elysia({
  prefix: "/api/system/dict/data",
  name: "system.dict-data.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    secured(
      {
        permission: "system:dict:data:list",
        denyMessage: "无权限访问字典数据",
      },
      ({ query }) => {
        const typedQuery = query as ListDictDataQuery;
        return ok(paginateData(dictDataService.list(typedQuery), typedQuery));
      }
    ),
    {
      query: ListDictDataSchema,
      response: {
        200: ListDictDataResponseSchema,
        401: DictDataFailResponseSchema,
        403: DictDataFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-字典数据"],
        summary: "查询字典数据列表",
      },
    }
  )
  .post(
    "/export",
    secured(
      {
        permission: "system:dict:data:export",
        denyMessage: "无权限导出字典数据",
        operLog: OPER_LOG.EXPORT,
      },
      ({ query, set }) => {
        const typedQuery = query as ListDictDataQuery;
        const rows = dictDataService.list(typedQuery);
        const csv = toCsv(rows, [
          { header: "字典编码", value: (row) => row.dictCode },
          { header: "字典排序", value: (row) => row.dictSort },
          { header: "字典标签", value: (row) => row.dictLabel },
          { header: "字典键值", value: (row) => row.dictValue },
          { header: "字典类型", value: (row) => row.dictType },
          { header: "状态", value: (row) => row.status },
        ]);

        const headers = set.headers as Record<string, string>;
        headers["content-type"] = "text/csv; charset=utf-8";
        headers["content-disposition"] =
          "attachment; filename=system-dict-data-export.csv";
        return `\uFEFF${csv}`;
      }
    ),
    {
      query: ListDictDataSchema,
      detail: {
        tags: ["系统管理-字典数据"],
        summary: "导出字典数据列表",
      },
    }
  )
  .delete(
    "/batch",
    secured(
      {
        permission: "system:dict:data:remove",
        denyMessage: "无权限删除字典数据",
        operLog: OPER_LOG.DELETE,
      },
      ({ body }) => {
        const typedBody = body as typeof RemoveBatchDictDataSchema.static;
        const count = dictDataService.removeBatch(typedBody.ids);
        return ok({ count }, "删除成功");
      }
    ),
    {
      body: RemoveBatchDictDataSchema,
      response: {
        200: RemoveBatchDictDataResponseSchema,
        401: DictDataFailResponseSchema,
        403: DictDataFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-字典数据"],
        summary: "批量删除字典数据",
      },
    }
  )
  .post(
    "/add",
    secured(
      {
        permission: "system:dict:data:add",
        denyMessage: "无权限新增字典数据",
        operLog: OPER_LOG.CREATE,
      },
      ({ body, set }) => {
        const typedBody = body as CreateDictDataBody;
        const result = dictDataService.create(typedBody);
        if (!result.success) {
          set.status = 400;
          return fail(400, "字典类型不存在");
        }

        return ok({ dictCode: result.dictCode }, "新增成功");
      }
    ),
    {
      body: CreateDictDataSchema,
      response: {
        200: CreateDictDataResponseSchema,
        400: DictDataFailResponseSchema,
        401: DictDataFailResponseSchema,
        403: DictDataFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-字典数据"],
        summary: "新增字典数据",
      },
    }
  )
  .put(
    "/edit",
    secured(
      {
        permission: "system:dict:data:edit",
        denyMessage: "无权限编辑字典数据",
        operLog: OPER_LOG.UPDATE,
      },
      ({ body, set }) => {
        const typedBody = body as UpdateDictDataBody;
        const result = dictDataService.update(typedBody);
        if (!result.success) {
          if (result.reason === "dict_data_not_found") {
            set.status = 404;
            return fail(404, "字典数据不存在");
          }

          set.status = 400;
          return fail(400, "字典类型不存在");
        }

        return ok(true, "修改成功");
      }
    ),
    {
      body: UpdateDictDataSchema,
      response: {
        200: UpdateDictDataResponseSchema,
        400: DictDataFailResponseSchema,
        401: DictDataFailResponseSchema,
        403: DictDataFailResponseSchema,
        404: DictDataFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-字典数据"],
        summary: "编辑字典数据",
      },
    }
  );
