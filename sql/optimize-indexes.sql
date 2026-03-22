-- Database Index Optimization Recommendations for RuoYi Elysia
-- Run this script to add recommended indexes to improve query performance

-- sys_user indexes
ALTER TABLE sys_user ADD INDEX idx_user_username (username);
ALTER TABLE sys_user ADD INDEX idx_user_status (status);
ALTER TABLE sys_user ADD INDEX idx_user_dept_id (dept_id);
ALTER TABLE sys_user ADD INDEX idx_user_create_time (create_time);

-- sys_user_role indexes
ALTER TABLE sys_user_role ADD INDEX idx_ur_user_id (user_id);
ALTER TABLE sys_user_role ADD INDEX idx_ur_role_id (role_id);

-- sys_role indexes
ALTER TABLE sys_role ADD INDEX idx_role_status (status);
ALTER TABLE sys_role ADD INDEX idx_role_key (role_key);

-- sys_menu indexes
ALTER TABLE sys_menu ADD INDEX idx_menu_status (status);
ALTER TABLE sys_menu ADD INDEX idx_menu_perms (perms);
ALTER TABLE sys_menu ADD INDEX idx_menu_parent_id (parent_id);

-- sys_dept indexes
ALTER TABLE sys_dept ADD INDEX idx_dept_status (status);
ALTER TABLE sys_dept ADD INDEX idx_dept_parent_id (parent_id);

-- sys_post indexes
ALTER TABLE sys_post ADD INDEX idx_post_status (status);
ALTER TABLE sys_post ADD INDEX idx_post_code (post_code);

-- sys_dict_type indexes
ALTER TABLE sys_dict_type ADD INDEX idx_dict_type_status (status);
ALTER TABLE sys_dict_type ADD INDEX idx_dict_type_key (dict_type);

-- sys_dict_data indexes
ALTER TABLE sys_dict_data ADD INDEX idx_dict_data_type (dict_type);
ALTER TABLE sys_dict_data ADD INDEX idx_dict_data_status (status);
ALTER TABLE sys_dict_data ADD INDEX idx_dict_data_sort (dict_sort);

-- sys_config indexes
ALTER TABLE sys_config ADD INDEX idx_config_status (status);
ALTER TABLE sys_config ADD INDEX idx_config_key (config_key);

-- sys_notice indexes
ALTER TABLE sys_notice ADD INDEX idx_notice_status (status);
ALTER TABLE sys_notice ADD INDEX idx_notice_type (notice_type);

-- sys_oper_log indexes
ALTER TABLE sys_oper_log ADD INDEX idx_oper_log_name (oper_name);
ALTER TABLE sys_oper_log ADD INDEX idx_oper_log_status (status);
ALTER TABLE sys_oper_log ADD INDEX idx_oper_log_time (oper_time);
ALTER TABLE sys_oper_log ADD INDEX idx_oper_log_business_type (business_type);

-- sys_login_log indexes (already using Redis, but useful for backup)
ALTER TABLE sys_login_log ADD INDEX idx_login_log_username (username);
ALTER TABLE sys_login_log ADD INDEX idx_login_log_status (status);
ALTER TABLE sys_login_log ADD INDEX idx_login_log_time (login_time);

-- sys_job indexes
ALTER TABLE sys_job ADD INDEX idx_job_status (status);
ALTER TABLE sys_job ADD INDEX idx_job_group (job_group);

-- sys_job_log indexes
ALTER TABLE sys_job_log ADD INDEX idx_job_log_job_id (job_id);
ALTER TABLE sys_job_log ADD INDEX idx_job_log_status (status);
ALTER TABLE sys_job_log ADD INDEX idx_job_log_time (start_time);

-- Composite indexes for common queries
ALTER TABLE sys_user ADD INDEX idx_user_dept_status (dept_id, status);
ALTER TABLE sys_user_role ADD INDEX idx_ur_user_role (user_id, role_id);
ALTER TABLE sys_dict_data ADD INDEX idx_dict_data_type_status (dict_type, status);
