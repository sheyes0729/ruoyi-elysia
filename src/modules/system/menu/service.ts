import { removeBatchByNumericId } from "../../../common/data/array";
import { accessDataStore } from "../access-data";
import type {
    CreateMenuBody,
    ListMenuQuery,
    MenuListItem,
    UpdateMenuBody,
} from "./model";

type CreateMenuResult =
    | { success: true; menuId: number }
    | { success: false; reason: "parent_not_found" };

type UpdateMenuResult =
    | { success: true }
    | {
          success: false;
          reason: "menu_not_found" | "parent_not_found" | "invalid_parent";
      };

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

    create(payload: CreateMenuBody): CreateMenuResult {
        if (payload.parentId !== 0 && !this.menuExists(payload.parentId)) {
            return { success: false, reason: "parent_not_found" };
        }

        const nextId =
            accessDataStore.menus.reduce(
                (maxMenuId, item) => Math.max(maxMenuId, item.menuId),
                0
            ) + 1;

        accessDataStore.menus.push({
            menuId: nextId,
            menuName: payload.menuName,
            parentId: payload.parentId,
            orderNum: payload.orderNum,
            path: payload.path,
            component: payload.component,
            menuType: payload.menuType,
            perms: payload.perms,
            visible: payload.visible,
            status: payload.status,
        });

        return { success: true, menuId: nextId };
    }

    update(payload: UpdateMenuBody): UpdateMenuResult {
        const target = accessDataStore.menus.find((item) => item.menuId === payload.menuId);
        if (!target) {
            return { success: false, reason: "menu_not_found" };
        }

        if (payload.parentId !== 0 && !this.menuExists(payload.parentId)) {
            return { success: false, reason: "parent_not_found" };
        }

        if (payload.parentId === payload.menuId || this.isDescendant(payload.parentId, payload.menuId)) {
            return { success: false, reason: "invalid_parent" };
        }

        target.menuName = payload.menuName;
        target.parentId = payload.parentId;
        target.orderNum = payload.orderNum;
        target.path = payload.path;
        target.component = payload.component;
        target.menuType = payload.menuType;
        target.perms = payload.perms;
        target.visible = payload.visible;
        target.status = payload.status;

        return { success: true };
    }

    private menuExists(menuId: number): boolean {
        return accessDataStore.menus.some((item) => item.menuId === menuId);
    }

    private isDescendant(parentId: number, menuId: number): boolean {
        if (parentId === 0) {
            return false;
        }

        let currentId = parentId;
        while (currentId !== 0) {
            if (currentId === menuId) {
                return true;
            }

            const currentMenu = accessDataStore.menus.find((item) => item.menuId === currentId);
            if (!currentMenu) {
                break;
            }

            currentId = currentMenu.parentId;
        }

        return false;
    }
}

export const menuService = new MenuService();
