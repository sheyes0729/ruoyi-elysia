import { Elysia } from "elysia";
import { secured } from "../../../common/auth/secured";
import { buildCsvDownload } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { OPER_LOG } from "./oper-log";
import {
  type AuthRoleMenuBody,
  AuthRoleMenuResponseSchema,
  AuthRoleMenuSchema,
  type CreateRoleBody,
  CreateRoleResponseSchema,
  CreateRoleSchema,
  type ListRoleQuery,
  ListRoleResponseSchema,
  ListRoleSchema,
  RemoveBatchRoleResponseSchema,
  RemoveBatchRoleSchema,
  RoleFailResponseSchema,
  type UpdateRoleBody,
  UpdateRoleResponseSchema,
  UpdateRoleSchema,
} from "./model";
import { roleService } from "./service";

export const roleRoutes = new Elysia({
  prefix: "/api/system/role",
  name: "system.role.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    secured(
      {
        permission: "system:role:list",
        denyMessage: "无权限访问角色管理",
      },
      async ({ query }) => {
        const typedQuery = query as ListRoleQuery;
        return ok(paginateData(await roleService.list(typedQuery), typedQuery));
      },
    ),
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
    },
  )
  .post(
    "/export",
    secured(
      {
        permission: "system:role:export",
        denyMessage: "无权限导出角色数据",
        operLog: OPER_LOG.EXPORT,
      },
      async ({ query, set }) => {
        const typedQuery = query as ListRoleQuery;
        const rows = await roleService.list(typedQuery);
        return buildCsvDownload(
          set,
          rows,
          [
            { header: "角色ID", value: (row) => row.roleId },
            { header: "角色标识", value: (row) => row.roleKey },
            { header: "角色名称", value: (row) => row.roleName },
            { header: "状态", value: (row) => row.status },
          ],
          "system-role-export.csv",
        );
      },
    ),
    {
      query: ListRoleSchema,
      detail: {
        tags: ["系统管理-角色"],
        summary: "导出角色列表",
      },
    },
  )
  .delete(
    "/batch",
    secured(
      {
        permission: "system:role:remove",
        denyMessage: "无权限删除角色",
        operLog: OPER_LOG.DELETE,
      },
      async ({ body }) => {
        const typedBody = body as typeof RemoveBatchRoleSchema.static;
        const count = await roleService.removeBatch(typedBody.ids);
        return ok({ count }, "删除成功");
      },
    ),
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
    },
  )
  .post(
    "/add",
    secured(
      {
        permission: "system:role:add",
        denyMessage: "无权限新增角色",
        operLog: OPER_LOG.CREATE,
      },
      async ({ body, set }) => {
        const typedBody = body as CreateRoleBody;
        const result = await roleService.create(typedBody);
        if (!result.success) {
          if (result.reason === "role_key_exists") {
            set.status = 409;
            return fail(409, "角色标识已存在");
          }

          set.status = 400;
          return fail(400, "菜单不存在");
        }

        return ok({ roleId: result.roleId }, "新增成功");
      },
    ),
    {
      body: CreateRoleSchema,
      response: {
        200: CreateRoleResponseSchema,
        400: RoleFailResponseSchema,
        401: RoleFailResponseSchema,
        403: RoleFailResponseSchema,
        409: RoleFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-角色"],
        summary: "新增角色",
      },
    },
  )
  .put(
    "/edit",
    secured(
      {
        permission: "system:role:edit",
        denyMessage: "无权限编辑角色",
        operLog: OPER_LOG.UPDATE,
      },
      async ({ body, set }) => {
        const typedBody = body as UpdateRoleBody;
        const result = await roleService.update(typedBody);
        if (!result.success) {
          if (result.reason === "role_not_found") {
            set.status = 404;
            return fail(404, "角色不存在");
          }

          set.status = 400;
          return fail(400, "菜单不存在");
        }

        return ok(true, "修改成功");
      },
    ),
    {
      body: UpdateRoleSchema,
      response: {
        200: UpdateRoleResponseSchema,
        400: RoleFailResponseSchema,
        401: RoleFailResponseSchema,
        403: RoleFailResponseSchema,
        404: RoleFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-角色"],
        summary: "编辑角色",
      },
    },
  )
  .put(
    "/authMenu",
    secured(
      {
        permission: "system:role:auth",
        denyMessage: "无权限分配角色菜单",
        operLog: OPER_LOG.GRANT_MENU,
      },
      async ({ body, set }) => {
        const typedBody = body as AuthRoleMenuBody;
        const result = await roleService.authMenu(typedBody);
        if (!result.success) {
          if (result.reason === "role_not_found") {
            set.status = 404;
            return fail(404, "角色不存在");
          }

          set.status = 400;
          return fail(400, "菜单不存在");
        }

        return ok(true, "授权成功");
      },
    ),
    {
      body: AuthRoleMenuSchema,
      response: {
        200: AuthRoleMenuResponseSchema,
        400: RoleFailResponseSchema,
        401: RoleFailResponseSchema,
        403: RoleFailResponseSchema,
        404: RoleFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-角色"],
        summary: "角色菜单授权",
      },
    },
  );
