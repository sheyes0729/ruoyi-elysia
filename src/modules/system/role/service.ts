import type {
  AuthRoleMenuBody,
  CreateRoleBody,
  ListRoleQuery,
  RoleListItem,
  UpdateRoleBody,
} from "./model";
import { roleRepository, menuRepository } from "../../../repository";

type CreateRoleResult =
  | { success: true; roleId: number }
  | { success: false; reason: "role_key_exists" | "menu_not_found" };

type UpdateRoleResult =
  | { success: true }
  | { success: false; reason: "role_not_found" | "menu_not_found" };

type AuthRoleMenuResult =
  | { success: true }
  | { success: false; reason: "role_not_found" | "menu_not_found" };

const toUniqueIds = (ids: number[]): number[] => [...new Set(ids)];

export class RoleService {
  async list(query?: ListRoleQuery): Promise<RoleListItem[]> {
    const roles = await roleRepository.findAll();

    const source = roles.map((item) => ({
      roleId: item.roleId,
      roleKey: item.roleKey,
      roleName: item.roleName,
      status: item.status,
      dataScope: item.dataScope,
      deptCheckStrictly: item.deptCheckStrictly,
      deptIds: item.deptIds,
    }));

    if (!query) {
      return source;
    }

    return source.filter((item) => {
      if (query.roleName && !item.roleName.includes(query.roleName)) {
        return false;
      }

      if (query.roleKey && !item.roleKey.includes(query.roleKey)) {
        return false;
      }

      if (query.status && item.status !== query.status) {
        return false;
      }

      return true;
    });
  }

  async removeBatch(ids: number[]): Promise<number> {
    return roleRepository.deleteBatch(ids);
  }

  async create(payload: CreateRoleBody): Promise<CreateRoleResult> {
    const existed = await roleRepository.findByRoleKey(payload.roleKey);
    if (existed) {
      return { success: false, reason: "role_key_exists" };
    }

    const menuIds = toUniqueIds(payload.menuIds ?? []);
    if (!(await this.checkMenusExist(menuIds))) {
      return { success: false, reason: "menu_not_found" };
    }

    const roleId = await roleRepository.create({
      roleKey: payload.roleKey,
      roleName: payload.roleName,
      status: payload.status,
      menuIds,
      permissions: await this.resolvePermissionsByMenuIds(menuIds),
      dataScope: payload.dataScope ?? "1",
      deptCheckStrictly: payload.deptCheckStrictly ?? "0",
      deptIds: payload.deptIds ?? [],
    });

    return { success: true, roleId };
  }

  async update(payload: UpdateRoleBody): Promise<UpdateRoleResult> {
    const target = await roleRepository.findById(payload.roleId);
    if (!target) {
      return { success: false, reason: "role_not_found" };
    }

    const menuIds = toUniqueIds(payload.menuIds ?? target.menuIds);
    if (!(await this.checkMenusExist(menuIds))) {
      return { success: false, reason: "menu_not_found" };
    }

    await roleRepository.update(payload.roleId, {
      roleName: payload.roleName,
      status: payload.status,
      menuIds,
      permissions: await this.resolvePermissionsByMenuIds(menuIds),
      dataScope: payload.dataScope,
      deptCheckStrictly: payload.deptCheckStrictly,
      deptIds: payload.deptIds,
    });

    return { success: true };
  }

  async authMenu(payload: AuthRoleMenuBody): Promise<AuthRoleMenuResult> {
    const target = await roleRepository.findById(payload.roleId);
    if (!target) {
      return { success: false, reason: "role_not_found" };
    }

    const menuIds = toUniqueIds(payload.menuIds);
    if (!(await this.checkMenusExist(menuIds))) {
      return { success: false, reason: "menu_not_found" };
    }

    await roleRepository.update(payload.roleId, {
      menuIds,
      permissions: await this.resolvePermissionsByMenuIds(menuIds),
    });

    return { success: true };
  }

  private async checkMenusExist(menuIds: number[]): Promise<boolean> {
    const menus = await menuRepository.findAll();
    return menuIds.every((menuId) =>
      menus.some((menu) => menu.menuId === menuId),
    );
  }

  private async resolvePermissionsByMenuIds(
    menuIds: number[],
  ): Promise<string[]> {
    const menus = await menuRepository.findAll();
    const permissions = menus
      .filter((menu) => menuIds.includes(menu.menuId))
      .map((menu) => menu.perms)
      .filter((permission) => permission.trim().length > 0);

    return [...new Set(permissions)];
  }
}

export const roleService = new RoleService();
