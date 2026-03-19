import { removeBatchByNumericId } from "../../../common/data/array";
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
    return removeBatchByNumericId(accessDataStore.posts, ids, (item) => item.postId);
  }
}

export const postService = new PostService();
