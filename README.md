# RuoYi Elysia Backend

基于 Elysia + Bun 重构若依后端能力，目标是提供高性能、易扩展、模块化的后台服务框架。

## 当前状态

- 已完成：基础服务与平台能力（CORS、Swagger、统一响应、全局异常）
- 已完成：认证授权主链路（登录/登出/getInfo、JWT、权限守卫）
- 已完成：系统与监控核心列表能力（用户/角色/菜单/部门/岗位/字典/参数/公告、在线用户、登录日志、操作日志）
- 已完成：分页、导出、批量删除/清空等通用能力
- 已完成：`secured` 统一鉴权包装（登录校验、权限校验、可配置操作日志）
- 已完成：操作日志结构升级（`businessType` 贯通查询/导出）与模块级 `oper-log.ts` 元数据治理
- 已完成：系统管理模块 CRUD 完整化（含用户/角色/菜单/部门/岗位/字典/参数/公告新增与编辑，用户重置密码，角色/菜单授权，CSV 导入导出）
- 已完成：P2 数据库持久化（MySQL + Drizzle ORM，13 张表，异步 Repository 模式）

## 里程碑记录

### 2026-03-19（P0 主链路打通）

- 完成应用骨架与平台插件集成（CORS、Swagger、全局异常、统一响应）
- 完成认证授权主链路（登录/登出/getInfo、JWT、权限守卫）
- 完成用户/角色基础列表接口并接入权限校验

### 2026-03-19（P1 系统管理与监控能力）

- 完成系统管理列表能力：菜单、部门（树）、岗位、字典类型、字典数据、参数配置、通知公告
- 完成监控能力：在线用户、登录日志、操作日志（含筛选分页）
- 完成通用能力：分页、CSV 导出、批量删除、日志清空
- 完成工程保障：TypeCheck 与 Lint 基线通过

### 2026-03-20（P1.5 鉴权与审计治理 + 系统管理 CRUD 完整化）

- 完成路由鉴权统一抽象：`secured(meta, handler)`，替代散落的登录/权限重复校验
- 完成操作日志去重机制：`secured` 与应用级 after-handle 日志协同，避免重复记录
- 完成操作日志 `businessType` 端到端升级（记录、筛选、响应、CSV 导出）
- 完成模块级日志元数据拆分：各模块独立 `oper-log.ts` 并加 `OperBusinessType` 类型约束
- 完成系统管理 CRUD 完整化：用户/角色/菜单/部门/岗位/字典/参数/公告新增与编辑
- 完成关键管理动作：用户重置密码、角色菜单授权
- 完成导入能力：用户导入、字典数据导入（含模板下载）

### 2026-03-20（P2 数据库持久化）

- 完成 Repository 接口改造为 async 方法
- 完成 DrizzleRepository 基类实现（9 个模块：用户、角色、菜单、部门、岗位、字典类型、字典数据、参数配置、通知公告）
- 完成 Service 层改造为使用 async repository（全部 9 个系统管理模块）
- 完成 Routes 层 async/await 改造（全部 9 个系统管理模块）
- 完成数据库 schema 设计与迁移脚本
- 完成 MySQL 数据库连接与迁移（13 张表）
- 完成种子数据初始化（用户、角色、菜单、部门、岗位、字典、配置、公告）

## 下个里程碑目标

### P2（数据库与生产化）

- [x] Drizzle 配置与数据库 schema 设计（用户、角色、菜单、部门、岗位、字典类型、字典数据、参数配置、通知公告、操作日志、登录日志）
- [x] Repository 层基础架构（base repository 接口 + Drizzle 实现）
- [x] Drizzle 迁移脚本生成（12 张表）
- [x] 数据库种子数据脚本
- [x] 将 service 层改造为使用 repository，实现数据库持久化（用户、角色、菜单、部门、岗位、字典类型、字典数据、参数配置、通知公告）
- [x] 接入真实 MySQL 数据库，完成数据迁移
- [ ] 建立测试体系（鉴权、权限、系统管理关键路径）

