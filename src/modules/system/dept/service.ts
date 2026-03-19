import { removeBatchByNumericId } from "../../../common/data/array";
import { accessDataStore } from "../access-data";
import type { DeptTreeItem, ListDeptQuery } from "./model";

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
}

export const deptService = new DeptService();
