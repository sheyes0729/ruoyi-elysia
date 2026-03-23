import type {
  CreateDictTypeBody,
  DictTypeListItem,
  ListDictTypeQuery,
  UpdateDictTypeBody,
} from "./model";
import { dictTypeRepository, dictDataRepository } from "../../../repository";

type CreateDictTypeResult =
  | { success: true; dictId: number }
  | { success: false; reason: "dict_type_exists" };

type UpdateDictTypeResult =
  | { success: true }
  | { success: false; reason: "dict_type_not_found" | "dict_type_exists" };

export class DictTypeService {
  async list(query?: ListDictTypeQuery): Promise<DictTypeListItem[]> {
    const dictTypes = await dictTypeRepository.findAll();

    const source = dictTypes.map((item) => ({
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

  async removeBatch(ids: number[]): Promise<number> {
    return dictTypeRepository.deleteBatch(ids);
  }

  async create(payload: CreateDictTypeBody): Promise<CreateDictTypeResult> {
    const existed = await dictTypeRepository.findByDictType(payload.dictType);
    if (existed) {
      return { success: false, reason: "dict_type_exists" };
    }

    const dictId = await dictTypeRepository.create({
      dictName: payload.dictName,
      dictType: payload.dictType,
      status: payload.status,
    });

    return { success: true, dictId };
  }

  async update(payload: UpdateDictTypeBody): Promise<UpdateDictTypeResult> {
    const target = await dictTypeRepository.findById(payload.dictId);
    if (!target) {
      return { success: false, reason: "dict_type_not_found" };
    }

    const previousDictType = target.dictType;

    const existed = await dictTypeRepository.findByDictType(payload.dictType);
    if (existed && existed.dictId !== payload.dictId) {
      return { success: false, reason: "dict_type_exists" };
    }

    await dictTypeRepository.update(payload.dictId, {
      dictName: payload.dictName,
      dictType: payload.dictType,
      status: payload.status,
    });

    const dictDataItems =
      await dictDataRepository.findByDictType(previousDictType);
    for (const item of dictDataItems) {
      await dictDataRepository.update(item.dictCode, {
        dictType: payload.dictType,
      });
    }

    return { success: true };
  }
}

export const dictTypeService = new DictTypeService();
