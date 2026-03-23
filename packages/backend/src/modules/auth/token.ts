export type JwtUserPayload = {
  userId: number;
  username: string;
  roles: string[];
  permissions: string[];
  deptId?: number;
};

export type JwtRefreshPayload = {
  userId: number;
  type: "refresh";
};
