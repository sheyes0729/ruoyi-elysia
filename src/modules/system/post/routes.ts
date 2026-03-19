import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { toCsv } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
  ListPostResponseSchema,
  ListPostSchema,
  PostFailResponseSchema,
  RemoveBatchPostResponseSchema,
  RemoveBatchPostSchema,
} from "./model";
import { postService } from "./service";

export const PostRoutes = new Elysia({
  prefix: "/api/system/post",
  name: "system.post.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    ({ currentUser, query, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:post:list")) {
        set.status = 403;
        return fail(403, "无权限访问岗位管理");
      }

      return ok(paginateData(postService.list(query), query));
    },
    {
      query: ListPostSchema,
      response: {
        200: ListPostResponseSchema,
        401: PostFailResponseSchema,
        403: PostFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-岗位管理"],
        summary: "查询岗位列表",
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

      if (!hasPermission(currentUser, "system:post:export")) {
        set.status = 403;
        return fail(403, "无权限导出岗位数据");
      }

      const rows = postService.list(query);
      const csv = toCsv(rows, [
        { header: "岗位ID", value: (row) => row.postId },
        { header: "岗位编码", value: (row) => row.postCode },
        { header: "岗位名称", value: (row) => row.postName },
        { header: "显示顺序", value: (row) => row.postSort },
        { header: "状态", value: (row) => row.status },
      ]);

      set.headers["content-type"] = "text/csv; charset=utf-8";
      set.headers["content-disposition"] =
        "attachment; filename=system-post-export.csv";
      return `\uFEFF${csv}`;
    },
    {
      query: ListPostSchema,
      detail: {
        tags: ["系统管理-岗位管理"],
        summary: "导出岗位列表",
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

      if (!hasPermission(currentUser, "system:post:remove")) {
        set.status = 403;
        return fail(403, "无权限删除岗位");
      }

      const count = postService.removeBatch(body.ids);
      return ok({ count }, "删除成功");
    },
    {
      body: RemoveBatchPostSchema,
      response: {
        200: RemoveBatchPostResponseSchema,
        401: PostFailResponseSchema,
        403: PostFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-岗位管理"],
        summary: "批量删除岗位",
      },
    }
  );
