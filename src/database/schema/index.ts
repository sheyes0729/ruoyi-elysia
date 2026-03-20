import {
  mysqlTable,
  varchar,
  int,
  timestamp,
  text,
  char,
} from "drizzle-orm/mysql-core";

export const sys_user = mysqlTable("sys_user", {
  userId: int("user_id").primaryKey().autoincrement(),
  username: varchar("username", { length: 30 }).notNull().unique(),
  nickName: varchar("nick_name", { length: 30 }).notNull(),
  password: varchar("password", { length: 100 }).notNull(),
  status: char("status", { length: 1 }).notNull().default("0"),
  createTime: timestamp("create_time").defaultNow(),
});

export const sys_role = mysqlTable("sys_role", {
  roleId: int("role_id").primaryKey().autoincrement(),
  roleKey: varchar("role_key", { length: 100 }).notNull().unique(),
  roleName: varchar("role_name", { length: 30 }).notNull(),
  status: char("status", { length: 1 }).notNull().default("0"),
  menuIds: text("menu_ids"),
  permissions: text("permissions"),
  createTime: timestamp("create_time").defaultNow(),
});

export const sys_user_role = mysqlTable("sys_user_role", {
  userId: int("user_id").notNull(),
  roleId: int("role_id").notNull(),
});

export const sys_menu = mysqlTable("sys_menu", {
  menuId: int("menu_id").primaryKey().autoincrement(),
  menuName: varchar("menu_name", { length: 50 }).notNull(),
  parentId: int("parent_id").notNull().default(0),
  orderNum: int("order_num").notNull().default(0),
  path: varchar("path", { length: 200 }).notNull(),
  component: varchar("component", { length: 255 }),
  menuType: char("menu_type", { length: 1 }).notNull().default("M"),
  perms: varchar("perms", { length: 100 }),
  visible: char("visible", { length: 1 }).notNull().default("0"),
  status: char("status", { length: 1 }).notNull().default("0"),
  createTime: timestamp("create_time").defaultNow(),
});

export const sys_dept = mysqlTable("sys_dept", {
  deptId: int("dept_id").primaryKey().autoincrement(),
  parentId: int("parent_id").notNull().default(0),
  deptName: varchar("dept_name", { length: 30 }).notNull(),
  orderNum: int("order_num").notNull().default(0),
  status: char("status", { length: 1 }).notNull().default("0"),
  createTime: timestamp("create_time").defaultNow(),
});

export const sys_post = mysqlTable("sys_post", {
  postId: int("post_id").primaryKey().autoincrement(),
  postCode: varchar("post_code", { length: 50 }).notNull().unique(),
  postName: varchar("post_name", { length: 50 }).notNull(),
  postSort: int("post_sort").notNull().default(0),
  status: char("status", { length: 1 }).notNull().default("0"),
  createTime: timestamp("create_time").defaultNow(),
});

export const sys_dict_type = mysqlTable("sys_dict_type", {
  dictId: int("dict_id").primaryKey().autoincrement(),
  dictName: varchar("dict_name", { length: 100 }).notNull(),
  dictType: varchar("dict_type", { length: 100 }).notNull().unique(),
  status: char("status", { length: 1 }).notNull().default("0"),
  createTime: timestamp("create_time").defaultNow(),
});

export const sys_dict_data = mysqlTable("sys_dict_data", {
  dictCode: int("dict_code").primaryKey().autoincrement(),
  dictSort: int("dict_sort").notNull().default(0),
  dictLabel: varchar("dict_label", { length: 100 }).notNull(),
  dictValue: varchar("dict_value", { length: 100 }).notNull(),
  dictType: varchar("dict_type", { length: 100 }).notNull(),
  status: char("status", { length: 1 }).notNull().default("0"),
  createTime: timestamp("create_time").defaultNow(),
});

export const sys_config = mysqlTable("sys_config", {
  configId: int("config_id").primaryKey().autoincrement(),
  configName: varchar("config_name", { length: 100 }).notNull(),
  configKey: varchar("config_key", { length: 100 }).notNull().unique(),
  configValue: varchar("config_value", { length: 500 }).notNull(),
  configType: char("config_type", { length: 1 }).notNull().default("N"),
  createTime: timestamp("create_time").defaultNow(),
});

export const sys_notice = mysqlTable("sys_notice", {
  noticeId: int("notice_id").primaryKey().autoincrement(),
  noticeTitle: varchar("notice_title", { length: 50 }).notNull(),
  noticeType: char("notice_type", { length: 1 }).notNull(),
  status: char("status", { length: 1 }).notNull().default("0"),
  createTime: timestamp("create_time").defaultNow(),
});

export const sys_oper_log = mysqlTable("sys_oper_log", {
  operId: int("oper_id").primaryKey().autoincrement(),
  title: varchar("title", { length: 50 }).notNull(),
  businessType: char("business_type", { length: 20 }).notNull(),
  method: varchar("method", { length: 100 }),
  requestMethod: varchar("request_method", { length: 10 }),
  operName: varchar("oper_name", { length: 50 }),
  operUrl: varchar("oper_url", { length: 255 }),
  operIp: varchar("oper_ip", { length: 128 }),
  operLocation: varchar("oper_location", { length: 255 }),
  operParam: text("oper_param"),
  jsonResult: text("json_result"),
  status: char("status", { length: 1 }).notNull().default("0"),
  errorMsg: text("error_msg"),
  operTime: timestamp("oper_time").defaultNow(),
});

export const sys_login_log = mysqlTable("sys_login_log", {
  infoId: int("info_id").primaryKey().autoincrement(),
  username: varchar("username", { length: 50 }),
  ipaddr: varchar("ipaddr", { length: 128 }),
  loginLocation: varchar("login_location", { length: 255 }),
  loginType: varchar("login_type", { length: 10 }),
  status: char("status", { length: 1 }).notNull().default("0"),
  msg: varchar("msg", { length: 255 }),
  loginTime: timestamp("login_time").defaultNow(),
});
