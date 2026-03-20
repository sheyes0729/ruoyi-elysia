import { Elysia } from "elysia";
import { secured } from "../../../common/auth/secured";
import { toCsv } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { OPER_LOG } from "./oper-log";
import {
  CreateUserBody,
  CreateUserResponseSchema,
  CreateUserSchema,
  ListUserQuery,
  ListUserResponseSchema,
  ListUserSchema,
  ResetPasswordBody,
  ResetPasswordResponseSchema,
  ResetPasswordSchema,
  RemoveBatchUserResponseSchema,
  RemoveBatchUserSchema,
  UpdateUserBody,
  UpdateUserResponseSchema,
  UpdateUserSchema,
  UserFailResponseSchema,
} from "./model";
import { userService } from "./service";

export const userRoutes = new Elysia({
  prefix: "/api/system/user",
  name: "system.user.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    secured(
      {
        permission: "system:user:list",
        denyMessage: "无权限访问用户管理",
      },
      ({ query }) => {
        const typedQuery = query as ListUserQuery;
        return ok(paginateData(userService.list(typedQuery), typedQuery));
      }
    ),
    {
      query: ListUserSchema,
      response: {
        200: ListUserResponseSchema,
        401: UserFailResponseSchema,
        403: UserFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-用户"],
        summary: "查询用户列表",
      },
    }
  )
  .post(
    "/export",
    secured(
      {
        permission: "system:user:export",
        denyMessage: "无权限导出用户数据",
        operLog: OPER_LOG.EXPORT,
      },
      ({ query, set }) => {
        const typedQuery = query as ListUserQuery;
        const rows = userService.list(typedQuery);
        const csv = toCsv(rows, [
          { header: "用户ID", value: (row) => row.userId },
          { header: "用户名", value: (row) => row.username },
          { header: "昵称", value: (row) => row.nickName },
          { header: "状态", value: (row) => row.status },
        ]);

        const headers = set.headers as Record<string, string>;
        headers["content-type"] = "text/csv; charset=utf-8";
        headers["content-disposition"] =
          "attachment; filename=system-user-export.csv";
        return `\uFEFF${csv}`;
      }
    ),
    {
      query: ListUserSchema,
      detail: {
        tags: ["系统管理-用户"],
        summary: "导出用户列表",
      },
    }
  )
  .delete(
    "/batch",
    secured(
      {
        permission: "system:user:remove",
        denyMessage: "无权限删除用户",
        operLog: OPER_LOG.DELETE,
      },
      ({ body }) => {
        const typedBody = body as typeof RemoveBatchUserSchema.static;
        const count = userService.removeBatch(typedBody.ids);
        return ok({ count }, "删除成功");
      }
    ),
    {
      body: RemoveBatchUserSchema,
      response: {
        200: RemoveBatchUserResponseSchema,
        401: UserFailResponseSchema,
        403: UserFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-用户"],
        summary: "批量删除用户",
      },
    }
  )
  .post(
    "/add",
    secured(
      {
        permission: "system:user:add",
        denyMessage: "无权限新增用户",
        operLog: OPER_LOG.CREATE,
      },
      ({ body, set }) => {
        const typedBody = body as CreateUserBody;
        const result = userService.create(typedBody);
        if (!result.success) {
          if (result.reason === "username_exists") {
            set.status = 409;
            return fail(409, "用户名已存在");
          }

          set.status = 400;
          return fail(400, "角色不存在");
        }

        return ok({ userId: result.userId }, "新增成功");
      }
    ),
    {
      body: CreateUserSchema,
      response: {
        200: CreateUserResponseSchema,
        400: UserFailResponseSchema,
        401: UserFailResponseSchema,
        403: UserFailResponseSchema,
        409: UserFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-用户"],
        summary: "新增用户",
      },
    }
  )
  .put(
    "/edit",
    secured(
      {
        permission: "system:user:edit",
        denyMessage: "无权限编辑用户",
        operLog: OPER_LOG.UPDATE,
      },
      ({ body, set }) => {
        const typedBody = body as UpdateUserBody;
        const result = userService.update(typedBody);
        if (!result.success) {
          if (result.reason === "user_not_found") {
            set.status = 404;
            return fail(404, "用户不存在");
          }

          set.status = 400;
          return fail(400, "角色不存在");
        }

        return ok(true, "修改成功");
      }
    ),
    {
      body: UpdateUserSchema,
      response: {
        200: UpdateUserResponseSchema,
        400: UserFailResponseSchema,
        401: UserFailResponseSchema,
        403: UserFailResponseSchema,
        404: UserFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-用户"],
        summary: "编辑用户",
      },
    }
  )
  .put(
    "/resetPwd",
    secured(
      {
        permission: "system:user:resetPwd",
        denyMessage: "无权限重置用户密码",
        operLog: OPER_LOG.RESET_PASSWORD,
      },
      ({ body, set }) => {
        const typedBody = body as ResetPasswordBody;
        const result = userService.resetPassword(typedBody);
        if (!result.success) {
          set.status = 404;
          return fail(404, "用户不存在");
        }

        return ok(true, "重置成功");
      }
    ),
    {
      body: ResetPasswordSchema,
      response: {
        200: ResetPasswordResponseSchema,
        401: UserFailResponseSchema,
        403: UserFailResponseSchema,
        404: UserFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-用户"],
        summary: "重置用户密码",
      },
    }
  );
