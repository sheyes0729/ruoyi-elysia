import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
  DictTypeFailResponseSchema,
  ListDictTypeResponseSchema,
  ListDictTypeSchema,
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
  );
