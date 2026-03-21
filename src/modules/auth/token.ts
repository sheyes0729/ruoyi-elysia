export type JwtUserPayload = {
  userId: number;
  username: string;
  roles: string[];
  permissions: string[];
};

export type JwtRefreshPayload = {
  userId: number;
  type: "refresh";
};
