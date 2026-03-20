import type { SystemDictData } from "../../modules/system/access-data";
import { accessDataStore } from "../../modules/system/access-data";
import type { Repository } from "../base";

export interface DictDataRepository extends Repository<SystemDictData, number> {
  findByDictType(dictType: string): SystemDictData[];
}

export class InMemoryDictDataRepository implements DictDataRepository {
  findAll(): SystemDictData[] {
    return [...accessDataStore.dictData];
  }

  findById(dictCode: number): SystemDictData | null {
    return (
      accessDataStore.dictData.find((d) => d.dictCode === dictCode) || null
    );
  }

  findByDictType(dictType: string): SystemDictData[] {
    return accessDataStore.dictData.filter((d) => d.dictType === dictType);
  }

  create(data: Partial<SystemDictData>): number {
    const nextCode =
      accessDataStore.dictData.reduce((max, d) => Math.max(max, d.dictCode), 0) +
      1;

    const newDictData: SystemDictData = {
      dictCode: nextCode,
      dictSort: data.dictSort || 0,
      dictLabel: data.dictLabel || "",
      dictValue: data.dictValue || "",
      dictType: data.dictType || "",
      status: data.status || "0",
    };

    accessDataStore.dictData.push(newDictData);
    return nextCode;
  }

  update(dictCode: number, data: Partial<SystemDictData>): boolean {
    const dictData = accessDataStore.dictData.find((d) => d.dictCode === dictCode);
    if (!dictData) {return false;}

    Object.assign(dictData, data);
    return true;
  }

  delete(dictCode: number): boolean {
    const index = accessDataStore.dictData.findIndex((d) => d.dictCode === dictCode);
    if (index === -1) {return false;}

    accessDataStore.dictData.splice(index, 1);
    return true;
  }

  deleteBatch(dictCodes: number[]): number {
    let count = 0;
    for (const dictCode of dictCodes) {
      const index = accessDataStore.dictData.findIndex((d) => d.dictCode === dictCode);
      if (index !== -1) {
        accessDataStore.dictData.splice(index, 1);
        count++;
      }
    }
    return count;
  }
}

export const dictDataRepository = new InMemoryDictDataRepository();
