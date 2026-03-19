import { bearer } from "@elysiajs/bearer";
import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { env } from "../config/env";
import type { JwtUserPayload } from "../modules/auth/token";

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

export const securityPlugin = new Elysia({ name: "security.plugin" })
  .use(
    jwt({
      name: "jwt",
      secret: env.jwtSecret,
      exp: "1d",
    })
  )
  .use(bearer())
  .resolve({ as: "global" }, async ({ bearer, jwt }) => {
    if (!bearer) {
      return {
        currentUser: null,
      };
    }

    const payload: unknown = await jwt.verify(bearer);
    if (!isJwtUserPayload(payload)) {
      return {
        currentUser: null,
      };
    }

    return {
      currentUser: payload,
    };
  });
