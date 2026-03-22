import { Worker } from "bun";
import { exportJobService } from "./index";

export type ExportTask = {
  jobId: string;
  userId: number;
  type: string;
  process: () => Promise<{ fileName: string; csvContent: string }>;
};

export function scheduleExportTask(task: ExportTask): void {
  const { jobId, process: processor } = task;

  void exportJobService.updateJob(jobId, {
    status: "processing",
    progress: 10,
  });

  const worker = new Worker(`
    self.onmessage = (event) => {
      const { type, jobId, csvContent, fileName } = event.data;
      if (type === "process") {
        self.postMessage({ type: "progress", jobId, progress: 50 });
        self.postMessage({ type: "completed", jobId, fileName, csvContent });
      }
    };
  `);

  processor()
    .then((result) => {
      worker.postMessage({
        type: "process",
        jobId,
        csvContent: result.csvContent,
        fileName: result.fileName,
      });
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "导出失败";
      void exportJobService.updateJob(jobId, {
        status: "failed",
        error: message,
      });
      worker.terminate();
    });

  worker.onmessage = (event) => {
    const data = event.data as {
      type: string;
      jobId: string;
      progress?: number;
      fileName?: string;
    };

    if (data.type === "progress" && data.progress !== undefined) {
      void exportJobService.updateJob(data.jobId, { progress: data.progress });
    } else if (data.type === "completed" && data.fileName) {
      void exportJobService.updateJob(data.jobId, {
        status: "completed",
        progress: 100,
        fileName: data.fileName,
      });
      worker.terminate();
    }
  };

  worker.onerror = (event: ErrorEvent) => {
    void exportJobService.updateJob(jobId, {
      status: "failed",
      error: event.message || "Worker执行失败",
    });
    worker.terminate();
  };
}
