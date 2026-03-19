import { Elysia, t } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
  ForceLogoutOnlineResponseSchema,
  ListOnlineResponseSchema,
  OnlineFailResponseSchema,
} from "./model";
import { onlineService } from "./service";

export const OnlineRoutes = new Elysia({
  prefix: "/api/monitor/online",
  name: "monitor.online.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    ({ currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "monitor:online:list")) {
        set.status = 403;
        return fail(403, "无权限访问在线用户");
      }

      const sessions = onlineService.listSessions();
      return ok(sessions);
    },
    {
      response: {
        200: ListOnlineResponseSchema,
        401: OnlineFailResponseSchema,
        403: OnlineFailResponseSchema,
      },
      detail: {
        tags: ["监控管理-在线用户"],
        summary: "查询在线用户列表",
      },
    }
  )
  .delete(
    "/:token",
    ({ params, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "monitor:online:forceLogout")) {
        set.status = 403;
        return fail(403, "无权限强制下线");
      }

      const removed = onlineService.removeSession(params.token);
      if (!removed) {
        set.status = 404;
        return fail(404, "会话不存在或已下线");
      }

      return ok(true, "下线成功");
    },
    {
      params: t.Object({
        token: t.String({ minLength: 10 }),
      }),
      response: {
        200: ForceLogoutOnlineResponseSchema,
        401: OnlineFailResponseSchema,
        403: OnlineFailResponseSchema,
        404: OnlineFailResponseSchema,
      },
      detail: {
        tags: ["监控管理-在线用户"],
        summary: "强制下线",
      },
    }
  );
