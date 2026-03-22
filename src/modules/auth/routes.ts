import { Elysia } from "elysia";
import { secured } from "../../common/auth/secured";
import { fail, ok } from "../../common/http/response";
import { securityPlugin, ACCESS_TOKEN_EXPIRE } from "../../plugins/security";
import { OPER_LOG } from "./oper-log";
import {
  AuthFailResponseSchema,
  CaptchaResponseSchema,
  GetInfoAuthResponseSchema,
  LoginAuthResponseSchema,
  LoginAuthSchema,
  LogoutAuthResponseSchema,
  type LoginBody,
} from "./model";
import { authService } from "./service";
import { loginLogService } from "../monitor/login-log/service";
import { onlineService } from "../monitor/online/service";
import { captchaService } from "./captcha";

const parseExpireSeconds = (exp: string): number => {
  const match = exp.match(/^(\d+)([dhms])$/);
  if (!match) {
    return 86400;
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "d":
      return value * 86400;
    case "h":
      return value * 3600;
    case "m":
      return value * 60;
    case "s":
      return value;
    default:
      return 86400;
  }
};

export const authRoutes = new Elysia({
  prefix: "/api/auth",
  name: "auth.routes",
})
  .use(securityPlugin)
  .get(
    "/captcha",
    async () => {
      const { uuid, img } = await captchaService.generate();
      return ok({ uuid, img }, "验证码获取成功");
    },
    {
      response: {
        200: CaptchaResponseSchema,
      },
      detail: {
        tags: ["认证授权"],
        summary: "获取图形验证码",
        description:
          "获取SVG图形验证码，用于登录防暴力破解。返回UUID和Base64编码的SVG图片，验证码5分钟内有效。",
      },
    },
  )
  .post(
    "/login",
    async ({ body, jwt, refreshJwt, request, set }) => {
      const loginBody = body as LoginBody;
      const { uuid, code, username } = loginBody;
      const captchaValid = await captchaService.verify(uuid, code);
      if (!captchaValid) {
        await loginLogService.record({
          username,
          ip: request.headers.get("x-forwarded-for") ?? "127.0.0.1",
          status: "1",
          msg: "验证码错误",
        });
        set.status = 400;
        return fail(400, "验证码错误");
      }

      const authUser = await authService.login(loginBody);
      if (!authUser) {
        await loginLogService.record({
          username,
          ip: request.headers.get("x-forwarded-for") ?? "127.0.0.1",
          status: "1",
          msg: "用户名或密码错误",
        });
        set.status = 401;
        return fail(401, "用户名或密码错误");
      }

      const token: string = await jwt.sign({
        userId: authUser.userId,
        username: authUser.username,
        roles: authUser.roles,
        permissions: authUser.permissions,
        deptId: authUser.deptId,
      });

      const refreshToken: string = await refreshJwt.sign({
        userId: authUser.userId,
        type: "refresh",
      });

      await onlineService.registerSession({
        token,
        userId: authUser.userId,
        username: authUser.username,
        ip: request.headers.get("x-forwarded-for") ?? "127.0.0.1",
      });
      await loginLogService.record({
        username: authUser.username,
        ip: request.headers.get("x-forwarded-for") ?? "127.0.0.1",
        status: "0",
        msg: "登录成功",
      });

      return ok(
        {
          token,
          refreshToken,
          expiresIn: parseExpireSeconds(ACCESS_TOKEN_EXPIRE),
        },
        "登录成功",
      );
    },
    {
      body: LoginAuthSchema,
      response: {
        200: LoginAuthResponseSchema,
        400: AuthFailResponseSchema,
        401: AuthFailResponseSchema,
      },
      detail: {
        tags: ["认证授权"],
        summary: "账号密码登录",
        description:
          "使用用户名、密码和图形验证码进行登录。返回JWT访问令牌（有效期1天）和刷新令牌（有效期7天）。登录成功后会记录登录日志并创建在线会话。",
      },
    },
  )
  .post(
    "/refresh",
    async ({ jwt, refreshJwt, request, set }) => {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        set.status = 401;
        return fail(401, "刷新令牌无效");
      }

      const refreshToken = authHeader.slice(7);
      const payload = (await refreshJwt.verify(refreshToken)) as {
        userId: number;
        type: string;
      } | null;

      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (!payload || payload.type !== "refresh") {
        set.status = 401;
        return fail(401, "刷新令牌无效或已过期");
      }

      const profile = await authService.getProfile(payload.userId);
      if (!profile) {
        set.status = 401;
        return fail(401, "用户不存在或已被禁用");
      }

      const newToken: string = await jwt.sign({
        userId: profile.userId,
        username: profile.username,
        roles: profile.roles,
        permissions: profile.permissions,
        deptId: profile.deptId,
      });

      const newRefreshToken: string = await refreshJwt.sign({
        userId: profile.userId,
        type: "refresh",
      });

      return ok(
        {
          token: newToken,
          refreshToken: newRefreshToken,
          expiresIn: parseExpireSeconds(ACCESS_TOKEN_EXPIRE),
        },
        "刷新成功",
      );
    },
    {
      response: {
        200: LoginAuthResponseSchema,
        401: AuthFailResponseSchema,
      },
      detail: {
        tags: ["认证授权"],
        summary: "刷新访问令牌",
        description:
          "使用刷新令牌获取新的访问令牌。刷新令牌有效期7天，每次刷新后会获得新的刷新令牌。",
      },
    },
  )
  .post(
    "/logout",
    secured({ operLog: OPER_LOG.LOGOUT }, async ({ bearer }) => {
      if (typeof bearer === "string") {
        await onlineService.removeSession(bearer);
      }

      return ok(true, "退出成功");
    }),
    {
      response: {
        200: LogoutAuthResponseSchema,
        401: AuthFailResponseSchema,
      },
      detail: {
        tags: ["认证授权"],
        summary: "退出登录",
        description:
          "注销当前登录会话，清除在线用户记录。需携带有效的访问令牌。",
      },
    },
  )
  .get(
    "/getInfo",
    secured({}, async ({ currentUser, set }) => {
      const profile = await authService.getProfile(currentUser.userId);
      if (!profile) {
        set.status = 401;
        return fail(401, "用户不存在或已被禁用");
      }

      return ok({
        user: {
          userId: profile.userId,
          userName: profile.username,
          nickName: profile.nickName,
          deptId: profile.deptId,
        },
        roles: profile.roles,
        permissions: profile.permissions,
      });
    }),
    {
      response: {
        200: GetInfoAuthResponseSchema,
        401: AuthFailResponseSchema,
      },
      detail: {
        tags: ["认证授权"],
        summary: "获取当前登录用户信息",
        description:
          "获取当前登录用户的详细信息，包括用户ID、用户名、昵称、角色列表、权限列表。需携带有效的访问令牌。",
      },
    },
  );
