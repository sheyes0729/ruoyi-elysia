import type { SystemRole } from "../modules/system/types";
import { deptRepository } from "./index";

export type DataScopeResult = {
  allData: boolean;
  deptIds: number[];
};

export async function getDataScopeByRoles(
  roles: SystemRole[],
): Promise<DataScopeResult> {
  if (roles.length === 0) {
    return { allData: false, deptIds: [] };
  }

  const hasAllDataRole = roles.some((role) => role.dataScope === "1");
  if (hasAllDataRole) {
    return { allData: true, deptIds: [] };
  }

  const allDepts = await deptRepository.findAll();
  const allDeptIds = allDepts.map((d) => d.deptId);

  const accessibleDeptIdSets: number[][] = [];

  for (const role of roles) {
    const roleDeptIds = getAccessibleDeptsForRole(role, allDeptIds, allDepts);
    accessibleDeptIdSets.push(roleDeptIds);
  }

  const intersection = intersectSets(accessibleDeptIdSets);

  return { allData: false, deptIds: intersection };
}

function getAccessibleDeptsForRole(
  role: SystemRole,
  allDeptIds: number[],
  allDepts: { deptId: number; parentId: number }[],
): number[] {
  switch (role.dataScope) {
    case "1":
      return allDeptIds;
    case "2":
      return role.deptIds;
    case "3":
      return role.deptIds.length > 0 ? role.deptIds : [];
    case "4": {
      const result: number[] = [];
      for (const deptId of role.deptIds) {
        result.push(deptId);
        result.push(...getChildDeptIds(deptId, allDepts));
      }
      return result;
    }
    case "5":
      return [];
    default:
      return allDeptIds;
  }
}

function getChildDeptIds(
  parentId: number,
  allDepts: { deptId: number; parentId: number }[],
): number[] {
  const children: number[] = [];
  for (const dept of allDepts) {
    if (dept.parentId === parentId) {
      children.push(dept.deptId);
      children.push(...getChildDeptIds(dept.deptId, allDepts));
    }
  }
  return children;
}

function intersectSets(sets: number[][]): number[] {
  if (sets.length === 0) {
    return [];
  }

  const firstSet = new Set(sets[0]);
  for (let i = 1; i < sets.length; i++) {
    const currentSet = new Set(sets[i]);
    const intersection: number[] = [];
    for (const item of firstSet) {
      if (currentSet.has(item)) {
        intersection.push(item);
      }
    }
    firstSet.clear();
    intersection.forEach((item) => firstSet.add(item));
  }

  return Array.from(firstSet);
}

export async function filterUsersByDataScope(
  userIds: number[],
  userDeptMap: Map<number, number>,
  roles: SystemRole[],
): Promise<number[]> {
  const dataScope = await getDataScopeByRoles(roles);

  if (dataScope.allData) {
    return userIds;
  }

  if (dataScope.deptIds.length === 0) {
    return [];
  }

  return userIds.filter((userId) => {
    const deptId = userDeptMap.get(userId);
    return deptId !== undefined && dataScope.deptIds.includes(deptId);
  });
}
