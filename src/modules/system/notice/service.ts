import { accessDataStore } from "../access-data";
import type { ListNoticeQuery, NoticeListItem } from "./model";

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
}

export const noticeService = new NoticeService();
