import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { buildCsvDownload } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
  ListRoleResponseSchema,
  ListRoleSchema,
  RemoveBatchRoleResponseSchema,
  RemoveBatchRoleSchema,
  RoleFailResponseSchema,
} from "./model";
import { roleService } from "./service";

export const roleRoutes = new Elysia({
  prefix: "/api/system/role",
  name: "system.role.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    ({ currentUser, query, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:role:list")) {
        set.status = 403;
        return fail(403, "无权限访问角色列表");
      }

      return ok(paginateData(roleService.list(query), query));
    },
    {
      query: ListRoleSchema,
      response: {
        200: ListRoleResponseSchema,
        401: RoleFailResponseSchema,
        403: RoleFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-角色"],
        summary: "查询角色列表",
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

      if (!hasPermission(currentUser, "system:role:export")) {
        set.status = 403;
        return fail(403, "无权限导出角色数据");
      }

      const rows = roleService.list(query);
      return buildCsvDownload(
        set,
        rows,
        [
          { header: "角色ID", value: (row) => row.roleId },
          { header: "角色标识", value: (row) => row.roleKey },
          { header: "角色名称", value: (row) => row.roleName },
          { header: "状态", value: (row) => row.status },
        ],
        "system-role-export.csv"
      );
    },
    {
      query: ListRoleSchema,
      detail: {
        tags: ["系统管理-角色"],
        summary: "导出角色列表",
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

      if (!hasPermission(currentUser, "system:role:remove")) {
        set.status = 403;
        return fail(403, "无权限删除角色");
      }

      const count = roleService.removeBatch(body.ids);
      return ok({ count }, "删除成功");
    },
    {
      body: RemoveBatchRoleSchema,
      response: {
        200: RemoveBatchRoleResponseSchema,
        401: RoleFailResponseSchema,
        403: RoleFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-角色"],
        summary: "批量删除角色",
      },
    }
  );
