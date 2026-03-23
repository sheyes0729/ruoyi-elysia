import { redis, REDIS_KEYS } from "./redis";

export interface IpPolicy {
  allowList: string[];
  denyList: string[];
  enabled: boolean;
}

const DEFAULT_IP_POLICY: IpPolicy = {
  allowList: [],
  denyList: [],
  enabled: false,
};

const getIpPolicyKey = (): string => `${REDIS_KEYS.IP_POLICY}`;

export const ipPolicyService = {
  async getPolicy(): Promise<IpPolicy> {
    try {
      const cached = await redis.get(getIpPolicyKey());
      if (cached) {
        return JSON.parse(cached) as IpPolicy;
      }
    } catch {
      // ignore parse errors
    }
    return { ...DEFAULT_IP_POLICY };
  },

  async setPolicy(policy: IpPolicy): Promise<void> {
    await redis.set(getIpPolicyKey(), JSON.stringify(policy));
  },

  async isIpAllowed(ip: string): Promise<boolean> {
    const policy = await this.getPolicy();

    if (!policy.enabled) {
      return true;
    }

    if (policy.denyList.length > 0) {
      for (const pattern of policy.denyList) {
        if (this.matchIpPattern(ip, pattern)) {
          return false;
        }
      }
    }

    if (policy.allowList.length > 0) {
      for (const pattern of policy.allowList) {
        if (this.matchIpPattern(ip, pattern)) {
          return true;
        }
      }
      return false;
    }

    return true;
  },

  matchIpPattern(ip: string, pattern: string): boolean {
    if (pattern === ip) {
      return true;
    }

    if (pattern.includes("/")) {
      return this.matchCidr(ip, pattern);
    }

    if (pattern.includes("*")) {
      const regex = new RegExp(
        "^" +
          pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") +
          "$",
      );
      return regex.test(ip);
    }

    return false;
  },

  matchCidr(ip: string, cidr: string): boolean {
    const [range, bitsStr] = cidr.split("/");
    const bits = parseInt(bitsStr, 10);

    const ipParts = ip.split(".").map(Number);
    const rangeParts = range.split(".").map(Number);

    if (ipParts.length !== 4 || rangeParts.length !== 4) {
      return false;
    }

    const ipNum =
      (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
    const rangeNum =
      (rangeParts[0] << 24) |
      (rangeParts[1] << 16) |
      (rangeParts[2] << 8) |
      rangeParts[3];

    const mask = bits === 0 ? 0 : ~((1 << (32 - bits)) - 1);

    return (ipNum & mask) === (rangeNum & mask);
  },

  async addToAllowList(ip: string): Promise<void> {
    const policy = await this.getPolicy();
    if (!policy.allowList.includes(ip)) {
      policy.allowList.push(ip);
      await this.setPolicy(policy);
    }
  },

  async addToDenyList(ip: string): Promise<void> {
    const policy = await this.getPolicy();
    if (!policy.denyList.includes(ip)) {
      policy.denyList.push(ip);
      await this.setPolicy(policy);
    }
  },

  async removeFromAllowList(ip: string): Promise<void> {
    const policy = await this.getPolicy();
    policy.allowList = policy.allowList.filter((p) => p !== ip);
    await this.setPolicy(policy);
  },

  async removeFromDenyList(ip: string): Promise<void> {
    const policy = await this.getPolicy();
    policy.denyList = policy.denyList.filter((p) => p !== ip);
    await this.setPolicy(policy);
  },
};
