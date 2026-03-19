import { removeBatchByNumericId } from "../../../common/data/array";
import { accessDataStore } from "../access-data";
import type { ListRoleQuery, RoleListItem } from "./model";

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
}

export const roleService = new RoleService();
