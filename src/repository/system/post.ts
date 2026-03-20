import type { SystemPost } from "../../modules/system/access-data";
import { accessDataStore } from "../../modules/system/access-data";
import type { Repository } from "../base";

export interface PostRepository extends Repository<SystemPost, number> {
  findByPostCode(postCode: string): SystemPost | null;
}

export class InMemoryPostRepository implements PostRepository {
  findAll(): SystemPost[] {
    return [...accessDataStore.posts];
  }

  findById(postId: number): SystemPost | null {
    return accessDataStore.posts.find((p) => p.postId === postId) || null;
  }

  findByPostCode(postCode: string): SystemPost | null {
    return accessDataStore.posts.find((p) => p.postCode === postCode) || null;
  }

  create(data: Partial<SystemPost>): number {
    const nextId =
      accessDataStore.posts.reduce((max, p) => Math.max(max, p.postId), 0) + 1;

    const newPost: SystemPost = {
      postId: nextId,
      postCode: data.postCode || "",
      postName: data.postName || "",
      postSort: data.postSort || 0,
      status: data.status || "0",
    };

    accessDataStore.posts.push(newPost);
    return nextId;
  }

  update(postId: number, data: Partial<SystemPost>): boolean {
    const post = accessDataStore.posts.find((p) => p.postId === postId);
    if (!post) {return false;}

    Object.assign(post, data);
    return true;
  }

  delete(postId: number): boolean {
    const index = accessDataStore.posts.findIndex((p) => p.postId === postId);
    if (index === -1) {return false;}

    accessDataStore.posts.splice(index, 1);
    return true;
  }

  deleteBatch(postIds: number[]): number {
    let count = 0;
    for (const postId of postIds) {
      const index = accessDataStore.posts.findIndex((p) => p.postId === postId);
      if (index !== -1) {
        accessDataStore.posts.splice(index, 1);
        count++;
      }
    }
    return count;
  }
}

export const postRepository = new InMemoryPostRepository();
