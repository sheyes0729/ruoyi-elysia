import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { ListRoleResponseSchema, RoleFailResponseSchema } from "./model";
import { roleService } from "./service";

export const roleRoutes = new Elysia({
  prefix: "/api/system/role",
  name: "system.role.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    ({ currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:role:list")) {
        set.status = 403;
        return fail(403, "无权限访问角色列表");
      }

      return ok(roleService.list());
    },
    {
      response: {
        200: ListRoleResponseSchema,
        401: RoleFailResponseSchema,
        403: RoleFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-角色"],
        summary: "查询角色列表",
      },
    });
