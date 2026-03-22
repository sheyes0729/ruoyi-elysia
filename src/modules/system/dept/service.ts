import type {
  CreateDeptBody,
  DeptTreeItem,
  ListDeptQuery,
  UpdateDeptBody,
} from "./model";
import { deptRepository } from "../../../repository";
import { getAccessibleDeptIds } from "../../../repository/data-scope";

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
  async listFlat(
    query?: ListDeptQuery,
    currentUserId?: number,
  ): Promise<DeptListItem[]> {
    const depts = await deptRepository.findAll();

    let source = depts.map((item) => ({
      deptId: item.deptId,
      parentId: item.parentId,
      deptName: item.deptName,
      orderNum: item.orderNum,
      status: item.status,
    }));

    if (currentUserId) {
      const accessibleDepts = await getAccessibleDeptIds(currentUserId);
      if (accessibleDepts.length > 0) {
        source = source.filter((item) => accessibleDepts.includes(item.deptId));
      }
    }

    return filterByQuery(source, query).sort((a, b) => a.orderNum - b.orderNum);
  }

  async list(
    query?: ListDeptQuery,
    currentUserId?: number,
  ): Promise<DeptTreeItem[]> {
    const source = await this.listFlat(query, currentUserId);

    const map = new Map<number, DeptTreeItem>(
      source.map((item) => [item.deptId, { ...item, children: [] }]),
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

  async removeBatch(ids: number[]): Promise<number> {
    const allDepts = await deptRepository.findAll();
    const idSet = new Set(ids);
    let changed = true;

    while (changed) {
      changed = false;
      for (const item of allDepts) {
        if (idSet.has(item.parentId) && !idSet.has(item.deptId)) {
          idSet.add(item.deptId);
          changed = true;
        }
      }
    }

    return deptRepository.deleteBatch([...idSet]);
  }

  async create(payload: CreateDeptBody): Promise<CreateDeptResult> {
    if (payload.parentId !== 0 && !(await this.deptExists(payload.parentId))) {
      return { success: false, reason: "parent_not_found" };
    }

    const deptId = await deptRepository.create({
      parentId: payload.parentId,
      deptName: payload.deptName,
      orderNum: payload.orderNum,
      status: payload.status,
    });

    return { success: true, deptId };
  }

  async update(payload: UpdateDeptBody): Promise<UpdateDeptResult> {
    const target = await deptRepository.findById(payload.deptId);
    if (!target) {
      return { success: false, reason: "dept_not_found" };
    }

    if (payload.parentId !== 0 && !(await this.deptExists(payload.parentId))) {
      return { success: false, reason: "parent_not_found" };
    }

    if (
      payload.parentId === payload.deptId ||
      (await this.isDescendant(payload.parentId, payload.deptId))
    ) {
      return { success: false, reason: "invalid_parent" };
    }

    await deptRepository.update(payload.deptId, {
      parentId: payload.parentId,
      deptName: payload.deptName,
      orderNum: payload.orderNum,
      status: payload.status,
    });

    return { success: true };
  }

  private async deptExists(deptId: number): Promise<boolean> {
    const dept = await deptRepository.findById(deptId);
    return dept !== null;
  }

  private async isDescendant(
    parentId: number,
    deptId: number,
  ): Promise<boolean> {
    if (parentId === 0) {
      return false;
    }

    let currentId = parentId;
    while (currentId !== 0) {
      if (currentId === deptId) {
        return true;
      }

      const currentDept = await deptRepository.findById(currentId);
      if (!currentDept) {
        break;
      }

      currentId = currentDept.parentId;
    }

    return false;
  }
}

export const deptService = new DeptService();
