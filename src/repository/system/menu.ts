import type { SystemMenu } from "../../modules/system/access-data";
import { accessDataStore } from "../../modules/system/access-data";
import type { Repository } from "../base";

export interface MenuRepository extends Repository<SystemMenu, number> {
  findByParentId(parentId: number): SystemMenu[];
}

export class InMemoryMenuRepository implements MenuRepository {
  findAll(): SystemMenu[] {
    return [...accessDataStore.menus];
  }

  findById(menuId: number): SystemMenu | null {
    return accessDataStore.menus.find((m) => m.menuId === menuId) || null;
  }

  findByParentId(parentId: number): SystemMenu[] {
    return accessDataStore.menus.filter((m) => m.parentId === parentId);
  }

  create(data: Partial<SystemMenu>): number {
    const nextId =
      accessDataStore.menus.reduce((max, m) => Math.max(max, m.menuId), 0) + 1;

    const newMenu: SystemMenu = {
      menuId: nextId,
      menuName: data.menuName || "",
      parentId: data.parentId ?? 0,
      orderNum: data.orderNum || 0,
      path: data.path || "",
      component: data.component || "",
      menuType: data.menuType || "M",
      perms: data.perms || "",
      visible: data.visible || "0",
      status: data.status || "0",
    };

    accessDataStore.menus.push(newMenu);
    return nextId;
  }

  update(menuId: number, data: Partial<SystemMenu>): boolean {
    const menu = accessDataStore.menus.find((m) => m.menuId === menuId);
    if (!menu) {return false;}

    Object.assign(menu, data);
    return true;
  }

  delete(menuId: number): boolean {
    const index = accessDataStore.menus.findIndex((m) => m.menuId === menuId);
    if (index === -1) {return false;}

    accessDataStore.menus.splice(index, 1);
    return true;
  }

  deleteBatch(menuIds: number[]): number {
    let count = 0;
    for (const menuId of menuIds) {
      const index = accessDataStore.menus.findIndex((m) => m.menuId === menuId);
      if (index !== -1) {
        accessDataStore.menus.splice(index, 1);
        count++;
      }
    }
    return count;
  }
}

export const menuRepository = new InMemoryMenuRepository();
