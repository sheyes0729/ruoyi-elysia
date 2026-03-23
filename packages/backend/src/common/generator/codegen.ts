export interface GeneratorColumn {
  name: string;
  type: string;
  tsType: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isAutoIncrement: boolean;
  comment?: string;
}

export interface GeneratorTable {
  tableName: string;
  entityName: string;
  columns: GeneratorColumn[];
  hasTimestamp: boolean;
  hasStatus: boolean;
}

const _typeMapping: Record<string, string> = {
  int: "number",
  tinyint: "number",
  smallint: "number",
  bigint: "number",
  float: "number",
  double: "number",
  decimal: "number",
  varchar: "string",
  char: "string",
  text: "string",
  longtext: "string",
  datetime: "string",
  timestamp: "string",
  date: "string",
  time: "string",
  boolean: "boolean",
  "tinyint(1)": "boolean",
  json: "object",
};

export function analyzeTable(
  tableName: string,
  columns: GeneratorColumn[],
): GeneratorTable {
  const entityName = tableName
    .replace(/^sys_/, "")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");

  return {
    tableName,
    entityName,
    columns,
    hasTimestamp: columns.some(
      (c) => c.name === "createTime" || c.name === "updateTime",
    ),
    hasStatus: columns.some((c) => c.name === "status"),
  };
}

export function generateModelCode(table: GeneratorTable): string {
  const fields = table.columns
    .map((col) => {
      const optional = col.nullable ? "?" : "";
      const defaultValue = col.isAutoIncrement
        ? ""
        : col.nullable
          ? " | undefined"
          : "";
      return `  ${col.name}: ${col.tsType}${optional}${defaultValue};`;
    })
    .join("\n");

  return `export interface ${table.entityName} {\n${fields}\n}`;
}

export function generateRepositoryCode(table: GeneratorTable): string {
  const imports = table.columns.some((c) => c.tsType === "number")
    ? 'import { eq, desc } from "drizzle-orm";'
    : 'import { eq, desc } from "drizzle-orm";';

  const pkColumn = table.columns.find((c) => c.isPrimaryKey);
  const pkName = pkColumn?.name ?? "id";

  return `${imports}
import { ${table.tableName} } from "../../database/schema";
import { db } from "../../database";

export interface ${table.entityName}Record {
${table.columns.map((c) => `  ${c.name}: ${c.tsType}${c.nullable ? " | null" : ""};`).join("\n")}
}

export class ${table.entityName}Repository {
  async findAll(limit = 100, offset = 0): Promise<${table.entityName}Record[]> {
    const result = await db
      .select()
      .from(${table.tableName})
      .orderBy(desc(${table.tableName}.${pkName}))
      .limit(limit)
      .offset(offset);
    return result as ${table.entityName}Record[];
  }

  async findById(${pkName}: number): Promise<${table.entityName}Record | null> {
    const result = await db
      .select()
      .from(${table.tableName})
      .where(eq(${table.tableName}.${pkName}, ${pkName}));
    return result.length > 0 ? (result[0] as ${table.entityName}Record) : null;
  }

  async create(data: Omit<${table.entityName}Record, "${pkName}">): Promise<number> {
    const result = await db.insert(${table.tableName}).values(data as any);
    return result[0].insertId;
  }

  async update(${pkName}: number, data: Partial<${table.entityName}Record>): Promise<boolean> {
    const result = await db
      .update(${table.tableName})
      .set(data as any)
      .where(eq(${table.tableName}.${pkName}, ${pkName}));
    return result.length > 0;
  }

  async delete(${pkName}: number): Promise<boolean> {
    const result = await db
      .delete(${table.tableName})
      .where(eq(${table.tableName}.${pkName}, ${pkName}));
    return result.length > 0;
  }
}

export const ${table.entityName.toLowerCase()}Repository = new ${table.entityName}Repository();
`;
}

export function generateServiceCode(table: GeneratorTable): string {
  const pkColumn = table.columns.find((c) => c.isPrimaryKey);
  const pkName = pkColumn?.name ?? "id";

  return `import { ${table.entityName.toLowerCase()}Repository } from "../../../repository/${table.entityName.toLowerCase()}";
import type { ${table.entityName}Record } from "../../../repository/${table.entityName.toLowerCase()}";

export class ${table.entityName}Service {
  private repository = ${table.entityName.toLowerCase()}Repository;

  async list(pageNum = 1, pageSize = 10): Promise<{ rows: ${table.entityName}Record[]; total: number }> {
    const offset = (pageNum - 1) * pageSize;
    const rows = await this.repository.findAll(pageSize, offset);
    return { rows, total: rows.length };
  }

  async getById(${pkName}: number): Promise<${table.entityName}Record | null> {
    return this.repository.findById(${pkName});
  }

  async create(data: Omit<${table.entityName}Record, "${pkName}">): Promise<{ success: true; id: number } | { success: false; reason: string }> {
    try {
      const id = await this.repository.create(data);
      return { success: true, id };
    } catch {
      return { success: false, reason: "创建失败" };
    }
  }

  async update(${pkName}: number, data: Partial<${table.entityName}Record>): Promise<{ success: true } | { success: false; reason: string }> {
    try {
      await this.repository.update(${pkName}, data);
      return { success: true };
    } catch {
      return { success: false, reason: "更新失败" };
    }
  }

  async delete(${pkName}: number): Promise<{ success: true } | { success: false; reason: string }> {
    try {
      await this.repository.delete(${pkName});
      return { success: true };
    } catch {
      return { success: false, reason: "删除失败" };
    }
  }
}

export const ${table.entityName.toLowerCase()}Service = new ${table.entityName}Service();
`;
}

