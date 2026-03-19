import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { toCsv } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
  DictDataFailResponseSchema,
  ListDictDataResponseSchema,
  ListDictDataSchema,
  RemoveBatchDictDataResponseSchema,
  RemoveBatchDictDataSchema,
} from "./model";
import { dictDataService } from "./service";

export const DictDataRoutes = new Elysia({
  prefix: "/api/system/dict/data",
  name: "system.dict-data.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    ({ currentUser, query, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:dict:data:list")) {
        set.status = 403;
        return fail(403, "无权限访问字典数据");
      }

      return ok(paginateData(dictDataService.list(query), query));
    },
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
    ({ currentUser, query, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:dict:data:export")) {
        set.status = 403;
        return fail(403, "无权限导出字典数据");
      }

      const rows = dictDataService.list(query);
      const csv = toCsv(rows, [
        { header: "字典编码", value: (row) => row.dictCode },
        { header: "字典排序", value: (row) => row.dictSort },
        { header: "字典标签", value: (row) => row.dictLabel },
        { header: "字典键值", value: (row) => row.dictValue },
        { header: "字典类型", value: (row) => row.dictType },
        { header: "状态", value: (row) => row.status },
      ]);

      set.headers["content-type"] = "text/csv; charset=utf-8";
      set.headers["content-disposition"] =
        "attachment; filename=system-dict-data-export.csv";
      return `\uFEFF${csv}`;
    },
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
    ({ body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:dict:data:remove")) {
        set.status = 403;
        return fail(403, "无权限删除字典数据");
      }

      const count = dictDataService.removeBatch(body.ids);
      return ok({ count }, "删除成功");
    },
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
  );
