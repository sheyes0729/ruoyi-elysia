import { describe, it, expect, beforeAll } from "bun:test";
import { sendRequest } from "./auth.test";

describe("User API", () => {
  let adminToken: string;

  beforeAll(async () => {
    const loginResponse = await sendRequest("/api/auth/login", {
      method: "POST",
      body: {
        username: "admin",
        password: "admin123",
      },
    });
    adminToken = loginResponse.data.data.token;
  });

  describe("GET /api/system/user/list", () => {
    it("should get user list with admin token", async () => {
      const { status, data } = await sendRequest("/api/system/user/list", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(status).toBe(200);
      expect(data.code).toBe(200);
      expect(data.data.rows).toBeDefined();
      expect(Array.isArray(data.data.rows)).toBe(true);
    });

    it("should reject request without token", async () => {
      const { status, data } = await sendRequest("/api/system/user/list");

      expect(status).toBe(401);
      expect(data.code).toBe(401);
    });
  });

  describe("POST /api/system/user/export", () => {
    it("should export users with admin token", async () => {
      const url = `http://localhost:4000/api/system/user/export`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text.length).toBeGreaterThan(0);
    });
  });
});

describe("Role API", () => {
  let adminToken: string;

  beforeAll(async () => {
    const loginResponse = await sendRequest("/api/auth/login", {
      method: "POST",
      body: {
        username: "admin",
        password: "admin123",
      },
    });
    adminToken = loginResponse.data.data.token;
  });

  describe("GET /api/system/role/list", () => {
    it("should get role list with admin token", async () => {
      const { status, data } = await sendRequest("/api/system/role/list", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(status).toBe(200);
      expect(data.code).toBe(200);
      expect(data.data.rows).toBeDefined();
      expect(Array.isArray(data.data.rows)).toBe(true);
    });
  });
});

describe("Menu API", () => {
  let adminToken: string;

  beforeAll(async () => {
    const loginResponse = await sendRequest("/api/auth/login", {
      method: "POST",
      body: {
        username: "admin",
        password: "admin123",
      },
    });
    adminToken = loginResponse.data.data.token;
  });

  describe("GET /api/system/menu/list", () => {
    it("should get menu list with admin token", async () => {
      const { status, data } = await sendRequest("/api/system/menu/list", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(status).toBe(200);
      expect(data.code).toBe(200);
      expect(data.data.rows).toBeDefined();
    });
  });
});
