import { describe, test, expect } from "bun:test";
import { ipPolicyService } from "../src/plugins/ip-policy";

describe("IP Policy Service", () => {
  describe("matchIpPattern", () => {
    test("should match exact IP", () => {
      expect(ipPolicyService.matchIpPattern("192.168.1.1", "192.168.1.1")).toBe(
        true,
      );
      expect(ipPolicyService.matchIpPattern("192.168.1.1", "192.168.1.2")).toBe(
        false,
      );
    });

    test("should match CIDR notation", () => {
      expect(
        ipPolicyService.matchIpPattern("192.168.1.50", "192.168.1.0/24"),
      ).toBe(true);
      expect(
        ipPolicyService.matchIpPattern("192.168.2.1", "192.168.1.0/24"),
      ).toBe(false);
    });

    test("should match /32 CIDR for exact IP", () => {
      expect(ipPolicyService.matchIpPattern("10.0.0.1", "10.0.0.1/32")).toBe(
        true,
      );
      expect(ipPolicyService.matchIpPattern("10.0.0.2", "10.0.0.1/32")).toBe(
        false,
      );
    });

    test("should handle /0 CIDR (match all)", () => {
      expect(ipPolicyService.matchIpPattern("1.2.3.4", "0.0.0.0/0")).toBe(true);
    });

    test("should return false for non-matching pattern", () => {
      expect(ipPolicyService.matchIpPattern("192.168.1.1", "10.0.0.1")).toBe(
        false,
      );
    });
  });

  describe("isIpAllowed", () => {
    test("should return true when policy is disabled", async () => {
      const result = await ipPolicyService.isIpAllowed("192.168.1.1");
      expect(result).toBe(true);
    });
  });
});
