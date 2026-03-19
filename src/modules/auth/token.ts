export type JwtUserPayload = {
  userId: number;
  username: string;
  roles: string[];
  permissions: string[];
};
