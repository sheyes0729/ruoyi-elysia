import { Elysia, t } from "elysia";
import { secured } from "../../../common/auth/secured";
import { ok } from "../../../common/http/response";
import { securityPlugin } from "../../../plugins/security";
import {
  generateModelCode,
  generateRepositoryCode,
  generateServiceCode,
  generateRoutesCode,
  analyzeTable,
  type GeneratorColumn,
} from "../../../common/generator/codegen";

const GenerateCodeSchema = t.Object({
  tableName: t.String(),
  moduleName: t.String(),
  columns: t.Array(
    t.Object({
      name: t.String(),
      type: t.String(),
      tsType: t.String(),
      nullable: t.Boolean(),
      isPrimaryKey: t.Boolean(),
      isAutoIncrement: t.Boolean(),
    }),
  ),
});

export const generatorRoutes = new Elysia({
  prefix: "/api/tool/gen",
  name: "tool.generator.routes",
})
  .use(securityPlugin)
  .post(
    "/preview",
    secured({ permission: "tool:gen:code" }, async ({ body }) => {
      const typedBody = body as {
        tableName: string;
        moduleName: string;
        columns: GeneratorColumn[];
      };

      const table = analyzeTable(typedBody.tableName, typedBody.columns);

      const modelCode = generateModelCode(table);
      const repositoryCode = generateRepositoryCode(table);
      const serviceCode = generateServiceCode(table);
      const routesCode = generateRoutesCode(table);

      return ok({
        model: modelCode,
        repository: repositoryCode,
        service: serviceCode,
        routes: routesCode,
      });
    }),
    {
      body: GenerateCodeSchema,
      detail: {
        tags: ["系统工具-代码生成"],
        summary: "预览生成代码",
        description:
          "根据表结构预览生成的代码，包含 Model、Repository、Service、Routes",
      },
    },
  )
  .get(
    "/columnType/:dbType",
    async ({ params }) => {
      const dbType = (params as { dbType: string }).dbType.toLowerCase();
      const typeMap: Record<string, string> = {
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
        json: "object",
      };

      const tsType = typeMap[dbType] ?? "string";
      return ok({ dbType, tsType });
    },
    {
      params: t.Object({ dbType: t.String() }),
      detail: {
        tags: ["系统工具-代码生成"],
        summary: "获取列类型映射",
        description: "根据数据库类型获取对应的 TypeScript 类型",
      },
    },
  );
