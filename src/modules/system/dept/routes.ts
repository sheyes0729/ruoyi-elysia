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
      ({ query }) => {
        const typedQuery = query as ListDeptQuery;
        return ok(deptService.list(typedQuery));
      }
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
      },
    }
  )
  .post(
    "/export",
    secured(
      {
        permission: "system:dept:export",
        denyMessage: "无权限导出部门数据",
        operLog: OPER_LOG.EXPORT,
      },
      ({ query, set }) => {
        const typedQuery = query as ListDeptQuery;
        const rows = deptService.listFlat(typedQuery);
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
      }
    ),
    {
      query: ListDeptSchema,
      detail: {
        tags: ["系统管理-部门管理"],
        summary: "导出部门列表",
      },
    }
  )
  .delete(
    "/batch",
    secured(
      {
        permission: "system:dept:remove",
        denyMessage: "无权限删除部门",
        operLog: OPER_LOG.DELETE,
      },
      ({ body }) => {
        const typedBody = body as typeof RemoveBatchDeptSchema.static;
        const count = deptService.removeBatch(typedBody.ids);
        return ok({ count }, "删除成功");
      }
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
      },
    }
  )
  .post(
    "/add",
    secured(
      {
        permission: "system:dept:add",
        denyMessage: "无权限新增部门",
        operLog: OPER_LOG.CREATE,
      },
      ({ body, set }) => {
        const typedBody = body as CreateDeptBody;
        const result = deptService.create(typedBody);
        if (!result.success) {
          set.status = 400;
          return fail(400, "父部门不存在");
        }

        return ok({ deptId: result.deptId }, "新增成功");
      }
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
      },
    }
  )
  .put(
    "/edit",
    secured(
      {
        permission: "system:dept:edit",
        denyMessage: "无权限编辑部门",
        operLog: OPER_LOG.UPDATE,
      },
      ({ body, set }) => {
        const typedBody = body as UpdateDeptBody;
        const result = deptService.update(typedBody);
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
      }
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
      },
    }
  );
