import type {
  ConfigListItem,
  CreateConfigBody,
  ListConfigQuery,
  UpdateConfigBody,
} from "./model";
import { configRepository } from "../../../repository";

type CreateConfigResult =
  | { success: true; configId: number }
  | { success: false; reason: "config_key_exists" };

type UpdateConfigResult =
  | { success: true }
  | { success: false; reason: "config_not_found" | "config_key_exists" };

export class ConfigService {
  async list(query?: ListConfigQuery): Promise<ConfigListItem[]> {
    const configs = await configRepository.findAll();

    const source = configs.map((item) => ({
      configId: item.configId,
      configName: item.configName,
      configKey: item.configKey,
      configValue: item.configValue,
      configType: item.configType,
    }));

    if (!query) {
      return source;
    }

    return source.filter((item) => {
      if (query.configName && !item.configName.includes(query.configName)) {
        return false;
      }

      if (query.configKey && !item.configKey.includes(query.configKey)) {
        return false;
      }

      if (query.configType && item.configType !== query.configType) {
        return false;
      }

      return true;
    });
  }

  async removeBatch(ids: number[]): Promise<number> {
    return configRepository.deleteBatch(ids);
  }

  async create(payload: CreateConfigBody): Promise<CreateConfigResult> {
    const existed = await configRepository.findByConfigKey(payload.configKey);
    if (existed) {
      return { success: false, reason: "config_key_exists" };
    }

    const configId = await configRepository.create({
      configName: payload.configName,
      configKey: payload.configKey,
      configValue: payload.configValue,
      configType: payload.configType,
    });

    return { success: true, configId };
  }

  async update(payload: UpdateConfigBody): Promise<UpdateConfigResult> {
    const target = await configRepository.findById(payload.configId);
    if (!target) {
      return { success: false, reason: "config_not_found" };
    }

    const existed = await configRepository.findByConfigKey(payload.configKey);
    if (existed && existed.configId !== payload.configId) {
      return { success: false, reason: "config_key_exists" };
    }

    await configRepository.update(payload.configId, {
      configName: payload.configName,
      configKey: payload.configKey,
      configValue: payload.configValue,
      configType: payload.configType,
    });

    return { success: true };
  }
}

export const configService = new ConfigService();
