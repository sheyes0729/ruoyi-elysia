import { db } from "./index";
import {
  sys_user,
  sys_role,
  sys_user_role,
  sys_menu,
  sys_dept,
  sys_post,
  sys_dict_type,
  sys_dict_data,
  sys_config,
  sys_notice,
} from "./schema";

async function seed() {
  console.log("Seeding database...");

  await db.insert(sys_user).values([
    {
      username: "admin",
      nickName: "若依管理员",
      password: "$2a$10$Sp.3bjpSqNi/o3nADfvKaOTCo2iFQMK23iX6.8jLLUPruozt7Eyy.",
      status: "0",
    },
    {
      username: "ry",
      nickName: "若依用户",
      password: "$2a$10$pAyZd/Qux/NujmgH1J86x.eJ.UqfnqwL1r72gSJ1zk9GbtO/ZLrhm",
      status: "0",
    },
  ]);

  await db.insert(sys_role).values([
    {
      roleKey: "admin",
      roleName: "超级管理员",
      status: "0",
      menuIds: JSON.stringify([1, 100, 101, 102]),
      permissions: JSON.stringify(["*:*:*"]),
    },
    {
      roleKey: "common",
      roleName: "普通用户",
      status: "0",
      menuIds: JSON.stringify([1, 100, 101, 102]),
      permissions: JSON.stringify([
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
      ]),
    },
  ]);

  await db.insert(sys_user_role).values([
    { userId: 1, roleId: 1 },
    { userId: 2, roleId: 2 },
  ]);

  await db.insert(sys_menu).values([
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
  ]);

  await db.insert(sys_dept).values([
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
  ]);

  await db.insert(sys_post).values([
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
  ]);

  await db.insert(sys_dict_type).values([
    { dictId: 1, dictName: "用户性别", dictType: "sys_user_sex", status: "0" },
    {
      dictId: 2,
      dictName: "公告类型",
      dictType: "sys_notice_type",
      status: "0",
    },
  ]);

  await db.insert(sys_dict_data).values([
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
  ]);

  await db.insert(sys_config).values([
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
  ]);

  await db.insert(sys_notice).values([
    {
      noticeId: 1,
      noticeTitle: "系统升级通知",
      noticeType: "2",
      status: "0",
    },
    {
      noticeId: 2,
      noticeTitle: "新功能上线公告",
      noticeType: "1",
      status: "0",
    },
  ]);

  console.log("Database seeded successfully!");
}

seed().catch(console.error);
