import { eq } from "drizzle-orm";
import type { SystemPost } from "../../modules/system/types";
import { sys_post } from "../../database/schema";
import { db } from "../../database";
import type { Repository } from "../base";

export interface PostRepository extends Repository<SystemPost, number> {
  findByPostCode(postCode: string): Promise<SystemPost | null>;
}

export class DrizzlePostRepository implements PostRepository {
  private readonly table = sys_post;

  private toEntity(row: typeof sys_post.$inferSelect): SystemPost {
    return {
      postId: row.postId,
      postCode: row.postCode,
      postName: row.postName,
      postSort: row.postSort,
      status: row.status as "0" | "1",
    };
  }

  private readonly pkColumn = sys_post.postId;

  async findAll(): Promise<SystemPost[]> {
    const result = await db.select().from(sys_post);
    return result.map((row) => this.toEntity(row));
  }

  async findById(postId: number): Promise<SystemPost | null> {
    const result = await db
      .select()
      .from(sys_post)
      .where(eq(sys_post.postId, postId));
    return result.length > 0 ? this.toEntity(result[0]) : null;
  }

  async findByPostCode(postCode: string): Promise<SystemPost | null> {
    const result = await db
      .select()
      .from(sys_post)
      .where(eq(sys_post.postCode, postCode));
    return result.length > 0 ? this.toEntity(result[0]) : null;
  }

  async create(data: Partial<SystemPost>): Promise<number> {
    const result = await db.insert(sys_post).values({
      postCode: data.postCode,
      postName: data.postName,
      postSort: data.postSort,
      status: data.status,
    } as typeof sys_post.$inferInsert);
    return result[0].insertId;
  }

  async update(postId: number, data: Partial<SystemPost>): Promise<boolean> {
    const result = await db
      .update(sys_post)
      .set(data as typeof sys_post.$inferInsert)
      .where(eq(sys_post.postId, postId));
    return (result as unknown as { affectedRows: number }).affectedRows > 0;
  }

  async delete(postId: number): Promise<boolean> {
    const result = await db.delete(sys_post).where(eq(sys_post.postId, postId));
    return (result as unknown as { affectedRows: number }).affectedRows > 0;
  }

  async deleteBatch(postIds: number[]): Promise<number> {
    const result = await db
      .delete(sys_post)
      .where(eq(sys_post.postId, postIds[0]));
    return (result as unknown as { affectedRows: number }).affectedRows;
  }
}

export const postRepository = new DrizzlePostRepository();
