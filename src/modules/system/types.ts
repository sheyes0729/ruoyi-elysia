export type SystemUser = {
  userId: number;
  username: string;
  nickName: string;
  password: string;
  status: "0" | "1";
  roleIds: number[];
  deptId?: number;
};

export type DataScope = "1" | "2" | "3" | "4" | "5";

export const DATA_SCOPE_LABELS: Record<DataScope, string> = {
  "1": "全部数据权限",
  "2": "自定义数据权限",
  "3": "本部门数据权限",
  "4": "本部门及以下数据权限",
  "5": "仅本人数据权限",
};

export type SystemRole = {
  roleId: number;
  roleKey: string;
  roleName: string;
  status: "0" | "1";
  menuIds: number[];
  permissions: string[];
  dataScope: DataScope;
  deptCheckStrictly: "0" | "1";
  deptIds: number[];
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
