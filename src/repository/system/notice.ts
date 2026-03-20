import type { SystemNotice } from "../../modules/system/access-data";
import { accessDataStore } from "../../modules/system/access-data";
import type { Repository } from "../base";

export class InMemoryNoticeRepository implements Repository<SystemNotice, number> {
  findAll(): SystemNotice[] {
    return [...accessDataStore.notices];
  }

  findById(noticeId: number): SystemNotice | null {
    return (
      accessDataStore.notices.find((n) => n.noticeId === noticeId) || null
    );
  }

  create(data: Partial<SystemNotice>): number {
    const nextId =
      accessDataStore.notices.reduce((max, n) => Math.max(max, n.noticeId), 0) +
      1;

    const newNotice: SystemNotice = {
      noticeId: nextId,
      noticeTitle: data.noticeTitle || "",
      noticeType: data.noticeType || "1",
      status: data.status || "0",
      createTime: new Date().toISOString(),
    };

    accessDataStore.notices.push(newNotice);
    return nextId;
  }

  update(noticeId: number, data: Partial<SystemNotice>): boolean {
    const notice = accessDataStore.notices.find((n) => n.noticeId === noticeId);
    if (!notice) return false;

    Object.assign(notice, data);
    return true;
  }

  delete(noticeId: number): boolean {
    const index = accessDataStore.notices.findIndex((n) => n.noticeId === noticeId);
    if (index === -1) return false;

    accessDataStore.notices.splice(index, 1);
    return true;
  }

  deleteBatch(noticeIds: number[]): number {
    let count = 0;
    for (const noticeId of noticeIds) {
      const index = accessDataStore.notices.findIndex((n) => n.noticeId === noticeId);
      if (index !== -1) {
        accessDataStore.notices.splice(index, 1);
        count++;
      }
    }
    return count;
  }
}

export const noticeRepository = new InMemoryNoticeRepository();
