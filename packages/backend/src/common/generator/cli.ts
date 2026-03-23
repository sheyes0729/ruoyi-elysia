import {
  analyzeTable,
  generateModelCode,
  generateRepositoryCode,
  generateServiceCode,
  generateRoutesCode,
} from "./codegen";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const sampleColumns = [
  {
    name: "id",
    type: "int",
    tsType: "number",
    nullable: false,
    isPrimaryKey: true,
    isAutoIncrement: true,
  },
  {
    name: "name",
    type: "varchar",
    tsType: "string",
    nullable: false,
    isPrimaryKey: false,
    isAutoIncrement: false,
  },
  {
    name: "status",
    type: "char",
    tsType: "string",
    nullable: false,
    isPrimaryKey: false,
    isAutoIncrement: false,
  },
  {
    name: "remark",
    type: "varchar",
    tsType: "string",
    nullable: true,
    isPrimaryKey: false,
    isAutoIncrement: false,
  },
  {
    name: "createTime",
    type: "timestamp",
    tsType: "string",
    nullable: true,
    isPrimaryKey: false,
    isAutoIncrement: false,
  },
];

function generateModule(
  moduleName: string,
  tableName: string,
  outputDir: string,
) {
  const table = analyzeTable(tableName, sampleColumns);
  table.entityName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  const files = {
    "model.ts": generateModelCode(table),
    "repository.ts": generateRepositoryCode(table).replace(
      /sys_\w+/g,
      tableName,
    ),
    "service.ts": generateServiceCode(table).replace(/sys_\w+/g, tableName),
    "routes.ts": generateRoutesCode(table).replace(/sys_\w+/g, tableName),
  };

  const moduleDir = join(outputDir, moduleName);
  if (!existsSync(moduleDir)) {
    mkdirSync(moduleDir, { recursive: true });
  }

  for (const [filename, content] of Object.entries(files)) {
    writeFileSync(join(moduleDir, filename), content);
    console.log(`Generated: ${moduleDir}/${filename}`);
  }

  console.log(`\nModule "${moduleName}" generated successfully!`);
  console.log(`Next steps:`);
  console.log(`  1. Move files to src/modules/system/${moduleName}/`);
  console.log(`  2. Add repository to src/repository/index.ts`);
  console.log(`  3. Register routes in src/modules/system/routes.ts`);
}

const moduleName = process.argv[2];
const tableName = process.argv[3] ?? `sys_${moduleName}`;
const outputDir = process.argv[4] ?? "./generated";

if (!moduleName) {
  console.log(
    "Usage: bun run src/common/generator/cli.ts <moduleName> [tableName] [outputDir]",
  );
  console.log("Example: bun run src/common/generator/cli.ts user");
  console.log(
    "         bun run src/common/generator/cli.ts role sys_role ./output",
  );
  process.exit(1);
}

generateModule(moduleName, tableName, outputDir);
