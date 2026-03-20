import { Elysia } from "elysia";
import { secured } from "../../../common/auth/secured";
import { toCsv } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { OPER_LOG } from "./oper-log";
import {
  type CreatePostBody,
  CreatePostResponseSchema,
  CreatePostSchema,
  type ListPostQuery,
  ListPostResponseSchema,
  ListPostSchema,
  PostFailResponseSchema,
  RemoveBatchPostResponseSchema,
  RemoveBatchPostSchema,
  type UpdatePostBody,
  UpdatePostResponseSchema,
  UpdatePostSchema,
} from "./model";
import { postService } from "./service";

export const PostRoutes = new Elysia({
  prefix: "/api/system/post",
  name: "system.post.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    secured(
      {
        permission: "system:post:list",
        denyMessage: "无权限访问岗位管理",
      },
      ({ query }) => {
        const typedQuery = query as ListPostQuery;
        return ok(paginateData(postService.list(typedQuery), typedQuery));
      }
    ),
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
    secured(
      {
        permission: "system:post:export",
        denyMessage: "无权限导出岗位数据",
        operLog: OPER_LOG.EXPORT,
      },
      ({ query, set }) => {
        const typedQuery = query as ListPostQuery;
        const rows = postService.list(typedQuery);
        const csv = toCsv(rows, [
          { header: "岗位ID", value: (row) => row.postId },
          { header: "岗位编码", value: (row) => row.postCode },
          { header: "岗位名称", value: (row) => row.postName },
          { header: "显示顺序", value: (row) => row.postSort },
          { header: "状态", value: (row) => row.status },
        ]);

        const headers = set.headers as Record<string, string>;
        headers["content-type"] = "text/csv; charset=utf-8";
        headers["content-disposition"] =
          "attachment; filename=system-post-export.csv";
        return `\uFEFF${csv}`;
      }
    ),
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
    secured(
      {
        permission: "system:post:remove",
        denyMessage: "无权限删除岗位",
        operLog: OPER_LOG.DELETE,
      },
      ({ body }) => {
        const typedBody = body as typeof RemoveBatchPostSchema.static;
        const count = postService.removeBatch(typedBody.ids);
        return ok({ count }, "删除成功");
      }
    ),
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
  )
  .post(
    "/add",
    secured(
      {
        permission: "system:post:add",
        denyMessage: "无权限新增岗位",
        operLog: OPER_LOG.CREATE,
      },
      ({ body, set }) => {
        const typedBody = body as CreatePostBody;
        const result = postService.create(typedBody);
        if (!result.success) {
          set.status = 409;
          return fail(409, "岗位编码已存在");
        }

        return ok({ postId: result.postId }, "新增成功");
      }
    ),
    {
      body: CreatePostSchema,
      response: {
        200: CreatePostResponseSchema,
        401: PostFailResponseSchema,
        403: PostFailResponseSchema,
        409: PostFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-岗位管理"],
        summary: "新增岗位",
      },
    }
  )
  .put(
    "/edit",
    secured(
      {
        permission: "system:post:edit",
        denyMessage: "无权限编辑岗位",
        operLog: OPER_LOG.UPDATE,
      },
      ({ body, set }) => {
        const typedBody = body as UpdatePostBody;
        const result = postService.update(typedBody);
        if (!result.success) {
          if (result.reason === "post_not_found") {
            set.status = 404;
            return fail(404, "岗位不存在");
          }

          set.status = 409;
          return fail(409, "岗位编码已存在");
        }

        return ok(true, "修改成功");
      }
    ),
    {
      body: UpdatePostSchema,
      response: {
        200: UpdatePostResponseSchema,
        401: PostFailResponseSchema,
        403: PostFailResponseSchema,
        404: PostFailResponseSchema,
        409: PostFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-岗位管理"],
        summary: "编辑岗位",
      },
    }
  );
