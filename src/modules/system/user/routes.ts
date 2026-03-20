import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { toCsv } from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
  CreateUserResponseSchema,
  CreateUserSchema,
  ListUserResponseSchema,
  ListUserSchema,
  ResetPasswordResponseSchema,
  ResetPasswordSchema,
  RemoveBatchUserResponseSchema,
  RemoveBatchUserSchema,
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
    ({ currentUser, query, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:user:list")) {
        set.status = 403;
        return fail(403, "无权限访问用户列表");
      }

      return ok(paginateData(userService.list(query), query));
    },
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
    ({ currentUser, query, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:user:export")) {
        set.status = 403;
        return fail(403, "无权限导出用户数据");
      }

      const rows = userService.list(query);
      const csv = toCsv(rows, [
        { header: "用户ID", value: (row) => row.userId },
        { header: "用户名", value: (row) => row.username },
        { header: "昵称", value: (row) => row.nickName },
        { header: "状态", value: (row) => row.status },
      ]);

      set.headers["content-type"] = "text/csv; charset=utf-8";
      set.headers["content-disposition"] =
        "attachment; filename=system-user-export.csv";
      return `\uFEFF${csv}`;
    },
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
    ({ body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:user:remove")) {
        set.status = 403;
        return fail(403, "无权限删除用户");
      }

      const count = userService.removeBatch(body.ids);
      return ok({ count }, "删除成功");
    },
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
    ({ body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:user:add")) {
        set.status = 403;
        return fail(403, "无权限新增用户");
      }

      const result = userService.create(body);
      if (!result.success) {
        if (result.reason === "username_exists") {
          set.status = 409;
          return fail(409, "用户名已存在");
        }

        set.status = 400;
        return fail(400, "角色不存在");
      }

      return ok({ userId: result.userId }, "新增成功");
    },
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
    ({ body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:user:edit")) {
        set.status = 403;
        return fail(403, "无权限编辑用户");
      }

      const result = userService.update(body);
      if (!result.success) {
        if (result.reason === "user_not_found") {
          set.status = 404;
          return fail(404, "用户不存在");
        }

        set.status = 400;
        return fail(400, "角色不存在");
      }

      return ok(true, "修改成功");
    },
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
    ({ body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:user:resetPwd")) {
        set.status = 403;
        return fail(403, "无权限重置密码");
      }

      const result = userService.resetPassword(body);
      if (!result.success) {
        set.status = 404;
        return fail(404, "用户不存在");
      }

      return ok(true, "重置成功");
    },
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
