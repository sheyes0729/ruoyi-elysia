import { describe, test, expect } from "bun:test";
import {
  validatePassword,
  checkPasswordStrength,
  DEFAULT_PASSWORD_POLICY,
} from "../src/common/password";

describe("Password Validation", () => {
  describe("validatePassword", () => {
    test("should accept valid password meeting all requirements", () => {
      const result = validatePassword("SecurePass123");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should reject password shorter than minimum length", () => {
      const result = validatePassword("Ab1");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("密码长度至少 8 位");
    });

    test("should reject password without uppercase letter", () => {
      const result = validatePassword("securepass123");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("密码必须包含大写字母");
    });

    test("should reject password without lowercase letter", () => {
      const result = validatePassword("SECUREPASS123");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("密码必须包含小写字母");
    });

    test("should reject password without digit", () => {
      const result = validatePassword("SecurePassword");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("密码必须包含数字");
    });

    test("should accept password with special characters when required", () => {
      const result = validatePassword("SecurePass123!", {
        ...DEFAULT_PASSWORD_POLICY,
        requireSpecial: true,
      });
      expect(result.valid).toBe(true);
    });
  });

  describe("checkPasswordStrength", () => {
    test("should return weak for very short passwords", () => {
      expect(checkPasswordStrength("Ab")).toBe("weak");
    });

    test("should return weak for passwords with only letters", () => {
      expect(checkPasswordStrength("abcdefgh")).toBe("weak");
    });

    test("should return medium for passwords with mixed characters", () => {
      expect(checkPasswordStrength("Password1")).toBe("medium");
    });

    test("should return strong for passwords with all character types", () => {
      expect(checkPasswordStrength("SecurePass123!")).toBe("strong");
    });

    test("should return strong for long passwords with mixed types", () => {
      expect(checkPasswordStrength("MyV3ryStr0ngP@ssw0rd!")).toBe("strong");
    });
  });
});
