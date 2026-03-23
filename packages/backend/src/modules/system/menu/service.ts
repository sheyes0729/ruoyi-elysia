import type {
  CreateMenuBody,
  ListMenuQuery,
  MenuListItem,
  UpdateMenuBody,
} from "./model";
import { menuRepository } from "../../../repository";

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
  async list(query?: ListMenuQuery): Promise<MenuListItem[]> {
    const menus = await menuRepository.findAll();

    const source = menus.map((item) => ({
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

  async removeBatch(ids: number[]): Promise<number> {
    return menuRepository.deleteBatch(ids);
  }

  async create(payload: CreateMenuBody): Promise<CreateMenuResult> {
    if (payload.parentId !== 0 && !(await this.menuExists(payload.parentId))) {
      return { success: false, reason: "parent_not_found" };
    }

    const menuId = await menuRepository.create({
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

    return { success: true, menuId };
  }

  async update(payload: UpdateMenuBody): Promise<UpdateMenuResult> {
    const target = await menuRepository.findById(payload.menuId);
    if (!target) {
      return { success: false, reason: "menu_not_found" };
    }

    if (payload.parentId !== 0 && !(await this.menuExists(payload.parentId))) {
      return { success: false, reason: "parent_not_found" };
    }

    if (
      payload.parentId === payload.menuId ||
      (await this.isDescendant(payload.parentId, payload.menuId))
    ) {
      return { success: false, reason: "invalid_parent" };
    }

    await menuRepository.update(payload.menuId, {
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

    return { success: true };
  }

  private async menuExists(menuId: number): Promise<boolean> {
    const menu = await menuRepository.findById(menuId);
    return menu !== null;
  }

  private async isDescendant(
    parentId: number,
    menuId: number,
  ): Promise<boolean> {
    if (parentId === 0) {
      return false;
    }

    let currentId = parentId;
    while (currentId !== 0) {
      if (currentId === menuId) {
        return true;
      }

      const currentMenu = await menuRepository.findById(currentId);
      if (!currentMenu) {
        break;
      }

      currentId = currentMenu.parentId;
    }

    return false;
  }
}

export const menuService = new MenuService();
