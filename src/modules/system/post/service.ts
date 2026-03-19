import { accessDataStore } from "../access-data";
import type { ListPostQuery, PostListItem } from "./model";

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
    const idSet = new Set(ids);
    const before = accessDataStore.posts.length;
    accessDataStore.posts.splice(
      0,
      accessDataStore.posts.length,
      ...accessDataStore.posts.filter((item) => !idSet.has(item.postId))
    );
    return before - accessDataStore.posts.length;
  }
}

export const postService = new PostService();
