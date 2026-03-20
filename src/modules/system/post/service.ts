import type {
  CreatePostBody,
  ListPostQuery,
  PostListItem,
  UpdatePostBody,
} from "./model";
import { postRepository } from "../../../repository";

type CreatePostResult =
  | { success: true; postId: number }
  | { success: false; reason: "post_code_exists" };

type UpdatePostResult =
  | { success: true }
  | { success: false; reason: "post_not_found" | "post_code_exists" };

export class PostService {
  async list(query?: ListPostQuery): Promise<PostListItem[]> {
    const posts = await postRepository.findAll();

    const source = posts.map((item) => ({
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

  async removeBatch(ids: number[]): Promise<number> {
    return postRepository.deleteBatch(ids);
  }

  async create(payload: CreatePostBody): Promise<CreatePostResult> {
    const existed = await postRepository.findByPostCode(payload.postCode);
    if (existed) {
      return { success: false, reason: "post_code_exists" };
    }

    const postId = await postRepository.create({
      postCode: payload.postCode,
      postName: payload.postName,
      postSort: payload.postSort,
      status: payload.status,
    });

    return { success: true, postId };
  }

  async update(payload: UpdatePostBody): Promise<UpdatePostResult> {
    const target = await postRepository.findById(payload.postId);
    if (!target) {
      return { success: false, reason: "post_not_found" };
    }

    const existed = await postRepository.findByPostCode(payload.postCode);
    if (existed && existed.postId !== payload.postId) {
      return { success: false, reason: "post_code_exists" };
    }

    await postRepository.update(payload.postId, {
      postCode: payload.postCode,
      postName: payload.postName,
      postSort: payload.postSort,
      status: payload.status,
    });

    return { success: true };
  }
}

export const postService = new PostService();
