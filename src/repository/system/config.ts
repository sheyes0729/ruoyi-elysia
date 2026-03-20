import type { SystemConfig } from "../../modules/system/access-data";
import { accessDataStore } from "../../modules/system/access-data";
import type { Repository } from "../base";

export interface ConfigRepository extends Repository<SystemConfig, number> {
  findByConfigKey(configKey: string): SystemConfig | null;
}

export class InMemoryConfigRepository implements ConfigRepository {
  findAll(): SystemConfig[] {
    return [...accessDataStore.configs];
  }

  findById(configId: number): SystemConfig | null {
    return accessDataStore.configs.find((c) => c.configId === configId) || null;
  }

  findByConfigKey(configKey: string): SystemConfig | null {
    return (
      accessDataStore.configs.find((c) => c.configKey === configKey) || null
    );
  }

  create(data: Partial<SystemConfig>): number {
    const nextId =
      accessDataStore.configs.reduce((max, c) => Math.max(max, c.configId), 0) +
      1;

    const newConfig: SystemConfig = {
      configId: nextId,
      configName: data.configName || "",
      configKey: data.configKey || "",
      configValue: data.configValue || "",
      configType: data.configType || "N",
    };

    accessDataStore.configs.push(newConfig);
    return nextId;
  }

  update(configId: number, data: Partial<SystemConfig>): boolean {
    const config = accessDataStore.configs.find((c) => c.configId === configId);
    if (!config) {return false;}

    Object.assign(config, data);
    return true;
  }

  delete(configId: number): boolean {
    const index = accessDataStore.configs.findIndex((c) => c.configId === configId);
    if (index === -1) {return false;}

    accessDataStore.configs.splice(index, 1);
    return true;
  }

  deleteBatch(configIds: number[]): number {
    let count = 0;
    for (const configId of configIds) {
      const index = accessDataStore.configs.findIndex((c) => c.configId === configId);
      if (index !== -1) {
        accessDataStore.configs.splice(index, 1);
        count++;
      }
    }
    return count;
  }
}

export const configRepository = new InMemoryConfigRepository();
