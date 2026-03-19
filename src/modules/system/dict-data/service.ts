import { accessDataStore } from "../access-data";
import type { DictDataListItem, ListDictDataQuery } from "./model";

export class DictDataService {
  list(query?: ListDictDataQuery): DictDataListItem[] {
    const source = accessDataStore.dictData.map((item) => ({
      dictCode: item.dictCode,
      dictSort: item.dictSort,
      dictLabel: item.dictLabel,
      dictValue: item.dictValue,
      dictType: item.dictType,
      status: item.status,
    }));

    if (!query) {
      return source;
    }

    return source.filter((item) => {
      if (query.dictType && !item.dictType.includes(query.dictType)) {
        return false;
      }

      if (query.dictLabel && !item.dictLabel.includes(query.dictLabel)) {
        return false;
      }

      if (query.status && item.status !== query.status) {
        return false;
      }

      return true;
    });
  }

  removeBatch(ids: number[]): number {
    const idSet = new Set(ids);
    const before = accessDataStore.dictData.length;
    accessDataStore.dictData.splice(
      0,
      accessDataStore.dictData.length,
      ...accessDataStore.dictData.filter((item) => !idSet.has(item.dictCode))
    );
    return before - accessDataStore.dictData.length;
  }
}

export const dictDataService = new DictDataService();
