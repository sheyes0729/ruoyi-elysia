import {
  mysqlTable,
  varchar,
  int,
  timestamp,
  char,
  text,
} from "drizzle-orm/mysql-core";

export const sys_job = mysqlTable("sys_job", {
  jobId: int("job_id").primaryKey().autoincrement(),
  jobName: varchar("job_name", { length: 50 }).notNull(),
  jobGroup: varchar("job_group", { length: 50 }).notNull().default("default"),
  cronExpression: varchar("cron_expression", { length: 50 }).notNull(),
  invokeTarget: varchar("invoke_target", { length: 255 }).notNull(),
  status: char("status", { length: 1 }).notNull().default("0"),
  misfirePolicy: varchar("misfire_policy", { length: 20 })
    .notNull()
    .default("3"),
  concurrent: char("concurrent", { length: 1 }).notNull().default("1"),
  remark: text("remark"),
  createTime: timestamp("create_time").defaultNow(),
});

export const sys_job_log = mysqlTable("sys_job_log", {
  logId: int("log_id").primaryKey().autoincrement(),
  jobId: int("job_id").notNull(),
  jobName: varchar("job_name", { length: 50 }).notNull(),
  jobGroup: varchar("job_group", { length: 50 }).notNull(),
  invokeTarget: varchar("invoke_target", { length: 255 }).notNull(),
  status: char("status", { length: 1 }).notNull().default("0"),
  errorMsg: text("error_msg"),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
});
