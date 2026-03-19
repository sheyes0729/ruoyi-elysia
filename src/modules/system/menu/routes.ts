import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { toCsv } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
    ListMenuResponseSchema,
    ListMenuSchema,
    MenuFailResponseSchema,
    RemoveBatchMenuResponseSchema,
    RemoveBatchMenuSchema,
} from "./model";
import { menuService } from "./service";

export const MenuRoutes = new Elysia({
    prefix: "/api/system/menu",
    name: "system.menu.routes",
})
    .use(securityPlugin)
    .get(
        "/list",
        ({ currentUser, query, set }) => {
            if (!currentUser) {
                set.status = 401;
                return fail(401, "未登录或登录已失效");
            }

            if (!hasPermission(currentUser, "system:menu:list")) {
                set.status = 403;
                return fail(403, "无权限访问菜单管理");
            }

            return ok(paginateData(menuService.list(query), query));
        },
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

            if (!hasPermission(currentUser, "system:menu:export")) {
                set.status = 403;
                return fail(403, "无权限导出菜单数据");
            }

            const rows = menuService.list(query);
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

            set.headers["content-type"] = "text/csv; charset=utf-8";
            set.headers["content-disposition"] =
                "attachment; filename=system-menu-export.csv";
            return `\uFEFF${csv}`;
        },
        {
            query: ListMenuSchema,
            detail: {
                tags: ["系统管理-菜单管理"],
                summary: "导出菜单列表",
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

            if (!hasPermission(currentUser, "system:menu:remove")) {
                set.status = 403;
                return fail(403, "无权限删除菜单");
            }

            const count = menuService.removeBatch(body.ids);
            return ok({ count }, "删除成功");
        },
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
            },
        }
    );
