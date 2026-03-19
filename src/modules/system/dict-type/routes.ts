import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { toCsv } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
  DictTypeFailResponseSchema,
  ListDictTypeResponseSchema,
  ListDictTypeSchema,
  RemoveBatchDictTypeResponseSchema,
  RemoveBatchDictTypeSchema,
} from "./model";
import { dictTypeService } from "./service";

export const DictTypeRoutes = new Elysia({
  prefix: "/api/system/dict/type",
  name: "system.dict-type.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    ({ currentUser, query, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:dict:type:list")) {
        set.status = 403;
        return fail(403, "无权限访问字典类型");
      }

      return ok(paginateData(dictTypeService.list(query), query));
    },
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
    ({ currentUser, query, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:dict:type:export")) {
        set.status = 403;
        return fail(403, "无权限导出字典类型");
      }

      const rows = dictTypeService.list(query);
      const csv = toCsv(rows, [
        { header: "字典ID", value: (row) => row.dictId },
        { header: "字典名称", value: (row) => row.dictName },
        { header: "字典类型", value: (row) => row.dictType },
        { header: "状态", value: (row) => row.status },
      ]);

      set.headers["content-type"] = "text/csv; charset=utf-8";
      set.headers["content-disposition"] =
        "attachment; filename=system-dict-type-export.csv";
      return `\uFEFF${csv}`;
    },
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
    ({ body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:dict:type:remove")) {
        set.status = 403;
        return fail(403, "无权限删除字典类型");
      }

      const count = dictTypeService.removeBatch(body.ids);
      return ok({ count }, "删除成功");
    },
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
  );
