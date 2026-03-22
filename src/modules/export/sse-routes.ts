import { Elysia } from "elysia";
import { securityPlugin } from "../../plugins/security";
import { exportJobService } from "../../common/export/job-service";
import { fail } from "../../common/http/response";

export const exportSseRoutes = new Elysia({
  prefix: "/api/export",
  name: "export.sse.routes",
})
  .use(securityPlugin)
  .get("/stream/:jobId", async ({ params, set, currentUser }) => {
    const typedParams = params as { jobId: string };
    const jobId = typedParams.jobId;

    if (!currentUser) {
      set.status = 401;
      return fail(401, "未登录");
    }

    const job = await exportJobService.getJob(jobId);
    if (!job) {
      set.status = 404;
      return fail(404, "任务不存在");
    }

    if (job.userId !== currentUser.userId) {
      set.status = 403;
      return fail(403, "无权限访问此任务");
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const sendEvent = (data: object) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        sendEvent({ type: "connected", jobId });

        const unsubscribe = exportJobService.subscribe(jobId, (updatedJob) => {
          sendEvent({
            type: "update",
            job: updatedJob,
          });

          if (
            updatedJob.status === "completed" ||
            updatedJob.status === "failed"
          ) {
            sendEvent({ type: "done", jobId });
            unsubscribe();
            controller.close();
          }
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  })
  .get("/status/:jobId", async ({ params, set, currentUser }) => {
    const typedParams = params as { jobId: string };

    if (!currentUser) {
      set.status = 401;
      return fail(401, "未登录");
    }

    const job = await exportJobService.getJob(typedParams.jobId);

    if (!job) {
      set.status = 404;
      return fail(404, "任务不存在");
    }

    if (job.userId !== currentUser.userId) {
      set.status = 403;
      return fail(403, "无权限访问此任务");
    }

    return { code: 200, msg: "操作成功", data: job };
  });
