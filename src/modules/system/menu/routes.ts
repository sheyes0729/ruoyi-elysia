import { Elysia } from "elysia";
import { secured } from "../../../common/auth/secured";
import { toCsv } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { OPER_LOG } from "./oper-log";
import {
  type CreateMenuBody,
  CreateMenuResponseSchema,
  CreateMenuSchema,
  type ListMenuQuery,
  ListMenuResponseSchema,
  ListMenuSchema,
  MenuFailResponseSchema,
  RemoveBatchMenuResponseSchema,
  RemoveBatchMenuSchema,
  type UpdateMenuBody,
  UpdateMenuResponseSchema,
  UpdateMenuSchema,
} from "./model";
import { menuService } from "./service";

export const MenuRoutes = new Elysia({
  prefix: "/api/system/menu",
  name: "system.menu.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    secured(
      {
        permission: "system:menu:list",
        denyMessage: "无权限访问菜单管理",
      },
      async ({ query }) => {
        const typedQuery = query as ListMenuQuery;
        return ok(paginateData(await menuService.list(typedQuery), typedQuery));
      },
    ),
    {
      query: ListMenuSchema,
      response: {
        200: ListMenuResponseSchema,
        401: MenuFailResponseSchema,
        403: MenuFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-菜单管理"],
        summary: "查询菜单列表",
        description:
          "分页查询菜单列表，支持按菜单名称、可见状态筛选。菜单类型包括：目录(M)、菜单(C)、按钮(F)。需具有system:menu:list权限。",
      },
    },
  )
  .post(
    "/export",
    secured(
      {
        permission: "system:menu:export",
        denyMessage: "无权限导出菜单数据",
        operLog: OPER_LOG.EXPORT,
      },
      async ({ query, set }) => {
        const typedQuery = query as ListMenuQuery;
        const rows = await menuService.list(typedQuery);
        const csv = toCsv(rows, [
          { header: "菜单ID", value: (row) => row.menuId },
          { header: "菜单名称", value: (row) => row.menuName },
          { header: "父菜单ID", value: (row) => row.parentId },
          { header: "显示顺序", value: (row) => row.orderNum },
          { header: "路由地址", value: (row) => row.path },
          { header: "组件路径", value: (row) => row.component },
          { header: "菜单类型", value: (row) => row.menuType },
          { header: "权限标识", value: (row) => row.perms },
          { header: "可见状态", value: (row) => row.visible },
          { header: "菜单状态", value: (row) => row.status },
        ]);

        const headers = set.headers as Record<string, string>;
        headers["content-type"] = "text/csv; charset=utf-8";
        headers["content-disposition"] =
          "attachment; filename=system-menu-export.csv";
        return `\uFEFF${csv}`;
      },
    ),
    {
      query: ListMenuSchema,
      detail: {
        tags: ["系统管理-菜单管理"],
        summary: "导出菜单列表",
        description: "导出菜单列表为CSV文件。需具有system:menu:export权限。",
      },
    },
  )
  .delete(
    "/batch",
    secured(
      {
        permission: "system:menu:remove",
        denyMessage: "无权限删除菜单",
        operLog: OPER_LOG.DELETE,
      },
      async ({ body }) => {
        const typedBody = body as typeof RemoveBatchMenuSchema.static;
        const count = await menuService.removeBatch(typedBody.ids);
        return ok({ count }, "删除成功");
      },
    ),
    {
      body: RemoveBatchMenuSchema,
      response: {
        200: RemoveBatchMenuResponseSchema,
        401: MenuFailResponseSchema,
        403: MenuFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-菜单管理"],
        summary: "批量删除菜单",
        description:
          "批量删除指定菜单。删除菜单会同时清除角色与菜单的关联。需具有system:menu:remove权限。",
      },
    },
  )
  .post(
    "/add",
    secured(
      {
        permission: "system:menu:add",
        denyMessage: "无权限新增菜单",
        operLog: OPER_LOG.CREATE,
      },
      async ({ body, set }) => {
        const typedBody = body as CreateMenuBody;
        const result = await menuService.create(typedBody);
        if (!result.success) {
          set.status = 400;
          return fail(400, "父级菜单不存在");
        }

        return ok({ menuId: result.menuId }, "新增成功");
      },
    ),
    {
      body: CreateMenuSchema,
      response: {
        200: CreateMenuResponseSchema,
        400: MenuFailResponseSchema,
        401: MenuFailResponseSchema,
        403: MenuFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-菜单管理"],
        summary: "新增菜单",
        description:
          "创建新菜单，需指定菜单类型、菜单名称、父级菜单、路由地址等。菜单类型包括：目录(M)、菜单(C)、按钮(F)。按钮类型的菜单需要配置权限标识。需具有system:menu:add权限。",
      },
    },
  )
  .put(
    "/edit",
    secured(
      {
        permission: "system:menu:edit",
        denyMessage: "无权限编辑菜单",
        operLog: OPER_LOG.UPDATE,
      },
      async ({ body, set }) => {
        const typedBody = body as UpdateMenuBody;
        const result = await menuService.update(typedBody);
        if (!result.success) {
          if (result.reason === "menu_not_found") {
            set.status = 404;
            return fail(404, "菜单不存在");
          }

          if (result.reason === "invalid_parent") {
            set.status = 400;
            return fail(400, "上级菜单不能选择自身或下级菜单");
          }

          set.status = 400;
          return fail(400, "父级菜单不存在");
        }

        return ok(true, "修改成功");
      },
    ),
    {
      body: UpdateMenuSchema,
      response: {
        200: UpdateMenuResponseSchema,
        400: MenuFailResponseSchema,
        401: MenuFailResponseSchema,
        403: MenuFailResponseSchema,
        404: MenuFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-菜单管理"],
        summary: "编辑菜单",
        description:
          "更新指定菜单的信息。上级菜单不能选择自身或下级菜单。需具有system:menu:edit权限。",
      },
    },
  );
