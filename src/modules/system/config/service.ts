import { removeBatchByNumericId } from "../../../common/data/array";
import { accessDataStore } from "../access-data";
import type {
  ConfigListItem,
  CreateConfigBody,
  ListConfigQuery,
  UpdateConfigBody,
} from "./model";

type CreateConfigResult =
  | { success: true; configId: number }
  | { success: false; reason: "config_key_exists" };

type UpdateConfigResult =
  | { success: true }
  | { success: false; reason: "config_not_found" | "config_key_exists" };

export class ConfigService {
  list(query?: ListConfigQuery): ConfigListItem[] {
    const source = accessDataStore.configs.map((item) => ({
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

  removeBatch(ids: number[]): number {
    return removeBatchByNumericId(accessDataStore.configs, ids, (item) => item.configId);
  }

  create(payload: CreateConfigBody): CreateConfigResult {
    const existed = accessDataStore.configs.some(
      (item) => item.configKey === payload.configKey
    );
    if (existed) {
      return { success: false, reason: "config_key_exists" };
    }

    const nextId =
      accessDataStore.configs.reduce(
        (maxConfigId, item) => Math.max(maxConfigId, item.configId),
        0
      ) + 1;

    accessDataStore.configs.push({
      configId: nextId,
      configName: payload.configName,
      configKey: payload.configKey,
      configValue: payload.configValue,
      configType: payload.configType,
    });

    return { success: true, configId: nextId };
  }

  update(payload: UpdateConfigBody): UpdateConfigResult {
    const target = accessDataStore.configs.find(
      (item) => item.configId === payload.configId
    );
    if (!target) {
      return { success: false, reason: "config_not_found" };
    }

    const existed = accessDataStore.configs.some(
      (item) =>
        item.configKey === payload.configKey && item.configId !== payload.configId
    );
    if (existed) {
      return { success: false, reason: "config_key_exists" };
    }

    target.configName = payload.configName;
    target.configKey = payload.configKey;
    target.configValue = payload.configValue;
    target.configType = payload.configType;

    return { success: true };
  }
}

export const configService = new ConfigService();
