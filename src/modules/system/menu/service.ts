import { removeBatchByNumericId } from "../../../common/data/array";
import { accessDataStore } from "../access-data";
import type { ListMenuQuery, MenuListItem } from "./model";

export class MenuService {
    list(query?: ListMenuQuery): MenuListItem[] {
        const source = accessDataStore.menus.map((item) => ({
            menuId: item.menuId,
            menuName: item.menuName,
            parentId: item.parentId,
            orderNum: item.orderNum,
            path: item.path,
            component: item.component,
            menuType: item.menuType,
            perms: item.perms,
            visible: item.visible,
            status: item.status,
        }));

        if (!query) {
            return source;
        }

        return source.filter((item) => {
            if (query.menuName && !item.menuName.includes(query.menuName)) {
                return false;
            }

            if (query.status && item.status !== query.status) {
                return false;
            }

            return true;
        });
    }

    removeBatch(ids: number[]): number {
        return removeBatchByNumericId(accessDataStore.menus, ids, (item) => item.menuId);
    }
}

export const menuService = new MenuService();
