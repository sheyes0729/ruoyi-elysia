import type { SystemRole } from "../../modules/system/access-data";
import { accessDataStore } from "../../modules/system/access-data";
import type { Repository } from "../base";

export interface RoleRepository extends Repository<SystemRole, number> {
  findByRoleKey(roleKey: string): SystemRole | null;
}

export class InMemoryRoleRepository implements RoleRepository {
  findAll(): SystemRole[] {
    return [...accessDataStore.roles];
  }

  findById(roleId: number): SystemRole | null {
    return accessDataStore.roles.find((r) => r.roleId === roleId) || null;
  }

  findByRoleKey(roleKey: string): SystemRole | null {
    return accessDataStore.roles.find((r) => r.roleKey === roleKey) || null;
  }

  create(data: Partial<SystemRole>): number {
    const nextId =
      accessDataStore.roles.reduce((max, r) => Math.max(max, r.roleId), 0) + 1;

    const newRole: SystemRole = {
      roleId: nextId,
      roleKey: data.roleKey || "",
      roleName: data.roleName || "",
      status: data.status || "0",
      menuIds: data.menuIds || [],
      permissions: data.permissions || [],
    };

    accessDataStore.roles.push(newRole);
    return nextId;
  }

  update(roleId: number, data: Partial<SystemRole>): boolean {
    const role = accessDataStore.roles.find((r) => r.roleId === roleId);
    if (!role) return false;

    Object.assign(role, data);
    return true;
  }

  delete(roleId: number): boolean {
    const index = accessDataStore.roles.findIndex((r) => r.roleId === roleId);
    if (index === -1) return false;

    accessDataStore.roles.splice(index, 1);
    return true;
  }

  deleteBatch(roleIds: number[]): number {
    let count = 0;
    for (const roleId of roleIds) {
      const index = accessDataStore.roles.findIndex((r) => r.roleId === roleId);
      if (index !== -1) {
        accessDataStore.roles.splice(index, 1);
        count++;
      }
    }
    return count;
  }
}

export const roleRepository = new InMemoryRoleRepository();
