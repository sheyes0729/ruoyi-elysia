import pino from "pino";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { maskSensitiveData } from "../common/desensitize";

const SENSITIVE_KEYS: readonly string[] = [
  "password",
  "oldPassword",
  "newPassword",
  "confirmPassword",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
  "secret",
  "secretKey",
  "privateKey",
  "creditCard",
  "cardNumber",
  "cvv",
  "idNumber",
  "idCard",
  "phone",
  "mobile",
  "bankCard",
  "bankAccount",
];

const isDev = process.env.NODE_ENV !== "production";
const logDir = process.env.LOG_DIR ?? "./logs";

if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
}

const transports = isDev
  ? {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    }
  : {
      file: join(logDir, "app.log"),
    };

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  ...transports,
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const accessLogger = pino({
  level: "info",
  ...(isDev ? {} : { file: join(logDir, "access.log") }),
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const logRequest = (
  method: string,
  url: string,
  statusCode: number,
  duration?: number,
) => {
  accessLogger.info({
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

export function maskSensitiveFields(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const masked = maskSensitiveData(data, SENSITIVE_KEYS);
  const result: Record<string, unknown> = { ...data };

  for (const [key, value] of Object.entries(masked)) {
    result[key] = value;
  }

  return result;
}

export function logWithMask(
  type: string,
  data: Record<string, unknown>,
  maskFields = true,
): void {
  const logData = maskFields
    ? { type, ...maskSensitiveFields(data) }
    : { type, ...data };
  logger.info(logData);
}
