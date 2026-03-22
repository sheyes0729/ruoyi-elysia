import { Elysia, t } from "elysia";
import { secured } from "../../../common/auth/secured";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { jobService } from "./service";

export const jobRoutes = new Elysia({
  prefix: "/api/system/job",
  name: "system.job.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    secured({ permission: "system:job:list" }, async () => {
      const jobs = await jobService.list();
      return ok(paginateData(jobs, {}, jobs.length));
    }),
    {
      detail: {
        tags: ["系统管理-定时任务"],
        summary: "查询定时任务列表",
        description: "获取所有定时任务配置。",
      },
    },
  )
  .get(
    "/:jobId",
    secured({ permission: "system:job:query" }, async ({ params, set }) => {
      const jobId = parseInt((params as { jobId: string }).jobId, 10);
      const job = await jobService.getById(jobId);
      if (!job) {
        set.status = 404;
        return fail(404, "任务不存在");
      }
      return ok(job);
    }),
    {
      params: t.Object({ jobId: t.String() }),
      detail: {
        tags: ["系统管理-定时任务"],
        summary: "获取定时任务详情",
        description: "根据ID获取定时任务详情。",
      },
    },
  )
  .post(
    "/add",
    secured({ permission: "system:job:add" }, async ({ body, set }) => {
      const typedBody = body as {
        jobName: string;
        jobGroup: string;
        cronExpression: string;
        invokeTarget: string;
        status?: "0" | "1";
        misfirePolicy?: string;
        concurrent?: "0" | "1";
        remark?: string;
      };

      const result = await jobService.create({
        jobName: typedBody.jobName,
        jobGroup: typedBody.jobGroup,
        cronExpression: typedBody.cronExpression,
        invokeTarget: typedBody.invokeTarget,
        status: typedBody.status ?? "0",
        misfirePolicy: typedBody.misfirePolicy ?? "3",
        concurrent: typedBody.concurrent ?? "1",
        remark: typedBody.remark,
      });

      if (!result.success) {
        set.status = 400;
        return fail(400, result.reason);
      }

      return ok({ jobId: result.jobId }, "新增成功");
    }),
    {
      detail: {
        tags: ["系统管理-定时任务"],
        summary: "新增定时任务",
        description: "创建新的定时任务。",
      },
    },
  )
  .put(
    "/edit",
    secured({ permission: "system:job:edit" }, async ({ body, set }) => {
      const typedBody = body as {
        jobId: number;
        jobName: string;
        jobGroup: string;
        cronExpression: string;
        invokeTarget: string;
        status: "0" | "1";
        misfirePolicy: string;
        concurrent: "0" | "1";
        remark?: string;
      };

      const result = await jobService.update({
        jobId: typedBody.jobId,
        jobName: typedBody.jobName,
        jobGroup: typedBody.jobGroup,
        cronExpression: typedBody.cronExpression,
        invokeTarget: typedBody.invokeTarget,
        status: typedBody.status,
        misfirePolicy: typedBody.misfirePolicy,
        concurrent: typedBody.concurrent,
        remark: typedBody.remark,
      });

      if (!result.success) {
        set.status = 400;
        return fail(400, result.reason);
      }

      return ok(true, "修改成功");
    }),
    {
      detail: {
        tags: ["系统管理-定时任务"],
        summary: "编辑定时任务",
        description: "更新定时任务配置。",
      },
    },
  )
  .put(
    "/changeStatus",
    secured(
      { permission: "system:job:changeStatus" },
      async ({ body, set }) => {
        const typedBody = body as { jobId: number; status: "0" | "1" };

        const result = await jobService.changeStatus(
          typedBody.jobId,
          typedBody.status,
        );

        if (!result.success) {
          set.status = 400;
          return fail(400, result.reason);
        }

        return ok(true, "状态修改成功");
      },
    ),
    {
      detail: {
        tags: ["系统管理-定时任务"],
        summary: "修改定时任务状态",
        description: "启用或禁用定时任务。",
      },
    },
  )
  .delete(
    "/:jobId",
    secured({ permission: "system:job:remove" }, async ({ params, set }) => {
      const jobId = parseInt((params as { jobId: string }).jobId, 10);

      const result = await jobService.delete(jobId);

      if (!result.success) {
        set.status = 400;
        return fail(400, result.reason);
      }

      return ok(true, "删除成功");
    }),
    {
      params: t.Object({ jobId: t.String() }),
      detail: {
        tags: ["系统管理-定时任务"],
        summary: "删除定时任务",
        description: "删除指定的定时任务。",
      },
    },
  )
  .get(
    "/logs",
    secured({ permission: "system:job:list" }, async ({ query }) => {
      const jobId = (query as { jobId?: string })?.jobId
        ? parseInt((query as { jobId: string }).jobId, 10)
        : undefined;
      const logs = await jobService.getLogs(jobId);
      return ok(paginateData(logs, {}, logs.length));
    }),
    {
      detail: {
        tags: ["系统管理-定时任务"],
        summary: "查询定时任务日志",
        description: "获取定时任务的执行日志。",
      },
    },
  )
  .delete(
    "/logs/clean",
    secured({ permission: "system:job:remove" }, async () => {
      const count = await jobService.clearLogs();
      return ok({ count }, "清空成功");
    }),
    {
      detail: {
        tags: ["系统管理-定时任务"],
        summary: "清空调度日志",
        description: "清空所有定时任务执行日志。",
      },
    },
  );
