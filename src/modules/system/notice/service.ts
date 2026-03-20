import type {
  CreateNoticeBody,
  ListNoticeQuery,
  NoticeListItem,
  UpdateNoticeBody,
} from "./model";
import { noticeRepository } from "../../../repository";

type CreateNoticeResult = { success: true; noticeId: number };

type UpdateNoticeResult =
  | { success: true }
  | { success: false; reason: "notice_not_found" };

export class NoticeService {
  async list(query?: ListNoticeQuery): Promise<NoticeListItem[]> {
    const notices = await noticeRepository.findAll();

    const source = notices.map((item) => ({
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

  async removeBatch(ids: number[]): Promise<number> {
    return noticeRepository.deleteBatch(ids);
  }

  async create(payload: CreateNoticeBody): Promise<CreateNoticeResult> {
    const noticeId = await noticeRepository.create({
      noticeTitle: payload.noticeTitle,
      noticeType: payload.noticeType,
      status: payload.status,
    });

    return { success: true, noticeId };
  }

  async update(payload: UpdateNoticeBody): Promise<UpdateNoticeResult> {
    const target = await noticeRepository.findById(payload.noticeId);
    if (!target) {
      return { success: false, reason: "notice_not_found" };
    }

    await noticeRepository.update(payload.noticeId, {
      noticeTitle: payload.noticeTitle,
      noticeType: payload.noticeType,
      status: payload.status,
    });

    return { success: true };
  }
}

export const noticeService = new NoticeService();
