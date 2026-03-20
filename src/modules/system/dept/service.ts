import { removeBatchByNumericId } from "../../../common/data/array";
import { accessDataStore } from "../access-data";
import type {
  CreateDeptBody,
  DeptTreeItem,
  ListDeptQuery,
  UpdateDeptBody,
} from "./model";

type CreateDeptResult =
  | { success: true; deptId: number }
  | { success: false; reason: "parent_not_found" };

type UpdateDeptResult =
  | { success: true }
  | {
      success: false;
      reason: "dept_not_found" | "parent_not_found" | "invalid_parent";
    };

type DeptListItem = {
  deptId: number;
  parentId: number;
  deptName: string;
  orderNum: number;
  status: "0" | "1";
};

const filterByQuery = (source: DeptListItem[], query?: ListDeptQuery) =>
  source.filter((item) => {
    if (!query) {
      return true;
    }

    if (query.deptName && !item.deptName.includes(query.deptName)) {
      return false;
    }

    if (query.status && item.status !== query.status) {
      return false;
    }

    return true;
  });

export class DeptService {
  listFlat(query?: ListDeptQuery): DeptListItem[] {
    const source = accessDataStore.depts.map((item) => ({
      deptId: item.deptId,
      parentId: item.parentId,
      deptName: item.deptName,
      orderNum: item.orderNum,
      status: item.status,
    }));
    return filterByQuery(source, query).sort((a, b) => a.orderNum - b.orderNum);
  }

  list(query?: ListDeptQuery): DeptTreeItem[] {
    const source = this.listFlat(query);

    const map = new Map<number, DeptTreeItem>(
      source.map((item) => [item.deptId, { ...item, children: [] }])
    );

    const roots: DeptTreeItem[] = [];
    source.forEach((item) => {
      const current = map.get(item.deptId);
      if (!current) {
        return;
      }

      const parent = map.get(item.parentId);
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(current);
        return;
      }

      roots.push(current);
    });

    return roots;
  }

  removeBatch(ids: number[]): number {
    const idSet = new Set(ids);
    let changed = true;

    while (changed) {
      changed = false;
      accessDataStore.depts.forEach((item) => {
        if (idSet.has(item.parentId) && !idSet.has(item.deptId)) {
          idSet.add(item.deptId);
          changed = true;
        }
      });
    }

    return removeBatchByNumericId(accessDataStore.depts, [...idSet], (item) => item.deptId);
  }

  create(payload: CreateDeptBody): CreateDeptResult {
    if (payload.parentId !== 0 && !this.deptExists(payload.parentId)) {
      return { success: false, reason: "parent_not_found" };
    }

    const nextId =
      accessDataStore.depts.reduce(
        (maxDeptId, item) => Math.max(maxDeptId, item.deptId),
        0
      ) + 1;

    accessDataStore.depts.push({
      deptId: nextId,
      parentId: payload.parentId,
      deptName: payload.deptName,
      orderNum: payload.orderNum,
      status: payload.status,
    });

    return { success: true, deptId: nextId };
  }

  update(payload: UpdateDeptBody): UpdateDeptResult {
    const target = accessDataStore.depts.find((item) => item.deptId === payload.deptId);
    if (!target) {
      return { success: false, reason: "dept_not_found" };
    }

    if (payload.parentId !== 0 && !this.deptExists(payload.parentId)) {
      return { success: false, reason: "parent_not_found" };
    }

    if (payload.parentId === payload.deptId || this.isDescendant(payload.parentId, payload.deptId)) {
      return { success: false, reason: "invalid_parent" };
    }

    target.parentId = payload.parentId;
    target.deptName = payload.deptName;
    target.orderNum = payload.orderNum;
    target.status = payload.status;

    return { success: true };
  }

  private deptExists(deptId: number): boolean {
    return accessDataStore.depts.some((item) => item.deptId === deptId);
  }

  private isDescendant(parentId: number, deptId: number): boolean {
    if (parentId === 0) {
      return false;
    }

    let currentId = parentId;
    while (currentId !== 0) {
      if (currentId === deptId) {
        return true;
      }

      const currentDept = accessDataStore.depts.find((item) => item.deptId === currentId);
      if (!currentDept) {
        break;
      }

      currentId = currentDept.parentId;
    }

    return false;
  }
}

export const deptService = new DeptService();