### P3（部署与生产化）

- [ ] 引入限流、审计追踪、告警能力
- [ ] Docker 部署与生产配置模板
- [ ] CI/CD 流水线

## 功能清单

### 1. 基础能力

- [x] 配置管理（环境变量、配置校验）
- [ ] 日志体系（请求日志、业务日志、错误日志、审计日志）
- [x] 统一响应结构（`code / msg / data`）
- [x] 全局异常处理与错误码规范
- [x] 参数校验与请求 DTO 规范
- [ ] 中间件体系（鉴权、限流、幂等、请求追踪）
- [x] OpenAPI/Swagger 接口文档

### 2. 认证与授权（若依 RBAC 核心）

- [ ] 登录/登出（账号密码、图形验证码）
- [ ] JWT/Session 机制与刷新策略
- [x] 用户信息获取（`getInfo`）
- [x] 菜单权限与按钮权限（`perms`）
- [ ] 角色管理（角色分配、角色状态、数据范围）
- [x] 权限注解/权限守卫
- [x] 在线用户管理与强制下线

### 3. 系统管理模块

- [x] 用户管理（新增/编辑/重置密码/导入/导出）
- [x] 部门管理（树结构、级联校验）
- [x] 岗位管理
- [x] 菜单管理（目录/菜单/按钮）
- [x] 角色管理（菜单授权、数据权限）
- [x] 字典管理（字典类型、字典数据，含导入/导出）
- [x] 参数配置
- [x] 通知公告

### 4. 审计与运维

- [x] 操作日志（记录接口操作行为）
- [x] 操作日志业务类型（`businessType`）及筛选导出
- [x] 登录日志（登录成功/失败追踪）
- [x] 在线用户监控
- [x] 服务健康检查（health/readiness）
- [ ] 限流与防刷（IP/用户维度）
- [ ] 任务调度（可选：Cron）

### 5. 工程化与质量保障

- [x] 分层架构（router/service/repository/domain）- Repository 接口与 Drizzle ORM 实现已完成
- [x] 数据库迁移与种子数据能力 - Drizzle 迁移脚本已生成，种子数据脚本已完成
- [x] Service 层数据库持久化 - 全部 9 个系统管理模块已改造为 async repository 模式
- [x] MySQL 数据库连接 - 13 张表已创建，种子数据已初始化
- [ ] 单元测试与集成测试
- [x] Lint、Type Check、格式化规范
- [ ] CI/CD 流水线
- [ ] Docker 部署与生产配置模板

## 推荐包清单（按功能映射）

以下是结合 Elysia + Bun 的可落地包建议，可按阶段逐步引入。

### 1. 基础能力

- 配置管理：`dotenv`、`zod`
- 日志体系：`pino`、`pino-pretty`
- 统一异常处理：`http-errors`
- 参数校验：`elysia`（内置 schema 能力）、`zod`
- 请求追踪：`@elysiajs/opentelemetry`（可选）
- OpenAPI 文档：`@elysiajs/swagger`
- CORS/安全头：`@elysiajs/cors`、`@elysiajs/helmet`

### 2. 认证与授权（RBAC）

- JWT：`@elysiajs/jwt`
- Bearer Token：`@elysiajs/bearer`
- 密码加密：`bcryptjs`
- 验证码：`svg-captcha`
- 缓存与会话：`ioredis`
- 权限模型：`casbin`（可选，复杂权限场景）

### 3. 系统管理模块

- 数据库 ORM：`drizzle-orm` + `drizzle-kit`（推荐）或 `prisma` + `@prisma/client`
- MySQL 驱动：`mysql2`
- 分页与查询构建：`drizzle-orm` 查询能力或 `kysely`（可选）
- 导入导出：`xlsx`、`csv-parse`、`csv-stringify`
- 日期处理：`dayjs`

### 4. 审计与运维

- 限流防刷：`@elysiajs/rate-limit`
- 任务调度：`@elysiajs/cron` 或 `node-cron`
- 健康检查：`@elysiajs/server-timing`（可选）+ 自定义 `/health`、`/readiness`
- 审计日志持久化：`pino` + 数据库存储/消息队列

