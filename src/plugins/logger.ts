import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});

export const logRequest = (
  method: string,
  url: string,
  statusCode: number,
  duration?: number,
) => {
  logger.info({
    type: "access",
    method,
    url,
    statusCode,
    duration,
  });
};

export const logError = (error: Error, context?: Record<string, unknown>) => {
  logger.error({
    type: "error",
    message: error.message,
    stack: error.stack,
    ...context,
  });
};
