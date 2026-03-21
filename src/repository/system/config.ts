import { eq } from "drizzle-orm";
import type { SystemConfig } from "../../modules/system/access-data";
import { sys_config } from "../../database/schema";
import { db } from "../../database";
import type { Repository } from "../base";

export interface ConfigRepository extends Repository<SystemConfig, number> {
  findByConfigKey(configKey: string): Promise<SystemConfig | null>;
}

export class DrizzleConfigRepository implements ConfigRepository {
  private readonly table = sys_config;

  private toEntity(row: typeof sys_config.$inferSelect): SystemConfig {
    return {
      configId: row.configId,
      configName: row.configName,
      configKey: row.configKey,
      configValue: row.configValue,
      configType: row.configType as "Y" | "N",
    };
  }

  private readonly pkColumn = sys_config.configId;

  async findAll(): Promise<SystemConfig[]> {
    const result = await db.select().from(sys_config);
    return result.map((row) => this.toEntity(row));
  }

  async findById(configId: number): Promise<SystemConfig | null> {
    const result = await db
      .select()
      .from(sys_config)
      .where(eq(sys_config.configId, configId));
    return result.length > 0 ? this.toEntity(result[0]) : null;
  }

  async findByConfigKey(configKey: string): Promise<SystemConfig | null> {
    const result = await db
      .select()
      .from(sys_config)
      .where(eq(sys_config.configKey, configKey));
    return result.length > 0 ? this.toEntity(result[0]) : null;
  }

  async create(data: Partial<SystemConfig>): Promise<number> {
    const result = await db.insert(sys_config).values({
      configName: data.configName,
      configKey: data.configKey,
      configValue: data.configValue,
      configType: data.configType,
    } as typeof sys_config.$inferInsert);
    return result[0].insertId;
  }

  async update(
    configId: number,
    data: Partial<SystemConfig>,
  ): Promise<boolean> {
    const result = await db
      .update(sys_config)
      .set(data as typeof sys_config.$inferInsert)
      .where(eq(sys_config.configId, configId));
    return !!result.length;
  }

  async delete(configId: number): Promise<boolean> {
    const result = await db
      .delete(sys_config)
      .where(eq(sys_config.configId, configId));
    return !!result.length;
  }

  async deleteBatch(configIds: number[]): Promise<number> {
    const result = await db
      .delete(sys_config)
      .where(eq(sys_config.configId, configIds[0]));
    return result.length;
  }
}

export const configRepository = new DrizzleConfigRepository();
