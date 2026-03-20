import { removeBatchByNumericId } from "../../../common/data/array";
import { accessDataStore } from "../access-data";
import type {
  CreateDictDataBody,
  DictDataListItem,
  ListDictDataQuery,
  UpdateDictDataBody,
} from "./model";

type CreateDictDataResult =
  | { success: true; dictCode: number }
  | { success: false; reason: "dict_type_not_found" };

type UpdateDictDataResult =
  | { success: true }
  | { success: false; reason: "dict_data_not_found" | "dict_type_not_found" };

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

  create(payload: CreateDictDataBody): CreateDictDataResult {
    if (!this.dictTypeExists(payload.dictType)) {
      return { success: false, reason: "dict_type_not_found" };
    }

    const nextCode =
      accessDataStore.dictData.reduce(
        (maxDictCode, item) => Math.max(maxDictCode, item.dictCode),
        0
      ) + 1;

    accessDataStore.dictData.push({
      dictCode: nextCode,
      dictSort: payload.dictSort,
      dictLabel: payload.dictLabel,
      dictValue: payload.dictValue,
      dictType: payload.dictType,
      status: payload.status,
    });

    return { success: true, dictCode: nextCode };
  }

  update(payload: UpdateDictDataBody): UpdateDictDataResult {
    const target = accessDataStore.dictData.find(
      (item) => item.dictCode === payload.dictCode
    );
    if (!target) {
      return { success: false, reason: "dict_data_not_found" };
    }

    if (!this.dictTypeExists(payload.dictType)) {
      return { success: false, reason: "dict_type_not_found" };
    }

    target.dictSort = payload.dictSort;
    target.dictLabel = payload.dictLabel;
    target.dictValue = payload.dictValue;
    target.dictType = payload.dictType;
    target.status = payload.status;

    return { success: true };
  }

  private dictTypeExists(dictType: string): boolean {
    return accessDataStore.dictTypes.some((item) => item.dictType === dictType);
  }
}

export const dictDataService = new DictDataService();
