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
  permissions: string[];
};

const roles: SystemRole[] = [
  {
    roleId: 1,
    roleKey: "admin",
    roleName: "超级管理员",
    status: "0",
    permissions: ["*:*:*"],
  },
  {
    roleId: 2,
    roleKey: "common",
    roleName: "普通用户",
    status: "0",
    permissions: ["system:user:list", "system:role:list"],
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

export const accessDataStore = {
  users,
  roles,
};
