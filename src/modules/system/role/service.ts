import { removeBatchByNumericId } from "../../../common/data/array";
import { accessDataStore } from "../access-data";
import type {
    AuthRoleMenuBody,
    CreateRoleBody,
    ListRoleQuery,
    RoleListItem,
    UpdateRoleBody,
} from "./model";

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
    list(query?: ListRoleQuery): RoleListItem[] {
        const source = accessDataStore.roles.map((item) => ({
            roleId: item.roleId,
            roleKey: item.roleKey,
            roleName: item.roleName,
            status: item.status,
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

    removeBatch(ids: number[]): number {
        return removeBatchByNumericId(accessDataStore.roles, ids, (item) => item.roleId);
    }

    create(payload: CreateRoleBody): CreateRoleResult {
        const existed = accessDataStore.roles.some(
            (item) => item.roleKey === payload.roleKey
        );
        if (existed) {
            return { success: false, reason: "role_key_exists" };
        }

        const menuIds = toUniqueIds(payload.menuIds ?? []);
        if (!this.checkMenusExist(menuIds)) {
            return { success: false, reason: "menu_not_found" };
        }

        const nextId =
            accessDataStore.roles.reduce(
                (maxRoleId, item) => Math.max(maxRoleId, item.roleId),
                0
            ) + 1;

        accessDataStore.roles.push({
            roleId: nextId,
            roleKey: payload.roleKey,
            roleName: payload.roleName,
            status: payload.status,
            menuIds,
            permissions: this.resolvePermissionsByMenuIds(menuIds),
        });

        return { success: true, roleId: nextId };
    }

    update(payload: UpdateRoleBody): UpdateRoleResult {
        const target = accessDataStore.roles.find((item) => item.roleId === payload.roleId);
        if (!target) {
            return { success: false, reason: "role_not_found" };
        }

        const menuIds = toUniqueIds(payload.menuIds ?? target.menuIds ?? []);
        if (!this.checkMenusExist(menuIds)) {
            return { success: false, reason: "menu_not_found" };
        }

        target.roleName = payload.roleName;
        target.status = payload.status;
        target.menuIds = menuIds;
        target.permissions = this.resolvePermissionsByMenuIds(menuIds);

        return { success: true };
    }

    authMenu(payload: AuthRoleMenuBody): AuthRoleMenuResult {
        const target = accessDataStore.roles.find((item) => item.roleId === payload.roleId);
        if (!target) {
            return { success: false, reason: "role_not_found" };
        }

        const menuIds = toUniqueIds(payload.menuIds);
        if (!this.checkMenusExist(menuIds)) {
            return { success: false, reason: "menu_not_found" };
        }

        target.menuIds = menuIds;
        target.permissions = this.resolvePermissionsByMenuIds(menuIds);

        return { success: true };
    }

    private checkMenusExist(menuIds: number[]): boolean {
        return menuIds.every((menuId) =>
            accessDataStore.menus.some((menu) => menu.menuId === menuId)
        );
    }

    private resolvePermissionsByMenuIds(menuIds: number[]): string[] {
        const permissions = accessDataStore.menus
            .filter((menu) => menuIds.includes(menu.menuId))
            .map((menu) => menu.perms)
            .filter((permission) => permission.trim().length > 0);

        return [...new Set(permissions)];
    }
}

export const roleService = new RoleService();
