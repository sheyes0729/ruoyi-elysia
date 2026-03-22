import { Elysia } from "elysia";
import { secured } from "../../../common/auth/secured";
import { toCsv } from "../../../common/http/csv";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { OPER_LOG } from "./oper-log";
import {
  type CreateDeptBody,
  CreateDeptResponseSchema,
  CreateDeptSchema,
  DeptFailResponseSchema,
  type ListDeptQuery,
  ListDeptResponseSchema,
  ListDeptSchema,
  RemoveBatchDeptResponseSchema,
  RemoveBatchDeptSchema,
  type UpdateDeptBody,
  UpdateDeptResponseSchema,
  UpdateDeptSchema,
} from "./model";
import { deptService } from "./service";

export const DeptRoutes = new Elysia({
  prefix: "/api/system/dept",
  name: "system.dept.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    secured(
      {
        permission: "system:dept:list",
        denyMessage: "无权限访问部门管理",
      },
      async ({ query, currentUser }) => {
        const typedQuery = query as ListDeptQuery;
        return ok(await deptService.list(typedQuery, currentUser.userId));
      },
    ),
    {
      query: ListDeptSchema,
      response: {
        200: ListDeptResponseSchema,
        401: DeptFailResponseSchema,
        403: DeptFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-部门管理"],
        summary: "查询部门树列表",
        description:
          "查询部门列表并构建树形结构返回。根据当前用户角色数据范围过滤结果。需具有system:dept:list权限。",
      },
    },
  )
  .post(
    "/export",
    secured(
      {
        permission: "system:dept:export",
        denyMessage: "无权限导出部门数据",
        operLog: OPER_LOG.EXPORT,
      },
      async ({ query, set, currentUser }) => {
        const typedQuery = query as ListDeptQuery;
        const rows = await deptService.listFlat(typedQuery, currentUser.userId);
        const csv = toCsv(rows, [
          { header: "部门ID", value: (row) => row.deptId },
          { header: "父部门ID", value: (row) => row.parentId },
          { header: "部门名称", value: (row) => row.deptName },
          { header: "显示顺序", value: (row) => row.orderNum },
          { header: "状态", value: (row) => row.status },
        ]);

        const headers = set.headers as Record<string, string>;
        headers["content-type"] = "text/csv; charset=utf-8";
        headers["content-disposition"] =
          "attachment; filename=system-dept-export.csv";
        return `\uFEFF${csv}`;
      },
    ),
    {
      query: ListDeptSchema,
      detail: {
        tags: ["系统管理-部门管理"],
        summary: "导出部门列表",
        description:
          "导出部门列表为CSV文件。根据当前用户角色数据范围过滤结果。需具有system:dept:export权限。",
      },
    },
  )
  .delete(
    "/batch",
    secured(
      {
        permission: "system:dept:remove",
        denyMessage: "无权限删除部门",
        operLog: OPER_LOG.DELETE,
      },
      async ({ body }) => {
        const typedBody = body as typeof RemoveBatchDeptSchema.static;
        const count = await deptService.removeBatch(typedBody.ids);
        return ok({ count }, "删除成功");
      },
    ),
    {
      body: RemoveBatchDeptSchema,
      response: {
        200: RemoveBatchDeptResponseSchema,
        401: DeptFailResponseSchema,
        403: DeptFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-部门管理"],
        summary: "批量删除部门（含子节点）",
        description:
          "批量删除指定部门，同时删除其所有子部门。需具有system:dept:remove权限。",
      },
    },
  )
  .post(
    "/add",
    secured(
      {
        permission: "system:dept:add",
        denyMessage: "无权限新增部门",
        operLog: OPER_LOG.CREATE,
      },
      async ({ body, set }) => {
        const typedBody = body as CreateDeptBody;
        const result = await deptService.create(typedBody);
        if (!result.success) {
          set.status = 400;
          return fail(400, "父部门不存在");
        }

        return ok({ deptId: result.deptId }, "新增成功");
      },
    ),
    {
      body: CreateDeptSchema,
      response: {
        200: CreateDeptResponseSchema,
        400: DeptFailResponseSchema,
        401: DeptFailResponseSchema,
        403: DeptFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-部门管理"],
        summary: "新增部门",
        description:
          "创建新部门，需指定父部门ID、部门名称、显示顺序、状态。父部门必须存在。需具有system:dept:add权限。",
      },
    },
  )
  .put(
    "/edit",
    secured(
      {
        permission: "system:dept:edit",
        denyMessage: "无权限编辑部门",
        operLog: OPER_LOG.UPDATE,
      },
      async ({ body, set }) => {
        const typedBody = body as UpdateDeptBody;
        const result = await deptService.update(typedBody);
        if (!result.success) {
          if (result.reason === "dept_not_found") {
            set.status = 404;
            return fail(404, "部门不存在");
          }

          if (result.reason === "invalid_parent") {
            set.status = 400;
            return fail(400, "上级部门不能选择自身或下级部门");
          }

          set.status = 400;
          return fail(400, "父部门不存在");
        }

        return ok(true, "修改成功");
      },
    ),
    {
      body: UpdateDeptSchema,
      response: {
        200: UpdateDeptResponseSchema,
        400: DeptFailResponseSchema,
        401: DeptFailResponseSchema,
        403: DeptFailResponseSchema,
        404: DeptFailResponseSchema,
      },
      detail: {
        tags: ["系统管理-部门管理"],
        summary: "编辑部门",
        description:
          "更新指定部门的信息。上级部门不能选择自身或下级部门。需具有system:dept:edit权限。",
      },
    },
  );
