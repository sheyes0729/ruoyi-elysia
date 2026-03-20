export type SystemUser = {
  userId: number;
  username: string;
  nickName: string;
  password: string;
  status: "0" | "1";
  roleIds: number[];
};

export type SystemRole = {
  roleId: number;
  roleKey: string;
  roleName: string;
  status: "0" | "1";
  menuIds: number[];
  permissions: string[];
};

export type SystemConfig = {
  configId: number;
  configName: string;
  configKey: string;
  configValue: string;
  configType: "Y" | "N";
};

export type SystemNotice = {
  noticeId: number;
  noticeTitle: string;
  noticeType: "1" | "2";
  status: "0" | "1";
  createTime: string;
};

export type SystemDictType = {
  dictId: number;
  dictName: string;
  dictType: string;
  status: "0" | "1";
};

export type SystemDictData = {
  dictCode: number;
  dictSort: number;
  dictLabel: string;
  dictValue: string;
  dictType: string;
  status: "0" | "1";
};

export type SystemMenu = {
  menuId: number;
  menuName: string;
  parentId: number;
  orderNum: number;
  path: string;
  component: string;
  menuType: "M" | "C" | "F";
  perms: string;
  visible: "0" | "1";
  status: "0" | "1";
};

export type SystemDept = {
  deptId: number;
  parentId: number;
  deptName: string;
  orderNum: number;
  status: "0" | "1";
};

export type SystemPost = {
  postId: number;
  postCode: string;
  postName: string;
  postSort: number;
  status: "0" | "1";
};

const roles: SystemRole[] = [
  {
    roleId: 1,
    roleKey: "admin",
    roleName: "超级管理员",
    status: "0",
    menuIds: [1, 100, 101, 102],
    permissions: ["*:*:*"],
  },
  {
    roleId: 2,
    roleKey: "common",
    roleName: "普通用户",
    status: "0",
    menuIds: [1, 100, 101, 102],
    permissions: [
      "system:user:list",
      "system:user:add",
      "system:user:edit",
      "system:user:resetPwd",
      "system:user:export",
      "system:user:remove",
      "system:role:list",
      "system:role:add",
      "system:role:edit",
      "system:role:auth",
      "system:role:export",
      "system:role:remove",
      "system:config:list",
      "system:config:add",
      "system:config:edit",
      "system:config:export",
      "system:config:remove",
      "system:notice:list",
      "system:notice:add",
      "system:notice:edit",
      "system:notice:export",
      "system:notice:remove",
      "system:dict:type:list",
      "system:dict:type:add",
      "system:dict:type:edit",
      "system:dict:type:export",
      "system:dict:type:remove",
      "system:dict:data:list",
      "system:dict:data:add",
      "system:dict:data:edit",
      "system:dict:data:export",
      "system:dict:data:remove",
      "system:menu:list",
      "system:menu:add",
      "system:menu:edit",
      "system:menu:export",
      "system:menu:remove",
      "system:dept:list",
      "system:dept:add",
      "system:dept:edit",
      "system:dept:export",
      "system:dept:remove",
      "system:post:list",
      "system:post:add",
      "system:post:edit",
      "system:post:export",
      "system:post:remove",
      "monitor:online:list",
      "monitor:logininfor:list",
      "monitor:logininfor:export",
      "monitor:logininfor:remove",
      "monitor:operlog:list",
      "monitor:operlog:export",
      "monitor:operlog:remove",
    ],
  },
];

const users: SystemUser[] = [
  {
    userId: 1,
    username: "admin",
    nickName: "若依管理员",
    password: "admin123",
    status: "0",
    roleIds: [1],
  },
  {
    userId: 2,
    username: "ry",
    nickName: "若依用户",
    password: "ry123456",
    status: "0",
    roleIds: [2],
  },
];

const configs: SystemConfig[] = [
  {
    configId: 1,
    configName: "主框架页-默认皮肤样式名称",
    configKey: "sys.index.skinName",
    configValue: "skin-blue",
    configType: "Y",
  },
  {
    configId: 2,
    configName: "用户管理-账号初始密码",
    configKey: "sys.user.initPassword",
    configValue: "123456",
    configType: "Y",
  },
];

const notices: SystemNotice[] = [
  {
    noticeId: 1,
    noticeTitle: "系统升级通知",
    noticeType: "2",
    status: "0",
    createTime: "2026-03-01T09:00:00.000Z",
  },
  {
    noticeId: 2,
    noticeTitle: "新功能上线公告",
    noticeType: "1",
    status: "0",
    createTime: "2026-03-10T10:30:00.000Z",
  },
];

const dictTypes: SystemDictType[] = [
  {
    dictId: 1,
    dictName: "用户性别",
    dictType: "sys_user_sex",
    status: "0",
  },
  {
    dictId: 2,
    dictName: "公告类型",
    dictType: "sys_notice_type",
    status: "0",
  },
];

const dictData: SystemDictData[] = [
  {
    dictCode: 1,
    dictSort: 1,
    dictLabel: "男",
    dictValue: "0",
    dictType: "sys_user_sex",
    status: "0",
  },
  {
    dictCode: 2,
    dictSort: 2,
    dictLabel: "女",
    dictValue: "1",
    dictType: "sys_user_sex",
    status: "0",
  },
  {
    dictCode: 3,
    dictSort: 1,
    dictLabel: "通知",
    dictValue: "1",
    dictType: "sys_notice_type",
    status: "0",
  },
  {
    dictCode: 4,
    dictSort: 2,
    dictLabel: "公告",
    dictValue: "2",
    dictType: "sys_notice_type",
    status: "0",
  },
];

const menus: SystemMenu[] = [
  {
    menuId: 1,
    menuName: "系统管理",
    parentId: 0,
    orderNum: 1,
    path: "system",
    component: "Layout",
    menuType: "M",
    perms: "",
    visible: "0",
    status: "0",
  },
  {
    menuId: 100,
    menuName: "用户管理",
    parentId: 1,
    orderNum: 1,
    path: "user",
    component: "system/user/index",
    menuType: "C",
    perms: "system:user:list",
    visible: "0",
    status: "0",
  },
  {
    menuId: 101,
    menuName: "角色管理",
    parentId: 1,
    orderNum: 2,
    path: "role",
    component: "system/role/index",
    menuType: "C",
    perms: "system:role:list",
    visible: "0",
    status: "0",
  },
  {
    menuId: 102,
    menuName: "菜单管理",
    parentId: 1,
    orderNum: 3,
    path: "menu",
    component: "system/menu/index",
    menuType: "C",
    perms: "system:menu:list",
    visible: "0",
    status: "0",
  },
];

const depts: SystemDept[] = [
  {
    deptId: 100,
    parentId: 0,
    deptName: "若依科技",
    orderNum: 1,
    status: "0",
  },
  {
    deptId: 101,
    parentId: 100,
    deptName: "深圳总公司",
    orderNum: 1,
    status: "0",
  },
  {
    deptId: 102,
    parentId: 100,
    deptName: "长沙分公司",
    orderNum: 2,
    status: "0",
  },
];

const posts: SystemPost[] = [
  {
    postId: 1,
    postCode: "ceo",
    postName: "董事长",
    postSort: 1,
    status: "0",
  },
  {
    postId: 2,
    postCode: "se",
    postName: "项目经理",
    postSort: 2,
    status: "0",
  },
  {
    postId: 3,
    postCode: "hr",
    postName: "人力资源",
    postSort: 3,
    status: "0",
  },
];

export const accessDataStore = {
  users,
  roles,
  configs,
  notices,
  dictTypes,
  dictData,
  menus,
  depts,
  posts,
};
