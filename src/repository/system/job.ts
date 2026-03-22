import { eq, desc } from "drizzle-orm";
import { sys_job, sys_job_log } from "../../database/schema";
import { db } from "../../database";

export interface Job {
  jobId: number;
  jobName: string;
  jobGroup: string;
  cronExpression: string;
  invokeTarget: string;
  status: "0" | "1";
  misfirePolicy: string;
  concurrent: "0" | "1";
  remark?: string;
  createTime: Date;
}

export interface JobLog {
  logId: number;
  jobId: number;
  jobName: string;
  jobGroup: string;
  invokeTarget: string;
  status: "0" | "1";
  errorMsg?: string;
  startTime: Date;
  endTime?: Date;
}

export interface CreateJobInput {
  jobName: string;
  jobGroup: string;
  cronExpression: string;
  invokeTarget: string;
  status?: "0" | "1";
  misfirePolicy?: string;
  concurrent?: "0" | "1";
  remark?: string;
}

export interface UpdateJobInput {
  jobId: number;
  jobName: string;
  jobGroup: string;
  cronExpression: string;
  invokeTarget: string;
  status: "0" | "1";
  misfirePolicy: string;
  concurrent: "0" | "1";
  remark?: string;
}

export class JobRepository {
  async findAll(): Promise<Job[]> {
    const result = await db
      .select()
      .from(sys_job)
      .orderBy(desc(sys_job.createTime));
    return result as Job[];
  }

  async findById(jobId: number): Promise<Job | null> {
    const result = await db
      .select()
      .from(sys_job)
      .where(eq(sys_job.jobId, jobId));
    return result.length > 0 ? (result[0] as Job) : null;
  }

  async findByGroup(jobGroup: string): Promise<Job[]> {
    const result = await db
      .select()
      .from(sys_job)
      .where(eq(sys_job.jobGroup, jobGroup));
    return result as Job[];
  }

  async create(input: CreateJobInput): Promise<number> {
    const result = await db.insert(sys_job).values({
      jobName: input.jobName,
      jobGroup: input.jobGroup,
      cronExpression: input.cronExpression,
      invokeTarget: input.invokeTarget,
      status: input.status ?? "0",
      misfirePolicy: input.misfirePolicy ?? "3",
      concurrent: input.concurrent ?? "1",
      remark: input.remark,
    });
    return result[0].insertId;
  }

  async update(input: UpdateJobInput): Promise<boolean> {
    const result = await db
      .update(sys_job)
      .set({
        jobName: input.jobName,
        jobGroup: input.jobGroup,
        cronExpression: input.cronExpression,
        invokeTarget: input.invokeTarget,
        status: input.status,
        misfirePolicy: input.misfirePolicy,
        concurrent: input.concurrent,
        remark: input.remark,
      })
      .where(eq(sys_job.jobId, input.jobId));
    return result.length > 0;
  }

  async delete(jobId: number): Promise<boolean> {
    const result = await db.delete(sys_job).where(eq(sys_job.jobId, jobId));
    return result.length > 0;
  }

  async updateStatus(jobId: number, status: "0" | "1"): Promise<boolean> {
    const result = await db
      .update(sys_job)
      .set({ status })
      .where(eq(sys_job.jobId, jobId));
    return result.length > 0;
  }

  async createLog(log: {
    jobId: number;
    jobName: string;
    jobGroup: string;
    invokeTarget: string;
    status: "0" | "1";
    errorMsg?: string;
    startTime: Date;
    endTime?: Date;
  }): Promise<number> {
    const result = await db.insert(sys_job_log).values({
      jobId: log.jobId,
      jobName: log.jobName,
      jobGroup: log.jobGroup,
      invokeTarget: log.invokeTarget,
      status: log.status,
      errorMsg: log.errorMsg,
      startTime: log.startTime,
      endTime: log.endTime,
    });
    return result[0].insertId;
  }

  async findLogs(jobId?: number, limit = 100): Promise<JobLog[]> {
    if (jobId) {
      const result = await db
        .select()
        .from(sys_job_log)
        .where(eq(sys_job_log.jobId, jobId))
        .orderBy(desc(sys_job_log.startTime))
        .limit(limit);
      return result as JobLog[];
    }

    const result = await db
      .select()
      .from(sys_job_log)
      .orderBy(desc(sys_job_log.startTime))
      .limit(limit);
    return result as JobLog[];
  }

  async clearLogs(): Promise<number> {
    const result = await db.delete(sys_job_log);
    return result.length;
  }
}

export const jobRepository = new JobRepository();
