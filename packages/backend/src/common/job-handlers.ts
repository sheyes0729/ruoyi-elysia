import { jobRepository } from "../repository/system/job";
import { cacheService } from "../plugins/cache";
import { onlineService } from "../modules/monitor/online/service";
import { loginLogService } from "../modules/monitor/login-log/service";

export type JobHandler = () => Promise<void>;

const jobHandlers: Record<string, JobHandler> = {
  cleanupExpiredSessions: async () => {
    console.log("[Job] Running cleanupExpiredSessions");
    await onlineService.cleanupExpiredSessions();
  },

  cleanupOldLoginLogs: async () => {
    console.log("[Job] Running cleanupOldLoginLogs");
    await loginLogService.cleanupOldLogs();
  },

  clearExportedFiles: async () => {
    console.log("[Job] Running clearExportedFiles");
    await cacheService.delPattern("export:*");
  },

  syncUserPermissions: async () => {
    console.log("[Job] Running syncUserPermissions");
    await cacheService.delPattern("permission:*");
    await cacheService.delPattern("user:*");
  },

  healthCheck: async () => {
    console.log("[Job] Running healthCheck - all systems operational");
  },
};

export function registerJobHandler(name: string, handler: JobHandler): void {
  jobHandlers[name] = handler;
}

export function getJobHandler(invokeTarget: string): JobHandler | null {
  return jobHandlers[invokeTarget] ?? null;
}

export async function executeJob(
  jobId: number,
  jobName: string,
  invokeTarget: string,
): Promise<void> {
  const handler = getJobHandler(invokeTarget);
  if (!handler) {
    console.warn(`[Job] No handler found for invokeTarget: ${invokeTarget}`);
    return;
  }

  const startTime = new Date();
  let status: "0" | "1" = "0";
  let errorMsg: string | undefined;

  try {
    await handler();
    console.log(`[Job] ${jobName} completed successfully`);
  } catch (error) {
    status = "1";
    errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Job] ${jobName} failed:`, error);
  }

  await jobRepository.createLog({
    jobId,
    jobName,
    jobGroup: "default",
    invokeTarget,
    status,
    errorMsg,
    startTime,
    endTime: new Date(),
  });
}
