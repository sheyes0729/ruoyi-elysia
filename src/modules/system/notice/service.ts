import { removeBatchByNumericId } from "../../../common/data/array";
import { accessDataStore } from "../access-data";
import type {
  CreateNoticeBody,
  ListNoticeQuery,
  NoticeListItem,
  UpdateNoticeBody,
} from "./model";

type CreateNoticeResult = { success: true; noticeId: number };

type UpdateNoticeResult =
  | { success: true }
  | { success: false; reason: "notice_not_found" };

export class NoticeService {
  list(query?: ListNoticeQuery): NoticeListItem[] {
    const source = accessDataStore.notices.map((item) => ({
      noticeId: item.noticeId,
      noticeTitle: item.noticeTitle,
      noticeType: item.noticeType,
      status: item.status,
      createTime: item.createTime,
    }));

    if (!query) {
      return source;
    }

    return source.filter((item) => {
      if (query.noticeTitle && !item.noticeTitle.includes(query.noticeTitle)) {
        return false;
      }

      if (query.noticeType && item.noticeType !== query.noticeType) {
        return false;
      }

      if (query.status && item.status !== query.status) {
        return false;
      }

      return true;
    });
  }

  removeBatch(ids: number[]): number {
    return removeBatchByNumericId(accessDataStore.notices, ids, (item) => item.noticeId);
  }

  create(payload: CreateNoticeBody): CreateNoticeResult {
    const nextId =
      accessDataStore.notices.reduce(
        (maxNoticeId, item) => Math.max(maxNoticeId, item.noticeId),
        0
      ) + 1;

    accessDataStore.notices.push({
      noticeId: nextId,
      noticeTitle: payload.noticeTitle,
      noticeType: payload.noticeType,
      status: payload.status,
      createTime: new Date().toISOString(),
    });

    return { success: true, noticeId: nextId };
  }

  update(payload: UpdateNoticeBody): UpdateNoticeResult {
    const target = accessDataStore.notices.find(
      (item) => item.noticeId === payload.noticeId
    );
    if (!target) {
      return { success: false, reason: "notice_not_found" };
    }

    target.noticeTitle = payload.noticeTitle;
    target.noticeType = payload.noticeType;
    target.status = payload.status;

    return { success: true };
  }
}

export const noticeService = new NoticeService();
