import { Elysia } from "elysia";
import { secured } from "../../../common/auth/secured";
import {
  buildCsvDownload,
  buildCsvTemplate,
  parseCsv,
} from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { OPER_LOG } from "./oper-log";
import {
  type CreateDictDataBody,
  CreateDictDataResponseSchema,
  CreateDictDataSchema,
  DICT_DATA_IMPORT_HEADERS,
  DictDataFailResponseSchema,
  ImportDictDataResponseSchema,
  ImportDictDataSchema,
  type ListDictDataQuery,
  ListDictDataResponseSchema,
  ListDictDataSchema,
  RemoveBatchDictDataResponseSchema,
  RemoveBatchDictDataSchema,
  type UpdateDictDataBody,
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
      async ({ query }) => {
        const typedQuery = query as ListDictDataQuery;
        return ok(
          paginateData(await dictDataService.list(typedQuery), typedQuery),
        );
      },
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
        description: "分页查询字典数据列表",
      },
    },
  )
  .post(
    "/export",
    secured(
      {
        permission: "system:dict:data:export",
        denyMessage: "无权限导出字典数据",
        operLog: OPER_LOG.EXPORT,
      },
      async ({ query, set }) => {
        const typedQuery = query as ListDictDataQuery;
        const rows = await dictDataService.list(typedQuery);
        return buildCsvDownload(
          set,
          rows,
          [
            { header: "字典编码", value: (row) => row.dictCode },
            { header: "字典排序", value: (row) => row.dictSort },
            { header: "字典标签", value: (row) => row.dictLabel },
            { header: "字典键值", value: (row) => row.dictValue },
            { header: "字典类型", value: (row) => row.dictType },
            { header: "状态", value: (row) => row.status },
          ],
          "system-dict-data-export.csv",
        );
      },
    ),
    {
      query: ListDictDataSchema,
      detail: {
        tags: ["系统管理-字典数据"],
        summary: "导出字典数据列表",
        description: "导出字典数据为CSV文件",
      },
    },
  )
  .post(
    "/importTemplate",
    secured(
      {
        permission: "system:dict:data:import",
        denyMessage: "无权限导入字典数据",
      },
      ({ set }) => {
        return buildCsvTemplate(set, "system-dict-data-import-template.csv", [
          { key: "字典排序", title: "字典排序" },
          { key: "字典标签", title: "字典标签" },
          { key: "字典键值", title: "字典键值" },
          { key: "字典类型", title: "字典类型" },
          { key: "状态", title: "状态" },
        ]);
      },
    ),
    {
      detail: {
        tags: ["系统管理-字典数据"],
        summary: "下载字典数据导入模板",
        description: "下载CSV导入模板",
      },
    },
  )
  .post(
    "/import",
    secured(
      {
        permission: "system:dict:data:import",
        denyMessage: "无权限导入字典数据",
        operLog: OPER_LOG.IMPORT,
      },
      async ({ body, set }) => {
        const file = (body as { file?: File }).file;
        if (!file) {
          set.status = 400;
          return fail(400, "请上传文件");
        }

        const content = await file.text();
        let rows: Record<string, string>[];

        try {
          rows = parseCsv(content, {
            headers: [...DICT_DATA_IMPORT_HEADERS],
            skipEmptyRows: true,
          });
        } catch (e) {
          set.status = 400;
          return fail(400, e instanceof Error ? e.message : "CSV解析失败");
        }

        const result = await dictDataService.importDictData(rows);

        return ok(
          {
            successCount: result.success.length,
            failureCount: result.failures.length,
            errors: result.failures.map((f) => ({
              row: f.row,
              dictLabel: f.data["字典标签"] || "",
              error: f.error,
            })),
          },
          result.failures.length > 0 ? "部分数据导入失败" : "导入成功",
        );
      },
    ),
    {
      body: ImportDictDataSchema,
      response: {
        200: ImportDictDataResponseSchema,
        400: DictDataFailResponseSchema,
        401: DictDataFailResponseSchema,
        403: DictDataFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-字典数据"],
        summary: "导入字典数据",
        description: "从CSV文件导入字典数据",
      },
    },
  )
  .delete(
    "/batch",
    secured(
      {
        permission: "system:dict:data:remove",
        denyMessage: "无权限删除字典数据",
        operLog: OPER_LOG.DELETE,
      },
      async ({ body }) => {
        const typedBody = body as typeof RemoveBatchDictDataSchema.static;
        const count = await dictDataService.removeBatch(typedBody.ids);
        return ok({ count }, "删除成功");
      },
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
        description: "根据ID批量删除字典数据",
      },
    },
  )
  .post(
    "/add",
    secured(
      {
        permission: "system:dict:data:add",
        denyMessage: "无权限新增字典数据",
        operLog: OPER_LOG.CREATE,
      },
      async ({ body, set }) => {
        const typedBody = body as CreateDictDataBody;
        const result = await dictDataService.create(typedBody);
        if (!result.success) {
          set.status = 400;
          return fail(400, "字典类型不存在");
        }

        return ok({ dictCode: result.dictCode }, "新增成功");
      },
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
        description: "创建新的字典数据",
      },
    },
  )
  .put(
    "/edit",
    secured(
      {
        permission: "system:dict:data:edit",
        denyMessage: "无权限编辑字典数据",
        operLog: OPER_LOG.UPDATE,
      },
      async ({ body, set }) => {
        const typedBody = body as UpdateDictDataBody;
        const result = await dictDataService.update(typedBody);
        if (!result.success) {
          if (result.reason === "dict_data_not_found") {
            set.status = 404;
            return fail(404, "字典数据不存在");
          }

          set.status = 400;
          return fail(400, "字典类型不存在");
        }

        return ok(true, "修改成功");
      },
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
        description: "更新指定字典数据信息",
      },
    },
  );
