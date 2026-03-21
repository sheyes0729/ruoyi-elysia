import type {
  CreateDictDataBody,
  DictDataImportRow,
  DictDataListItem,
  ListDictDataQuery,
  UpdateDictDataBody,
} from "./model";
import type { ImportResult } from "../../../common/http/csv";
import { dictDataRepository, dictTypeRepository } from "../../../repository";

type CreateDictDataResult =
  | { success: true; dictCode: number }
  | { success: false; reason: "dict_type_not_found" };

type UpdateDictDataResult =
  | { success: true }
  | { success: false; reason: "dict_data_not_found" | "dict_type_not_found" };

type ImportDictDataResult = ImportResult<DictDataImportRow>;

export class DictDataService {
  async list(query?: ListDictDataQuery): Promise<DictDataListItem[]> {
    const dictDataItems = await dictDataRepository.findAll();

    const source = dictDataItems.map((item) => ({
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

  async removeBatch(ids: number[]): Promise<number> {
    return dictDataRepository.deleteBatch(ids);
  }

  async create(payload: CreateDictDataBody): Promise<CreateDictDataResult> {
    if (!(await this.dictTypeExists(payload.dictType))) {
      return { success: false, reason: "dict_type_not_found" };
    }

    const dictCode = await dictDataRepository.create({
      dictSort: payload.dictSort,
      dictLabel: payload.dictLabel,
      dictValue: payload.dictValue,
      dictType: payload.dictType,
      status: payload.status,
    });

    return { success: true, dictCode };
  }

  async update(payload: UpdateDictDataBody): Promise<UpdateDictDataResult> {
    const target = await dictDataRepository.findById(payload.dictCode);
    if (!target) {
      return { success: false, reason: "dict_data_not_found" };
    }

    if (!(await this.dictTypeExists(payload.dictType))) {
      return { success: false, reason: "dict_type_not_found" };
    }

    await dictDataRepository.update(payload.dictCode, {
      dictSort: payload.dictSort,
      dictLabel: payload.dictLabel,
      dictValue: payload.dictValue,
      dictType: payload.dictType,
      status: payload.status,
    });

    return { success: true };
  }

  private async dictTypeExists(dictType: string): Promise<boolean> {
    const result = await dictTypeRepository.findByDictType(dictType);
    return result !== null;
  }

  async importDictData(
    rows: Record<string, string>[],
  ): Promise<ImportDictDataResult> {
    const success: DictDataImportRow[] = [];
    const failures: {
      row: number;
      data: Record<string, string>;
      error: string;
    }[] = [];

    for (const row of rows) {
      const rowNum = rows.indexOf(row) + 2;

      const dictSortStr = row["字典排序"].trim();
      const dictLabel = row["字典标签"].trim();
      const dictValue = row["字典键值"].trim();
      const dictType = row["字典类型"].trim();
      const status = row["状态"].trim();

      if (!dictSortStr) {
        failures.push({ row: rowNum, data: row, error: "字典排序为空" });
        continue;
      }

      const dictSort = parseInt(dictSortStr, 10);
      if (isNaN(dictSort)) {
        failures.push({ row: rowNum, data: row, error: "字典排序必须为数字" });
        continue;
      }

      if (!dictLabel) {
        failures.push({ row: rowNum, data: row, error: "字典标签为空" });
        continue;
      }

      if (dictLabel.length > 100) {
        failures.push({
          row: rowNum,
          data: row,
          error: "字典标签长度不能超过100",
        });
        continue;
      }

      if (!dictValue) {
        failures.push({ row: rowNum, data: row, error: "字典键值为空" });
        continue;
      }

      if (dictValue.length > 100) {
        failures.push({
          row: rowNum,
          data: row,
          error: "字典键值长度不能超过100",
        });
        continue;
      }

      if (!dictType) {
        failures.push({ row: rowNum, data: row, error: "字典类型为空" });
        continue;
      }

      if (!(await this.dictTypeExists(dictType))) {
        failures.push({ row: rowNum, data: row, error: "字典类型不存在" });
        continue;
      }

      if (!status || !["0", "1"].includes(status)) {
        failures.push({ row: rowNum, data: row, error: "状态必须为0或1" });
        continue;
      }

      await dictDataRepository.create({
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
    }

    return { success, failures };
  }
}

export const dictDataService = new DictDataService();
