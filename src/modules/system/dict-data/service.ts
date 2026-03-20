import { removeBatchByNumericId } from "../../../common/data/array";
import { accessDataStore } from "../access-data";
import type {
  CreateDictDataBody,
  DictDataImportRow,
  DictDataListItem,
  ListDictDataQuery,
  UpdateDictDataBody,
} from "./model";
import type { ImportResult } from "../../../common/http/csv";

type CreateDictDataResult =
  | { success: true; dictCode: number }
  | { success: false; reason: "dict_type_not_found" };

type UpdateDictDataResult =
  | { success: true }
  | { success: false; reason: "dict_data_not_found" | "dict_type_not_found" };

type ImportDictDataResult = ImportResult<DictDataImportRow>;

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

  importDictData(rows: Record<string, string>[]): ImportDictDataResult {
    const success: DictDataImportRow[] = [];
    const failures: { row: number; data: Record<string, string>; error: string }[] = [];

    rows.forEach((row, index) => {
      const rowNum = index + 2;

      const dictSortStr = row["字典排序"]?.trim();
      const dictLabel = row["字典标签"]?.trim();
      const dictValue = row["字典键值"]?.trim();
      const dictType = row["字典类型"]?.trim();
      const status = row["状态"]?.trim();

      if (!dictSortStr) {
        failures.push({ row: rowNum, data: row, error: "字典排序为空" });
        return;
      }

      const dictSort = parseInt(dictSortStr, 10);
      if (isNaN(dictSort)) {
        failures.push({ row: rowNum, data: row, error: "字典排序必须为数字" });
        return;
      }

      if (!dictLabel) {
        failures.push({ row: rowNum, data: row, error: "字典标签为空" });
        return;
      }

      if (dictLabel.length > 100) {
        failures.push({ row: rowNum, data: row, error: "字典标签长度不能超过100" });
        return;
      }

      if (!dictValue) {
        failures.push({ row: rowNum, data: row, error: "字典键值为空" });
        return;
      }

      if (dictValue.length > 100) {
        failures.push({ row: rowNum, data: row, error: "字典键值长度不能超过100" });
        return;
      }

      if (!dictType) {
        failures.push({ row: rowNum, data: row, error: "字典类型为空" });
        return;
      }

      if (!this.dictTypeExists(dictType)) {
        failures.push({ row: rowNum, data: row, error: "字典类型不存在" });
        return;
      }

      if (!status || !["0", "1"].includes(status)) {
        failures.push({ row: rowNum, data: row, error: "状态必须为0或1" });
        return;
      }

      const nextCode =
        accessDataStore.dictData.reduce(
          (maxDictCode, item) => Math.max(maxDictCode, item.dictCode),
          0
        ) + 1;

      accessDataStore.dictData.push({
        dictCode: nextCode,
        dictSort,
        dictLabel,
        dictValue,
        dictType,
        status: status as "0" | "1",
      });

      success.push({
        字典排序: dictSortStr,
        字典标签: dictLabel,
        字典键值: dictValue,
        字典类型: dictType,
        状态: status,
      });
    });

    return { success, failures };
  }
}

export const dictDataService = new DictDataService();
