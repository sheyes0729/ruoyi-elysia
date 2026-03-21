import { bearer } from "@elysiajs/bearer";
import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { env } from "../config/env";
import type { JwtUserPayload, JwtRefreshPayload } from "../modules/auth/token";

const isJwtUserPayload = (value: unknown): value is JwtUserPayload => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<JwtUserPayload>;
  return (
    typeof candidate.userId === "number" &&
    typeof candidate.username === "string" &&
    Array.isArray(candidate.roles) &&
    Array.isArray(candidate.permissions)
  );
};

const isJwtRefreshPayload = (value: unknown): value is JwtRefreshPayload => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<JwtRefreshPayload>;
  return typeof candidate.userId === "number" && candidate.type === "refresh";
};

export const ACCESS_TOKEN_EXPIRE = "1d";
export const REFRESH_TOKEN_EXPIRE = "7d";

export const securityPlugin = new Elysia({ name: "security.plugin" })
  .use(
    jwt({
      name: "jwt",
      secret: env.jwtSecret,
      exp: ACCESS_TOKEN_EXPIRE,
    }),
  )
  .use(
    jwt({
      name: "refreshJwt",
      secret: env.jwtSecret,
      exp: REFRESH_TOKEN_EXPIRE,
    }),
  )
  .use(bearer())
  .resolve({ as: "global" }, async ({ bearer, jwt, refreshJwt }) => {
    if (!bearer) {
      return {
        currentUser: null,
      };
    }

    const payload: unknown = await jwt.verify(bearer);
    if (isJwtUserPayload(payload)) {
      return {
        currentUser: payload,
      };
    }

    const refreshPayload: unknown = await refreshJwt.verify(bearer);
    if (isJwtRefreshPayload(refreshPayload)) {
      return {
        currentUser: null,
        refreshUserId: refreshPayload.userId,
      };
    }

    return {
      currentUser: null,
    };
  });
