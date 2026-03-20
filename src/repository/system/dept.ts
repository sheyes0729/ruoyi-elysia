import type { SystemDept } from "../../modules/system/access-data";
import { accessDataStore } from "../../modules/system/access-data";
import type { Repository } from "../base";

export interface DeptRepository extends Repository<SystemDept, number> {
  findByParentId(parentId: number): SystemDept[];
}

export class InMemoryDeptRepository implements DeptRepository {
  findAll(): SystemDept[] {
    return [...accessDataStore.depts];
  }

  findById(deptId: number): SystemDept | null {
    return accessDataStore.depts.find((d) => d.deptId === deptId) || null;
  }

  findByParentId(parentId: number): SystemDept[] {
    return accessDataStore.depts.filter((d) => d.parentId === parentId);
  }

  create(data: Partial<SystemDept>): number {
    const nextId =
      accessDataStore.depts.reduce((max, d) => Math.max(max, d.deptId), 0) + 1;

    const newDept: SystemDept = {
      deptId: nextId,
      deptName: data.deptName || "",
      parentId: data.parentId ?? 0,
      orderNum: data.orderNum || 0,
      status: data.status || "0",
    };

    accessDataStore.depts.push(newDept);
    return nextId;
  }

  update(deptId: number, data: Partial<SystemDept>): boolean {
    const dept = accessDataStore.depts.find((d) => d.deptId === deptId);
    if (!dept) {return false;}

    Object.assign(dept, data);
    return true;
  }

  delete(deptId: number): boolean {
    const index = accessDataStore.depts.findIndex((d) => d.deptId === deptId);
    if (index === -1) {return false;}

    accessDataStore.depts.splice(index, 1);
    return true;
  }

  deleteBatch(deptIds: number[]): number {
    let count = 0;
    for (const deptId of deptIds) {
      const index = accessDataStore.depts.findIndex((d) => d.deptId === deptId);
      if (index !== -1) {
        accessDataStore.depts.splice(index, 1);
        count++;
      }
    }
    return count;
  }
}

export const deptRepository = new InMemoryDeptRepository();
