import { removeBatchByNumericId } from "../../../common/data/array";
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
    return removeBatchByNumericId(accessDataStore.dictData, ids, (item) => item.dictCode);
  }
}

export const dictDataService = new DictDataService();
