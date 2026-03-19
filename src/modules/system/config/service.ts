import { accessDataStore } from "../access-data";
import type { ConfigListItem, ListConfigQuery } from "./model";

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
}

export const configService = new ConfigService();
