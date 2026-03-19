import { Elysia } from "elysia";
import { fail, ok } from "../../common/http/response";
import { securityPlugin } from "../../plugins/security";
import {
  AuthFailResponseSchema,
  GetInfoAuthResponseSchema,
  LoginAuthResponseSchema,
  LoginAuthSchema,
  LogoutAuthResponseSchema,
} from "./model";
import { authService } from "./service";

export const authRoutes = new Elysia({ prefix: "/api/auth", name: "auth.routes" })
    .use(securityPlugin)
    .post(
        "/login",
        async ({ body, jwt, set }) => {
            const authUser = authService.login(body);
            if (!authUser) {
                set.status = 401;
                return fail(401, "用户名或密码错误");
            }

            const token: string = await jwt.sign({
                userId: authUser.userId,
                username: authUser.username,
                roles: authUser.roles,
                permissions: authUser.permissions,
            });

            return ok({ token }, "登录成功");
        },
        {
            body: LoginAuthSchema,
            response: {
                200: LoginAuthResponseSchema,
                401: AuthFailResponseSchema,
            },
            detail: {
                tags: ["认证授权"],
                summary: "账号密码登录",
            },
        }
    )
    .post(
        "/logout",
        ({ currentUser, set }) => {
            if (!currentUser) {
                set.status = 401;
                return fail(401, "未登录或登录已失效");
            }

            return ok(true, "退出成功");
        },
        {
            response: {
                200: LogoutAuthResponseSchema,
                401: AuthFailResponseSchema,
            },
            detail: {
                tags: ["认证授权"],
                summary: "退出登录",
            },
        }
    )
    .get(
        "/getInfo",
        ({ currentUser, set }) => {
            if (!currentUser) {
                set.status = 401;
                return fail(401, "未登录或登录已失效");
            }

            const profile = authService.getProfile(currentUser.userId);
            if (!profile) {
                set.status = 401;
                return fail(401, "用户不存在或已被禁用");
            }

            return ok({
                user: {
                    userId: profile.userId,
                    userName: profile.username,
                    nickName: profile.nickName,
                },
                roles: profile.roles,
                permissions: profile.permissions,
            });
        },
        {
            response: {
                200: GetInfoAuthResponseSchema,
                401: AuthFailResponseSchema,
            },
            detail: {
                tags: ["认证授权"],
                summary: "获取当前登录用户信息",
            },
        }
    );
