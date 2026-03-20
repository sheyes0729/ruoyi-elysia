import { removeBatchByNumericId } from "../../../common/data/array";
import { accessDataStore } from "../access-data";
import type {
  CreatePostBody,
  ListPostQuery,
  PostListItem,
  UpdatePostBody,
} from "./model";

type CreatePostResult =
  | { success: true; postId: number }
  | { success: false; reason: "post_code_exists" };

type UpdatePostResult =
  | { success: true }
  | { success: false; reason: "post_not_found" | "post_code_exists" };

export class PostService {
  list(query?: ListPostQuery): PostListItem[] {
    const source = accessDataStore.posts.map((item) => ({
      postId: item.postId,
      postCode: item.postCode,
      postName: item.postName,
      postSort: item.postSort,
      status: item.status,
    }));

    if (!query) {
      return source;
    }

    return source.filter((item) => {
      if (query.postCode && !item.postCode.includes(query.postCode)) {
        return false;
      }

      if (query.postName && !item.postName.includes(query.postName)) {
        return false;
      }

      if (query.status && item.status !== query.status) {
        return false;
      }

      return true;
    });
  }

  removeBatch(ids: number[]): number {
    return removeBatchByNumericId(accessDataStore.posts, ids, (item) => item.postId);
  }

  create(payload: CreatePostBody): CreatePostResult {
    const existed = accessDataStore.posts.some(
      (item) => item.postCode === payload.postCode
    );
    if (existed) {
      return { success: false, reason: "post_code_exists" };
    }

    const nextId =
      accessDataStore.posts.reduce(
        (maxPostId, item) => Math.max(maxPostId, item.postId),
        0
      ) + 1;

    accessDataStore.posts.push({
      postId: nextId,
      postCode: payload.postCode,
      postName: payload.postName,
      postSort: payload.postSort,
      status: payload.status,
    });

    return { success: true, postId: nextId };
  }

  update(payload: UpdatePostBody): UpdatePostResult {
    const target = accessDataStore.posts.find((item) => item.postId === payload.postId);
    if (!target) {
      return { success: false, reason: "post_not_found" };
    }

    const existed = accessDataStore.posts.some(
      (item) => item.postCode === payload.postCode && item.postId !== payload.postId
    );
    if (existed) {
      return { success: false, reason: "post_code_exists" };
    }

    target.postCode = payload.postCode;
    target.postName = payload.postName;
    target.postSort = payload.postSort;
    target.status = payload.status;

    return { success: true };
  }
}

export const postService = new PostService();
