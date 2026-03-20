import type { SystemDictType } from "../../modules/system/access-data";
import { accessDataStore } from "../../modules/system/access-data";
import type { Repository } from "../base";

export interface DictTypeRepository extends Repository<SystemDictType, number> {
  findByDictType(dictType: string): SystemDictType | null;
}

export class InMemoryDictTypeRepository implements DictTypeRepository {
  findAll(): SystemDictType[] {
    return [...accessDataStore.dictTypes];
  }

  findById(dictId: number): SystemDictType | null {
    return accessDataStore.dictTypes.find((d) => d.dictId === dictId) || null;
  }

  findByDictType(dictType: string): SystemDictType | null {
    return (
      accessDataStore.dictTypes.find((d) => d.dictType === dictType) || null
    );
  }

  create(data: Partial<SystemDictType>): number {
    const nextId =
      accessDataStore.dictTypes.reduce((max, d) => Math.max(max, d.dictId), 0) +
      1;

    const newDictType: SystemDictType = {
      dictId: nextId,
      dictName: data.dictName || "",
      dictType: data.dictType || "",
      status: data.status || "0",
    };

    accessDataStore.dictTypes.push(newDictType);
    return nextId;
  }

  update(dictId: number, data: Partial<SystemDictType>): boolean {
    const dictType = accessDataStore.dictTypes.find((d) => d.dictId === dictId);
    if (!dictType) return false;

    Object.assign(dictType, data);
    return true;
  }

  delete(dictId: number): boolean {
    const index = accessDataStore.dictTypes.findIndex((d) => d.dictId === dictId);
    if (index === -1) return false;

    accessDataStore.dictTypes.splice(index, 1);
    return true;
  }

  deleteBatch(dictIds: number[]): number {
    let count = 0;
    for (const dictId of dictIds) {
      const index = accessDataStore.dictTypes.findIndex((d) => d.dictId === dictId);
      if (index !== -1) {
        accessDataStore.dictTypes.splice(index, 1);
        count++;
      }
    }
    return count;
  }
}

export const dictTypeRepository = new InMemoryDictTypeRepository();
