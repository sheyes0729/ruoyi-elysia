import type { SystemUser } from "../../modules/system/access-data";
import { accessDataStore } from "../../modules/system/access-data";
import type { Repository } from "../base";

export interface UserRepository extends Repository<SystemUser, number> {
  findByUsername(username: string): SystemUser | null;
  findByRoleId(roleId: number): SystemUser[];
}

export class InMemoryUserRepository implements UserRepository {
  findAll(): SystemUser[] {
    return [...accessDataStore.users];
  }

  findById(userId: number): SystemUser | null {
    return accessDataStore.users.find((u) => u.userId === userId) || null;
  }

  findByUsername(username: string): SystemUser | null {
    return accessDataStore.users.find((u) => u.username === username) || null;
  }

  findByRoleId(roleId: number): SystemUser[] {
    return accessDataStore.users.filter((u) => u.roleIds.includes(roleId));
  }

  create(data: Partial<SystemUser>): number {
    const nextId =
      accessDataStore.users.reduce((max, u) => Math.max(max, u.userId), 0) + 1;

    const newUser: SystemUser = {
      userId: nextId,
      username: data.username || "",
      nickName: data.nickName || "",
      password: data.password || "",
      status: data.status || "0",
      roleIds: data.roleIds || [],
    };

    accessDataStore.users.push(newUser);
    return nextId;
  }

  update(userId: number, data: Partial<SystemUser>): boolean {
    const user = accessDataStore.users.find((u) => u.userId === userId);
    if (!user) {return false;}

    Object.assign(user, data);
    return true;
  }

  delete(userId: number): boolean {
    const index = accessDataStore.users.findIndex((u) => u.userId === userId);
    if (index === -1) {return false;}

    accessDataStore.users.splice(index, 1);
    return true;
  }

  deleteBatch(userIds: number[]): number {
    let count = 0;
    for (const userId of userIds) {
      const index = accessDataStore.users.findIndex((u) => u.userId === userId);
      if (index !== -1) {
        accessDataStore.users.splice(index, 1);
        count++;
      }
    }
    return count;
  }
}

export const userRepository = new InMemoryUserRepository();
