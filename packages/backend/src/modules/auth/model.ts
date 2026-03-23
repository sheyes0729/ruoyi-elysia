import { t } from "elysia";

export const CaptchaResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    uuid: t.String(),
    img: t.String(),
  }),
});

export const LoginAuthSchema = t.Object({
  username: t.String({ minLength: 3 }),
  password: t.String({ minLength: 6 }),
  uuid: t.String(),
  code: t.String({ minLength: 4, maxLength: 4 }),
});

export const LoginAuthResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    token: t.String(),
    refreshToken: t.String(),
    expiresIn: t.Number(),
  }),
});

export const LogoutAuthResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Boolean(),
});

export const GetInfoAuthResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Object({
    user: t.Object({
      userId: t.Number(),
      userName: t.String(),
      nickName: t.String(),
      email: t.String(),
      phone: t.String(),
      avatar: t.String(),
      deptId: t.Optional(t.Number()),
    }),
    roles: t.Array(t.String()),
    permissions: t.Array(t.String()),
  }),
});

export const AuthFailResponseSchema = t.Object({
  code: t.Number(),
  msg: t.String(),
  data: t.Null(),
});

export type LoginBody = typeof LoginAuthSchema.static;

export type AuthUser = {
  userId: number;
  username: string;
  nickName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
  deptId?: number;
};
