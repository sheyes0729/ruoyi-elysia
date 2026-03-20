import { removeBatchByNumericId } from "../../../common/data/array";
import { accessDataStore } from "../access-data";
import type {
  CreateDictTypeBody,
  DictTypeListItem,
  ListDictTypeQuery,
  UpdateDictTypeBody,
} from "./model";

type CreateDictTypeResult =
  | { success: true; dictId: number }
  | { success: false; reason: "dict_type_exists" };

type UpdateDictTypeResult =
  | { success: true }
  | { success: false; reason: "dict_type_not_found" | "dict_type_exists" };

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

  removeBatch(ids: number[]): number {
    return removeBatchByNumericId(accessDataStore.dictTypes, ids, (item) => item.dictId);
  }

  create(payload: CreateDictTypeBody): CreateDictTypeResult {
    const existed = accessDataStore.dictTypes.some(
      (item) => item.dictType === payload.dictType
    );
    if (existed) {
      return { success: false, reason: "dict_type_exists" };
    }

    const nextId =
      accessDataStore.dictTypes.reduce(
        (maxDictId, item) => Math.max(maxDictId, item.dictId),
        0
      ) + 1;

    accessDataStore.dictTypes.push({
      dictId: nextId,
      dictName: payload.dictName,
      dictType: payload.dictType,
      status: payload.status,
    });

    return { success: true, dictId: nextId };
  }

  update(payload: UpdateDictTypeBody): UpdateDictTypeResult {
    const target = accessDataStore.dictTypes.find((item) => item.dictId === payload.dictId);
    if (!target) {
      return { success: false, reason: "dict_type_not_found" };
    }

    const previousDictType = target.dictType;

    const existed = accessDataStore.dictTypes.some(
      (item) => item.dictType === payload.dictType && item.dictId !== payload.dictId
    );
    if (existed) {
      return { success: false, reason: "dict_type_exists" };
    }

    target.dictName = payload.dictName;
    target.dictType = payload.dictType;
    target.status = payload.status;

    accessDataStore.dictData
      .filter((item) => item.dictType === previousDictType)
      .forEach((item) => {
        item.dictType = payload.dictType;
      });

    return { success: true };
  }
}

export const dictTypeService = new DictTypeService();
