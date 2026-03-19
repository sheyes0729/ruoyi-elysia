import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
  DeptFailResponseSchema,
  ListDeptResponseSchema,
  ListDeptSchema,
} from "./model";
import { deptService } from "./service";

export const DeptRoutes = new Elysia({
  prefix: "/api/system/dept",
  name: "system.dept.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    ({ currentUser, query, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:dept:list")) {
        set.status = 403;
        return fail(403, "无权限访问部门管理");
      }

      return ok(deptService.list(query));
    },
    {
      query: ListDeptSchema,
      response: {
        200: ListDeptResponseSchema,
        401: DeptFailResponseSchema,
        403: DeptFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-部门管理"],
        summary: "查询部门树列表",
      },
    }
  );
