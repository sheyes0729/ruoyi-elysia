import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
    ListMenuResponseSchema,
    ListMenuSchema,
    MenuFailResponseSchema,
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
    );
