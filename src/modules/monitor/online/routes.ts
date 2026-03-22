import { Elysia, t } from "elysia";
import { secured } from "../../../common/auth/secured";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { OPER_LOG } from "./oper-log";
import {
  ForceLogoutOnlineResponseSchema,
  type ListOnlineQuery,
  ListOnlineSchema,
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
    secured(
      {
        permission: "monitor:online:list",
        denyMessage: "无权限访问在线用户",
      },
      async ({ query }) => {
        const typedQuery = query as ListOnlineQuery;
        const sessions = await onlineService.listSessions(typedQuery);
        return ok(paginateData(sessions, typedQuery));
      },
    ),
    {
      query: ListOnlineSchema,
      response: {
        200: ListOnlineResponseSchema,
        401: OnlineFailResponseSchema,
        403: OnlineFailResponseSchema,
      },
      detail: {
        tags: ["监控管理-在线用户"],
        summary: "查询在线用户列表",
        description:
          "分页查询当前在线用户列表，支持按用户名、IP地址筛选。会话数据存储在Redis中，默认24小时过期自动清除。需具有monitor:online:list权限。",
      },
    },
  )
  .delete(
    "/:token",
    secured(
      {
        permission: "monitor:online:forceLogout",
        denyMessage: "无权限强制下线",
        operLog: OPER_LOG.FORCE_LOGOUT,
      },
      async ({ params, set }) => {
        const typedParams = params as { token: string };
        const removed = await onlineService.removeSession(typedParams.token);
        if (!removed) {
          set.status = 404;
          return fail(404, "会话不存在或已下线");
        }

        return ok(true, "下线成功");
      },
    ),
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
        description:
          "强制指定用户下线，移除其在线会话。会话令牌存储在Redis中。需具有monitor:online:forceLogout权限。",
      },
    },
  );
