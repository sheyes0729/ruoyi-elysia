import { describe, it, expect, beforeAll } from "bun:test";
import { app } from "../src/app";

export const BASE_URL = "http://localhost:4000";

export async function sendRequest(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
) {
  const url = `${BASE_URL}${path}`;
  const { method = "GET", body, headers = {} } = options;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  return { status: response.status, data };
}

describe("Auth API", () => {
  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const { status, data } = await sendRequest("/api/auth/login", {
        method: "POST",
        body: {
          username: "admin",
          password: "admin123",
        },
      });

      expect(status).toBe(200);
      expect(data.code).toBe(200);
      expect(data.data.token).toBeDefined();
    });

    it("should fail login with invalid credentials", async () => {
      const { status, data } = await sendRequest("/api/auth/login", {
        method: "POST",
        body: {
          username: "admin",
          password: "wrongpassword",
        },
      });

      expect(status).toBe(401);
      expect(data.code).toBe(401);
      expect(data.msg).toContain("用户名或密码错误");
    });

    it("should fail login with non-existent user", async () => {
      const { status, data } = await sendRequest("/api/auth/login", {
        method: "POST",
        body: {
          username: "nonexistent",
          password: "password",
        },
      });

      expect(status).toBe(401);
      expect(data.code).toBe(401);
    });
  });

  describe("GET /api/auth/getInfo", () => {
    it("should get user info with valid token", async () => {
      const loginResponse = await sendRequest("/api/auth/login", {
        method: "POST",
        body: {
          username: "admin",
          password: "admin123",
        },
      });

      const token = loginResponse.data.data.token;

      const { status, data } = await sendRequest("/api/auth/getInfo", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(status).toBe(200);
      expect(data.code).toBe(200);
      expect(data.data.user.userName).toBe("admin");
      expect(data.data.roles).toContain("admin");
    });

    it("should reject request without token", async () => {
      const { status, data } = await sendRequest("/api/auth/getInfo");

      expect(status).toBe(401);
      expect(data.code).toBe(401);
    });
  });
});