export function generateRoutesCode(table: GeneratorTable): string {
  const pkColumn = table.columns.find((c) => c.isPrimaryKey);
  const pkName = pkColumn?.name ?? "id";
  const _pkType = pkColumn?.tsType ?? "number";

  return `import { Elysia, t } from "elysia";
import { secured } from "../../../common/auth/secured";
import { paginateData } from "../../../common/http/page";
import { fail, ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import { ${table.entityName.toLowerCase()}Service } from "./service";

const ListQuerySchema = t.Object({
  pageNum: t.Optional(t.Numeric({ minimum: 1 })),
  pageSize: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
});

const CreateBodySchema = t.Object({
${table.columns
  .filter((c) => !c.isPrimaryKey && !c.name.includes("Time"))
  .map((c) => `  ${c.name}: t.String(),`)
  .join("\n")}
});

const UpdateBodySchema = t.Object({
  ${pkName}: t.Number(),
${table.columns
  .filter((c) => !c.isPrimaryKey && !c.name.includes("Time"))
  .map((c) => `  ${c.name}: t.String(),`)
  .join("\n")}
});

export const ${table.entityName}Routes = new Elysia({
  prefix: "/api/${table.entityName.toLowerCase()}",
  name: "system.${table.entityName.toLowerCase()}.routes",
})
  .use(securityPlugin)
  .get(
    "/list",
    secured({ permission: "system:${table.entityName.toLowerCase()}:list" }, async ({ query }) => {
      const { pageNum = 1, pageSize = 10 } = query as any;
      const result = await ${table.entityName.toLowerCase()}Service.list(pageNum, pageSize);
      return ok(paginateData(result.rows, { pageNum, pageSize }, result.total));
    }),
    { detail: { tags: ["系统管理-${table.entityName}"], summary: "查询列表" } }
  )
  .get(
    "/:${pkName}",
    secured({ permission: "system:${table.entityName.toLowerCase()}:query" }, async ({ params, set }) => {
      const id = parseInt((params as any).${pkName}, 10);
      const record = await ${table.entityName.toLowerCase()}Service.getById(id);
      if (!record) {
        set.status = 404;
        return fail(404, "记录不存在");
      }
      return ok(record);
    }),
    { params: t.Object({ ${pkName}: t.String() }), detail: { tags: ["系统管理-${table.entityName}"], summary: "获取详情" } }
  )
  .post(
    "/add",
    secured({ permission: "system:${table.entityName.toLowerCase()}:add" }, async ({ body, set }) => {
      const result = await ${table.entityName.toLowerCase()}Service.create(body as any);
      if (!result.success) {
        set.status = 400;
        return fail(400, result.reason);
      }
      return ok({ ${pkName}: result.id }, "新增成功");
    }),
    { body: CreateBodySchema, detail: { tags: ["系统管理-${table.entityName}"], summary: "新增" } }
  )
  .put(
    "/edit",
    secured({ permission: "system:${table.entityName.toLowerCase()}:edit" }, async ({ body, set }) => {
      const result = await ${table.entityName.toLowerCase()}Service.update((body as any).${pkName}, body as any);
      if (!result.success) {
        set.status = 400;
        return fail(400, result.reason);
      }
      return ok(true, "修改成功");
    }),
    { body: UpdateBodySchema, detail: { tags: ["系统管理-${table.entityName}"], summary: "修改" } }
  )
  .delete(
    "/:${pkName}",
    secured({ permission: "system:${table.entityName.toLowerCase()}:remove" }, async ({ params, set }) => {
      const id = parseInt((params as any).${pkName}, 10);
      const result = await ${table.entityName.toLowerCase()}Service.delete(id);
      if (!result.success) {
        set.status = 400;
        return fail(400, result.reason);
      }
      return ok(true, "删除成功");
    }),
    { params: t.Object({ ${pkName}: t.String() }), detail: { tags: ["系统管理-${table.entityName}"], summary: "删除" } }
  );
`;
}
