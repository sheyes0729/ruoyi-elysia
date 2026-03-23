import {
  jobRepository,
  type CreateJobInput,
  type UpdateJobInput,
} from "../../../repository/system/job";
import type { Job, JobLog } from "../../../repository/system/job";
import { scheduler } from "../../../common/scheduler";
import { executeJob } from "../../../common/job-handlers";

export class JobService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const jobs = await jobRepository.findAll();
    for (const job of jobs) {
      if (job.status === "0") {
        const handler = async () => {
          await executeJob(job.jobId, job.jobName, job.invokeTarget);
        };
        scheduler.registerDynamicJob(
          job.jobId,
          job.jobName,
          job.cronExpression,
          handler,
        );
      }
    }

    this.initialized = true;
    console.log(
      `[JobService] Loaded ${jobs.filter((j) => j.status === "0").length} enabled jobs`,
    );
  }

  async list(): Promise<Job[]> {
    return jobRepository.findAll();
  }

  async getById(jobId: number): Promise<Job | null> {
    return jobRepository.findById(jobId);
  }

  async create(
    input: CreateJobInput,
  ): Promise<
    { success: true; jobId: number } | { success: false; reason: string }
  > {
    try {
      const jobId = await jobRepository.create(input);
      const job = await jobRepository.findById(jobId);
      if (job?.status === "0") {
        const handler = async () => {
          await executeJob(job.jobId, job.jobName, job.invokeTarget);
        };
        scheduler.registerDynamicJob(
          job.jobId,
          job.jobName,
          job.cronExpression,
          handler,
        );
      }
      return { success: true, jobId };
    } catch {
      return { success: false, reason: "创建任务失败" };
    }
  }

  async update(
    input: UpdateJobInput,
  ): Promise<{ success: true } | { success: false; reason: string }> {
    const existing = await jobRepository.findById(input.jobId);
    if (!existing) {
      return { success: false, reason: "任务不存在" };
    }

    try {
      await jobRepository.update(input);
      scheduler.removeJob(input.jobId);
      if (input.status === "0") {
        const handler = async () => {
          await executeJob(input.jobId, input.jobName, input.invokeTarget);
        };
        scheduler.registerDynamicJob(
          input.jobId,
          input.jobName,
          input.cronExpression,
          handler,
        );
      }
      return { success: true };
    } catch {
      return { success: false, reason: "更新任务失败" };
    }
  }

  async delete(
    jobId: number,
  ): Promise<{ success: true } | { success: false; reason: string }> {
    const existing = await jobRepository.findById(jobId);
    if (!existing) {
      return { success: false, reason: "任务不存在" };
    }

    try {
      scheduler.removeJob(jobId);
      await jobRepository.delete(jobId);
      return { success: true };
    } catch {
      return { success: false, reason: "删除任务失败" };
    }
  }

  async changeStatus(
    jobId: number,
    status: "0" | "1",
  ): Promise<{ success: true } | { success: false; reason: string }> {
    const existing = await jobRepository.findById(jobId);
    if (!existing) {
      return { success: false, reason: "任务不存在" };
    }

    try {
      await jobRepository.updateStatus(jobId, status);
      if (status === "0") {
        const handler = async () => {
          await executeJob(jobId, existing.jobName, existing.invokeTarget);
        };
        scheduler.registerDynamicJob(
          jobId,
          existing.jobName,
          existing.cronExpression,
          handler,
        );
      } else {
        scheduler.removeJob(jobId);
      }
      return { success: true };
    } catch {
      return { success: false, reason: "更新状态失败" };
    }
  }

  async getLogs(jobId?: number, limit = 100): Promise<JobLog[]> {
    return jobRepository.findLogs(jobId, limit);
  }

  async clearLogs(): Promise<number> {
    return jobRepository.clearLogs();
  }

  async recordExecution(log: {
    jobId: number;
    jobName: string;
    jobGroup: string;
    invokeTarget: string;
    status: "0" | "1";
    errorMsg?: string;
    startTime: Date;
    endTime?: Date;
  }): Promise<void> {
    await jobRepository.createLog(log);
  }
}

export const jobService = new JobService();
