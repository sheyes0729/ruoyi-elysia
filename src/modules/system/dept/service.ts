import { accessDataStore } from "../access-data";
import type { DeptTreeItem, ListDeptQuery } from "./model";

export class DeptService {
  list(query?: ListDeptQuery): DeptTreeItem[] {
    const source = accessDataStore.depts
      .map((item) => ({
        deptId: item.deptId,
        parentId: item.parentId,
        deptName: item.deptName,
        orderNum: item.orderNum,
        status: item.status,
      }))
      .filter((item) => {
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
      })
      .sort((a, b) => a.orderNum - b.orderNum);

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
}

export const deptService = new DeptService();
