CREATE TABLE `sys_config` (
	`config_id` int AUTO_INCREMENT NOT NULL,
	`config_name` varchar(100) NOT NULL,
	`config_key` varchar(100) NOT NULL,
	`config_value` varchar(500) NOT NULL,
	`config_type` char(1) NOT NULL DEFAULT 'N',
	`create_time` timestamp DEFAULT (now()),
	CONSTRAINT `sys_config_config_id` PRIMARY KEY(`config_id`),
	CONSTRAINT `sys_config_config_key_unique` UNIQUE(`config_key`)
);
--> statement-breakpoint
CREATE TABLE `sys_dept` (
	`dept_id` int AUTO_INCREMENT NOT NULL,
	`parent_id` int NOT NULL DEFAULT 0,
	`dept_name` varchar(30) NOT NULL,
	`order_num` int NOT NULL DEFAULT 0,
	`status` char(1) NOT NULL DEFAULT '0',
	`create_time` timestamp DEFAULT (now()),
	CONSTRAINT `sys_dept_dept_id` PRIMARY KEY(`dept_id`)
);
--> statement-breakpoint
CREATE TABLE `sys_dict_data` (
	`dict_code` int AUTO_INCREMENT NOT NULL,
	`dict_sort` int NOT NULL DEFAULT 0,
	`dict_label` varchar(100) NOT NULL,
	`dict_value` varchar(100) NOT NULL,
	`dict_type` varchar(100) NOT NULL,
	`status` char(1) NOT NULL DEFAULT '0',
	`create_time` timestamp DEFAULT (now()),
	CONSTRAINT `sys_dict_data_dict_code` PRIMARY KEY(`dict_code`)
);
--> statement-breakpoint
CREATE TABLE `sys_dict_type` (
	`dict_id` int AUTO_INCREMENT NOT NULL,
	`dict_name` varchar(100) NOT NULL,
	`dict_type` varchar(100) NOT NULL,
	`status` char(1) NOT NULL DEFAULT '0',
	`create_time` timestamp DEFAULT (now()),
	CONSTRAINT `sys_dict_type_dict_id` PRIMARY KEY(`dict_id`),
	CONSTRAINT `sys_dict_type_dict_type_unique` UNIQUE(`dict_type`)
);
--> statement-breakpoint
CREATE TABLE `sys_login_log` (
	`info_id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(50),
	`ipaddr` varchar(128),
	`login_location` varchar(255),
	`login_type` varchar(10),
	`status` char(1) NOT NULL DEFAULT '0',
	`msg` varchar(255),
	`login_time` timestamp DEFAULT (now()),
	CONSTRAINT `sys_login_log_info_id` PRIMARY KEY(`info_id`)
);
--> statement-breakpoint
CREATE TABLE `sys_menu` (
	`menu_id` int AUTO_INCREMENT NOT NULL,
	`menu_name` varchar(50) NOT NULL,
	`parent_id` int NOT NULL DEFAULT 0,
	`order_num` int NOT NULL DEFAULT 0,
	`path` varchar(200) NOT NULL,
	`component` varchar(255),
	`menu_type` char(1) NOT NULL DEFAULT 'M',
	`perms` varchar(100),
	`visible` char(1) NOT NULL DEFAULT '0',
	`status` char(1) NOT NULL DEFAULT '0',
	`create_time` timestamp DEFAULT (now()),
	CONSTRAINT `sys_menu_menu_id` PRIMARY KEY(`menu_id`)
);
--> statement-breakpoint
CREATE TABLE `sys_notice` (
	`notice_id` int AUTO_INCREMENT NOT NULL,
	`notice_title` varchar(50) NOT NULL,
	`notice_type` char(1) NOT NULL,
	`status` char(1) NOT NULL DEFAULT '0',
	`create_time` timestamp DEFAULT (now()),
	CONSTRAINT `sys_notice_notice_id` PRIMARY KEY(`notice_id`)
);
--> statement-breakpoint
CREATE TABLE `sys_oper_log` (
	`oper_id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(50) NOT NULL,
	`business_type` char(20) NOT NULL,
	`method` varchar(100),
	`request_method` varchar(10),
	`oper_name` varchar(50),
	`oper_url` varchar(255),
	`oper_ip` varchar(128),
	`oper_location` varchar(255),
	`oper_param` text,
	`json_result` text,
	`status` char(1) NOT NULL DEFAULT '0',
	`error_msg` text,
	`oper_time` timestamp DEFAULT (now()),
	CONSTRAINT `sys_oper_log_oper_id` PRIMARY KEY(`oper_id`)
);
--> statement-breakpoint
CREATE TABLE `sys_post` (
	`post_id` int AUTO_INCREMENT NOT NULL,
	`post_code` varchar(50) NOT NULL,
	`post_name` varchar(50) NOT NULL,
	`post_sort` int NOT NULL DEFAULT 0,
	`status` char(1) NOT NULL DEFAULT '0',
	`create_time` timestamp DEFAULT (now()),
	CONSTRAINT `sys_post_post_id` PRIMARY KEY(`post_id`),
	CONSTRAINT `sys_post_post_code_unique` UNIQUE(`post_code`)
);
--> statement-breakpoint
CREATE TABLE `sys_role` (
	`role_id` int AUTO_INCREMENT NOT NULL,
	`role_key` varchar(100) NOT NULL,
	`role_name` varchar(30) NOT NULL,
	`status` char(1) NOT NULL DEFAULT '0',
	`menu_ids` text,
	`permissions` text,
	`create_time` timestamp DEFAULT (now()),
	CONSTRAINT `sys_role_role_id` PRIMARY KEY(`role_id`),
	CONSTRAINT `sys_role_role_key_unique` UNIQUE(`role_key`)
);
--> statement-breakpoint
CREATE TABLE `sys_user` (
	`user_id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(30) NOT NULL,
	`nick_name` varchar(30) NOT NULL,
	`password` varchar(100) NOT NULL,
	`status` char(1) NOT NULL DEFAULT '0',
	`create_time` timestamp DEFAULT (now()),
	CONSTRAINT `sys_user_user_id` PRIMARY KEY(`user_id`),
	CONSTRAINT `sys_user_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `sys_user_role` (
	`user_id` int NOT NULL,
	`role_id` int NOT NULL
);
