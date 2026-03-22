import { Elysia } from "elysia";
import { secured } from "../../../common/auth/secured";
import {
  buildCsvDownload,
  buildCsvTemplate,
  parseCsv,
} from "../../../common/http/csv";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { OPER_LOG } from "./oper-log";
import {
  type CreateUserBody,
  CreateUserResponseSchema,
  CreateUserSchema,
  ImportUserResponseSchema,
  ImportUserSchema,
  type ListUserQuery,
  ListUserResponseSchema,
  ListUserSchema,
  type ResetPasswordBody,
  ResetPasswordResponseSchema,
  ResetPasswordSchema,
  RemoveBatchUserResponseSchema,
  RemoveBatchUserSchema,
  type UpdateUserBody,
  UpdateUserResponseSchema,
  UpdateUserSchema,
  USER_IMPORT_HEADERS,
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
      async ({ query }) => {
        const typedQuery = query as ListUserQuery;
        return ok(paginateData(await userService.list(typedQuery), typedQuery));
      },
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
        description:
          "分页查询用户列表，支持按用户名、状态筛选。需具有system:user:list权限。",
      },
    },
  )
  .post(
    "/export",
    secured(
      {
        permission: "system:user:export",
        denyMessage: "无权限导出用户数据",
        operLog: OPER_LOG.EXPORT,
      },
      async ({ query, set }) => {
        const typedQuery = query as ListUserQuery;
        const rows = await userService.list(typedQuery);
        return buildCsvDownload(
          set,
          rows,
          [
            { header: "用户ID", value: (row) => row.userId },
            { header: "用户名", value: (row) => row.username },
            { header: "昵称", value: (row) => row.nickName },
            { header: "状态", value: (row) => row.status },
          ],
          "system-user-export.csv",
        );
      },
    ),
    {
      query: ListUserSchema,
      detail: {
        tags: ["系统管理-用户"],
        summary: "导出用户列表",
        description:
          "导出用户列表为CSV文件，支持按条件筛选。需具有system:user:export权限。",
      },
    },
  )
  .post(
    "/importTemplate",
    secured(
      {
        permission: "system:user:import",
        denyMessage: "无权限导入用户数据",
      },
      ({ set }) => {
        return buildCsvTemplate(set, "system-user-import-template.csv", [
          { key: "用户名", title: "用户名" },
          { key: "昵称", title: "昵称" },
          { key: "密码", title: "密码" },
          { key: "角色ID列表", title: "角色ID列表" },
          { key: "状态", title: "状态" },
        ]);
      },
    ),
    {
      detail: {
        tags: ["系统管理-用户"],
        summary: "下载用户导入模板",
        description:
          "下载用户批量导入的CSV模板文件。需具有system:user:import权限。",
      },
    },
  )
  .post(
    "/import",
    secured(
      {
        permission: "system:user:import",
        denyMessage: "无权限导入用户数据",
        operLog: OPER_LOG.IMPORT,
      },
      async ({ body, set }) => {
        const file = (body as { file?: File }).file;
        if (!file) {
          set.status = 400;
          return fail(400, "请上传文件");
        }

        const content = await file.text();
        let rows: Record<string, string>[];

        try {
          rows = parseCsv(content, {
            headers: [...USER_IMPORT_HEADERS],
            skipEmptyRows: true,
          });
        } catch (e) {
          set.status = 400;
          return fail(400, e instanceof Error ? e.message : "CSV解析失败");
        }

        const result = await userService.importUsers(rows);

        return ok(
          {
            successCount: result.success.length,
            failureCount: result.failures.length,
            errors: result.failures.map((f) => ({
              row: f.row,
              username: f.data["用户名"] || "",
              error: f.error,
            })),
          },
          result.failures.length > 0 ? "部分数据导入失败" : "导入成功",
        );
      },
    ),
    {
      body: ImportUserSchema,
      response: {
        200: ImportUserResponseSchema,
        400: UserFailResponseSchema,
        401: UserFailResponseSchema,
        403: UserFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-用户"],
        summary: "导入用户数据",
        description:
          "批量导入用户数据，支持CSV格式。返回导入成功数和失败数，失败时包含具体错误信息。需具有system:user:import权限。",
      },
    },
  )
  .delete(
    "/batch",
    secured(
      {
        permission: "system:user:remove",
        denyMessage: "无权限删除用户",
        operLog: OPER_LOG.DELETE,
      },
      async ({ body }) => {
        const typedBody = body as typeof RemoveBatchUserSchema.static;
        const count = await userService.removeBatch(typedBody.ids);
        return ok({ count }, "删除成功");
      },
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
        description:
          "批量删除指定ID的用户。删除操作会同时清除用户与角色的关联。需具有system:user:remove权限。",
      },
    },
  )
  .post(
    "/add",
    secured(
      {
        permission: "system:user:add",
        denyMessage: "无权限新增用户",
        operLog: OPER_LOG.CREATE,
      },
      async ({ body, set }) => {
        const typedBody = body as CreateUserBody;
        const result = await userService.create(typedBody);
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
        description:
          "创建新用户，需指定用户名、昵称、密码、状态和角色。用户名校验唯一性。需具有system:user:add权限。",
      },
    },
  )
  .put(
    "/edit",
    secured(
      {
        permission: "system:user:edit",
        denyMessage: "无权限编辑用户",
        operLog: OPER_LOG.UPDATE,
      },
      async ({ body, set }) => {
        const typedBody = body as UpdateUserBody;
        const result = await userService.update(typedBody);
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
        description:
          "更新指定用户的信息，包括昵称、状态、角色分配。需具有system:user:edit权限。",
      },
    },
  )
  .put(
    "/resetPwd",
    secured(
      {
        permission: "system:user:resetPwd",
        denyMessage: "无权限重置用户密码",
        operLog: OPER_LOG.RESET_PASSWORD,
      },
      async ({ body, set }) => {
        const typedBody = body as ResetPasswordBody;
        const result = await userService.resetPassword(typedBody);
        if (!result.success) {
          set.status = 404;
          return fail(404, "用户不存在");
        }

        return ok(true, "重置成功");
      },
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
        description:
          "强制重置指定用户的密码，新密码需符合6-64位长度要求。需具有system:user:resetPwd权限。",
      },
    },
  );