### 5. 工程化与质量保障

- 测试：`bun test`（内置）+ `supertest`（接口测试）
- Mock：`@faker-js/faker`
- 代码规范：`eslint`、`@typescript-eslint/parser`、`@typescript-eslint/eslint-plugin`、`prettier`
- Git Hooks：`husky`、`lint-staged`
- 环境校验：`zod`
- 容器化：`docker`、`docker-compose`

### 6. 分阶段安装清单（P0 / P1 / P2）

#### P0（先打通登录 + RBAC 主链路）

```bash
bun add @elysiajs/jwt @elysiajs/bearer @elysiajs/swagger @elysiajs/cors @elysiajs/helmet
bun add dotenv zod pino bcryptjs ioredis drizzle-orm mysql2 dayjs
bun add -d drizzle-kit eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

#### P1（补齐系统管理与运维能力）

```bash
bun add @elysiajs/rate-limit @elysiajs/cron xlsx csv-parse csv-stringify svg-captcha
```

#### P2（工程化与测试完善）

```bash
bun add -d supertest @faker-js/faker husky lint-staged
```

### 7. package.json 分层依赖建议

按阶段维护依赖可以减少初期复杂度，避免一次性引入过多包。

```json
{
  "dependencies": {
    "elysia": "latest",
    "@elysiajs/jwt": "^1",
    "@elysiajs/bearer": "^1",
    "@elysiajs/swagger": "^1",
    "@elysiajs/cors": "^1",
    "@elysiajs/helmet": "^1",
    "dotenv": "^16",
    "zod": "^3",
    "pino": "^9",
    "bcryptjs": "^2",
    "ioredis": "^5",
    "drizzle-orm": "^0",
    "mysql2": "^3",
    "dayjs": "^1"
  },
  "devDependencies": {
    "bun-types": "latest",
    "drizzle-kit": "^0",
    "eslint": "^9",
    "prettier": "^3",
    "@typescript-eslint/parser": "^8",
    "@typescript-eslint/eslint-plugin": "^8"
  }
}
```

### 8. 最小可运行技术选型（建议先落地）

- Web 框架：`elysia`
- 鉴权方案：`@elysiajs/jwt` + `@elysiajs/bearer`
- 数据层：`drizzle-orm` + `mysql2`
- 配置校验：`dotenv` + `zod`
- 日志方案：`pino`
- 文档能力：`@elysiajs/swagger`
- 安全能力：`@elysiajs/cors` + `@elysiajs/helmet`

最小可运行阶段建议只安装 P0 包，确保先完成「登录 -> 权限校验 -> 用户/角色基础接口 -> Swagger 联调」闭环，再推进 P1/P2。

## 待办事项（建议优先级）

### P0（先打通主流程）

- [x] 设计目录结构与模块边界
- [x] 完成登录、鉴权中间件、权限校验最小闭环
- [x] 完成用户管理与角色管理基础接口
- [x] 统一错误处理、统一响应结构、参数校验
- [x] 完成 Repository 层架构与 Drizzle ORM 实现
- [ ] 接入数据库与 ORM，建立用户/角色/菜单/部门核心表

### P1（补齐若依系统管理能力）

- [x] 完成菜单、部门、岗位、字典、参数配置模块
- [x] 完成操作日志与登录日志
- [x] 完成在线用户管理与会话控制
- [x] 增加分页、导出、批量操作等通用能力

### P2（工程化与生产化）

- [x] 完成 Service 层数据库持久化改造（async repository 模式）
- [x] 接入真实 MySQL 数据库，完成数据迁移
- [ ] 增加测试体系（核心鉴权、权限、系统管理模块）
- [ ] 完成接口文档与变更规范
- [ ] 增加限流、审计追踪、告警能力
- [ ] 完成容器化部署与 CI/CD 自动化发布

## 本地开发

```bash
bun install
bun run dev
```

默认启动地址：`http://localhost:3000`
