import { accessDataStore } from "../access-data";
import type { DictTypeListItem, ListDictTypeQuery } from "./model";

export class DictTypeService {
  list(query?: ListDictTypeQuery): DictTypeListItem[] {
    const source = accessDataStore.dictTypes.map((item) => ({
      dictId: item.dictId,
      dictName: item.dictName,
      dictType: item.dictType,
      status: item.status,
    }));

    if (!query) {
      return source;
    }

    return source.filter((item) => {
      if (query.dictName && !item.dictName.includes(query.dictName)) {
        return false;
      }

      if (query.dictType && !item.dictType.includes(query.dictType)) {
        return false;
      }

      if (query.status && item.status !== query.status) {
        return false;
      }

      return true;
    });
  }
}

export const dictTypeService = new DictTypeService();
