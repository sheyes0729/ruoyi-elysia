import { accessDataStore } from "../access-data";
import type { RoleListItem } from "./model";

export class RoleService {
    list(): RoleListItem[] {
        return accessDataStore.roles.map((item) => ({
            roleId: item.roleId,
            roleKey: item.roleKey,
            roleName: item.roleName,
            status: item.status,
        }));
    }
}

export const roleService = new RoleService();
