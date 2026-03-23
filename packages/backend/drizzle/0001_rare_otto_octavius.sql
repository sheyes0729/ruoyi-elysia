CREATE TABLE `sys_job` (
	`job_id` int AUTO_INCREMENT NOT NULL,
	`job_name` varchar(50) NOT NULL,
	`job_group` varchar(50) NOT NULL DEFAULT 'default',
	`cron_expression` varchar(50) NOT NULL,
	`invoke_target` varchar(255) NOT NULL,
	`status` char(1) NOT NULL DEFAULT '0',
	`misfire_policy` varchar(20) NOT NULL DEFAULT '3',
	`concurrent` char(1) NOT NULL DEFAULT '1',
	`remark` text,
	`create_time` timestamp DEFAULT (now()),
	CONSTRAINT `sys_job_job_id` PRIMARY KEY(`job_id`)
);
--> statement-breakpoint
CREATE TABLE `sys_job_log` (
	`log_id` int AUTO_INCREMENT NOT NULL,
	`job_id` int NOT NULL,
	`job_name` varchar(50) NOT NULL,
	`job_group` varchar(50) NOT NULL,
	`invoke_target` varchar(255) NOT NULL,
	`status` char(1) NOT NULL DEFAULT '0',
	`error_msg` text,
	`start_time` timestamp DEFAULT (now()),
	`end_time` timestamp,
	CONSTRAINT `sys_job_log_log_id` PRIMARY KEY(`log_id`)
);
--> statement-breakpoint
ALTER TABLE `sys_role` ADD `data_scope` char(1) DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE `sys_role` ADD `dept_check_strictly` char(1) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `sys_role` ADD `dept_ids` text;--> statement-breakpoint
ALTER TABLE `sys_user` ADD `dept_id` int DEFAULT 0;