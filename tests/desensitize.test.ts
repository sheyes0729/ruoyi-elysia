import { describe, test, expect } from "bun:test";
import {
  isSensitiveField,
  maskString,
  maskSensitiveData,
  maskObject,
} from "../src/common/desensitize";

describe("Desensitize Utils", () => {
  describe("isSensitiveField", () => {
    test("should identify password fields as sensitive", () => {
      expect(isSensitiveField("password")).toBe(true);
      expect(isSensitiveField("userPassword")).toBe(true);
      expect(isSensitiveField("PASSWORD")).toBe(true);
    });

    test("should identify token fields as sensitive", () => {
      expect(isSensitiveField("token")).toBe(true);
      expect(isSensitiveField("accessToken")).toBe(true);
      expect(isSensitiveField("refreshToken")).toBe(true);
    });

    test("should identify secret fields as sensitive", () => {
      expect(isSensitiveField("secret")).toBe(true);
      expect(isSensitiveField("secretKey")).toBe(true);
      expect(isSensitiveField("privateKey")).toBe(true);
    });

    test("should identify ID fields as sensitive", () => {
      expect(isSensitiveField("idCard")).toBe(true);
      expect(isSensitiveField("idNumber")).toBe(true);
    });

    test("should identify non-sensitive fields", () => {
      expect(isSensitiveField("username")).toBe(false);
      expect(isSensitiveField("email")).toBe(false);
      expect(isSensitiveField("status")).toBe(false);
      expect(isSensitiveField("address")).toBe(false);
    });
  });

  describe("maskString", () => {
    test("should mask long strings keeping first and last 3 chars", () => {
      const result = maskString("MyVeryLongPassword123");
      expect(result).toBe("MyV********123");
    });

    test("should fully mask short strings", () => {
      const result = maskString("Ab");
      expect(result).toBe("**");
    });

    test("should return empty string for empty input", () => {
      expect(maskString("")).toBe("");
      expect(maskString("A")).toBe("*");
    });

    test("should handle exactly 6 chars (boundary)", () => {
      const result = maskString("Abcdef");
      expect(result).toBe("******");
    });
  });

  describe("maskSensitiveData", () => {
    test("should mask password fields", () => {
      const data = { username: "john", password: "secret123" };
      const result = maskSensitiveData(data);
      expect(result.password).toBe("sec***123");
      expect(result.username).toBeUndefined();
    });

    test("should mask token fields", () => {
      const data = { token: "abc123def456" };
      const result = maskSensitiveData(data);
      expect(result.token).toBe("abc******456");
    });

    test("should handle case-insensitive field matching", () => {
      const data = { PASSWORD: "secret", Token: "token123" };
      const result = maskSensitiveData(data);
      expect(result.PASSWORD).toBe("******");
      expect(result.Token).toBe("tok**123");
    });

    test("should return empty object for no sensitive fields", () => {
      const data = { username: "john", email: "john@example.com" };
      const result = maskSensitiveData(data);
      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe("maskObject", () => {
    test("should mask sensitive fields and return full object", () => {
      const data = { username: "john", password: "secret123" };
      const result = maskObject(data);
      expect(result.username).toBe("john");
      expect(result.password).toBe("sec***123");
    });

    test("should handle nested objects via field name matching", () => {
      const data = { user: { name: "john" }, secretKey: "key123456" };
      const result = maskObject(data);
      expect(result.user).toEqual({ name: "john" });
      expect(result.secretKey).toBe("key***456");
    });
  });
});
