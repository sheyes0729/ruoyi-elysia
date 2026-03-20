import { Elysia, t } from "elysia";
import { secured } from "../../../common/auth/secured";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { OPER_LOG } from "./oper-log";
import {
  ForceLogoutOnlineResponseSchema,
  ListOnlineQuery,
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
      ({ query }) => {
        const typedQuery = query as ListOnlineQuery;
        const sessions = onlineService.listSessions(typedQuery);
        return ok(paginateData(sessions, typedQuery));
      }
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
      },
    }
  )
  .delete(
    "/:token",
    secured(
      {
        permission: "monitor:online:forceLogout",
        denyMessage: "无权限强制下线",
        operLog: OPER_LOG.FORCE_LOGOUT,
      },
      ({ params, set }) => {
        const typedParams = params as { token: string };
        const removed = onlineService.removeSession(typedParams.token);
        if (!removed) {
          set.status = 404;
          return fail(404, "会话不存在或已下线");
        }

        return ok(true, "下线成功");
      }
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
      },
    }
  );
