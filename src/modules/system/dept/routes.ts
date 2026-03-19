import { Elysia } from "elysia";
import { hasPermission } from "../../../common/auth/permission";
import { toCsv } from "../../../common/http/csv";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
  DeptFailResponseSchema,
  ListDeptResponseSchema,
  ListDeptSchema,
  RemoveBatchDeptResponseSchema,
  RemoveBatchDeptSchema,
} from "./model";
import { deptService } from "./service";

export const DeptRoutes = new Elysia({
  prefix: "/api/system/dept",
  name: "system.dept.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    ({ currentUser, query, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:dept:list")) {
        set.status = 403;
        return fail(403, "无权限访问部门管理");
      }

      return ok(deptService.list(query));
    },
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
    ({ currentUser, query, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:dept:export")) {
        set.status = 403;
        return fail(403, "无权限导出部门数据");
      }

      const rows = deptService.listFlat(query);
      const csv = toCsv(rows, [
        { header: "部门ID", value: (row) => row.deptId },
        { header: "父部门ID", value: (row) => row.parentId },
        { header: "部门名称", value: (row) => row.deptName },
        { header: "显示顺序", value: (row) => row.orderNum },
        { header: "状态", value: (row) => row.status },
      ]);

      set.headers["content-type"] = "text/csv; charset=utf-8";
      set.headers["content-disposition"] =
        "attachment; filename=system-dept-export.csv";
      return `\uFEFF${csv}`;
    },
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
    ({ body, currentUser, set }) => {
      if (!currentUser) {
        set.status = 401;
        return fail(401, "未登录或登录已失效");
      }

      if (!hasPermission(currentUser, "system:dept:remove")) {
        set.status = 403;
        return fail(403, "无权限删除部门");
      }

      const count = deptService.removeBatch(body.ids);
      return ok({ count }, "删除成功");
    },
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
  );
