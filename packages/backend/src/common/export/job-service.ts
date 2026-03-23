import { redis, REDIS_KEYS } from "../../plugins/redis";

export type ExportJobStatus = "pending" | "processing" | "completed" | "failed";

export type ExportJob = {
  id: string;
  userId: number;
  type: string;
  status: ExportJobStatus;
  progress: number;
  fileUrl?: string;
  fileName?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
};

type ExportJobListener = (job: ExportJob) => void;

const EXPORT_JOB_TTL = 3600;

class ExportJobService {
  private listeners: Map<string, ExportJobListener[]> = new Map();

  async createJob(userId: number, type: string): Promise<ExportJob> {
    const job: ExportJob = {
      id: this.generateId(),
      userId,
      type,
      status: "pending",
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const key = this.getKey(job.id);
    await redis.setex(key, EXPORT_JOB_TTL, JSON.stringify(job));

    return job;
  }

  async getJob(jobId: string): Promise<ExportJob | null> {
    const key = this.getKey(jobId);
    const data = await redis.get(key);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as ExportJob;
  }

  async updateJob(
    jobId: string,
    updates: Partial<ExportJob>,
  ): Promise<ExportJob | null> {
    const job = await this.getJob(jobId);
    if (!job) {
      return null;
    }

    const updatedJob: ExportJob = {
      ...job,
      ...updates,
      updatedAt: Date.now(),
    };

    const key = this.getKey(jobId);
    await redis.setex(key, EXPORT_JOB_TTL, JSON.stringify(updatedJob));

    this.notifyListeners(updatedJob);

    return updatedJob;
  }

  async listUserJobs(userId: number): Promise<ExportJob[]> {
    const pattern = `${REDIS_KEYS.IDEMPOTENCY}export:job:*`;
    const keys = await redis.keys(pattern);

    const jobs: ExportJob[] = [];
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const job = JSON.parse(data) as ExportJob;
        if (job.userId === userId) {
          jobs.push(job);
        }
      }
    }

    return jobs.sort((a, b) => b.createdAt - a.createdAt);
  }

  subscribe(jobId: string, listener: ExportJobListener): () => void {
    const listeners = this.listeners.get(jobId) ?? [];
    listeners.push(listener);
    this.listeners.set(jobId, listeners);

    return () => {
      const currentListeners = this.listeners.get(jobId) ?? [];
      const filtered = currentListeners.filter((l) => l !== listener);
      if (filtered.length === 0) {
        this.listeners.delete(jobId);
      } else {
        this.listeners.set(jobId, filtered);
      }
    };
  }

  private notifyListeners(job: ExportJob): void {
    const listeners = this.listeners.get(job.id);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(job);
        } catch {
          // ignore listener errors
        }
      }
    }
  }

  private generateId(): string {
    return `export_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  private getKey(jobId: string): string {
    return `export:job:${jobId}`;
  }
}

export const exportJobService = new ExportJobService();
