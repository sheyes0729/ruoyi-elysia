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

  const sendMessage = (data: unknown) => {
    const message = JSON.stringify(data);
    worker.postMessage(message);
  };

  const terminateWorker = () => {
    try {
      worker.terminate();
    } catch {
      // ignore
    }
  };

  processor()
    .then((result) => {
      sendMessage({
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
      terminateWorker();
    });

  worker.onmessage = (event: { data: string }) => {
    try {
      const data = JSON.parse(event.data) as {
        type: string;
        jobId: string;
        progress?: number;
        fileName?: string;
      };

      if (data.type === "progress" && data.progress !== undefined) {
        void exportJobService.updateJob(data.jobId, {
          progress: data.progress,
        });
      } else if (data.type === "completed" && data.fileName) {
        void exportJobService.updateJob(data.jobId, {
          status: "completed",
          progress: 100,
          fileName: data.fileName,
        });
        terminateWorker();
      }
    } catch {
      // ignore parse errors
    }
  };

  worker.onerror = (event: { message?: string }) => {
    void exportJobService.updateJob(jobId, {
      status: "failed",
      error: event.message ?? "Worker执行失败",
    });
    terminateWorker();
  };
}
