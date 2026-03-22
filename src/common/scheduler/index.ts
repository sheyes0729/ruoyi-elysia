export type Task = {
  name: string;
  cron: string;
  handler: () => Promise<void>;
  enabled: boolean;
};

export type TaskSchedule = {
  name: string;
  intervalMs: number;
  handler: () => Promise<void>;
};

const parseCronToMs = (cron: string): number => {
  const parts = cron.split(" ");
  if (parts.length < 5) {
    return 60000;
  }

  const [, minute] = parts;

  if (cron === "* * * * *") {
    return 60000;
  }

  if (minute.includes("/")) {
    const interval = parseInt(minute.split("/")[1], 10);
    return interval * 60000;
  }

  return 60000;
};

class Scheduler {
  private tasks: TaskSchedule[] = [];
  private intervals: ReturnType<typeof setInterval>[] = [];
  private running = false;

  register(task: Task): void {
    if (!task.enabled) {
      return;
    }

    const intervalMs = parseCronToMs(task.cron);

    this.tasks.push({
      name: task.name,
      intervalMs,
      handler: task.handler,
    });

    console.log(
      `[Scheduler] Registered task: ${task.name} (every ${intervalMs}ms)`,
    );
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    console.log("[Scheduler] Started");

    for (const task of this.tasks) {
      const interval = setInterval(async () => {
        try {
          const start = Date.now();
          await task.handler();
          const duration = Date.now() - start;
          console.log(
            `[Scheduler] Task "${task.name}" completed in ${duration}ms`,
          );
        } catch (error) {
          console.error(`[Scheduler] Task "${task.name}" failed:`, error);
        }
      }, task.intervalMs);

      this.intervals.push(interval);
    }
  }

  stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;

    for (const interval of this.intervals) {
      clearInterval(interval);
    }

    this.intervals = [];
    console.log("[Scheduler] Stopped");
  }

  getTasks(): string[] {
    return this.tasks.map((t) => t.name);
  }
}

export const scheduler = new Scheduler();

export { registerScheduledTasks } from "./tasks";
