# RuoYi Elysia

若依前后端分离管理系统 Monorepo

## 子项目

- [packages/backend](./packages/backend/) - 后端服务（Elysia + Bun）
- [packages/frontend](./packages/frontend/) - 前端页面（Vue 3 + Vite）

## 开发指南

```bash
# 安装依赖
pnpm install

# 启动后端开发服务器
pnpm dev:backend

# 启动前端开发服务器
pnpm dev:frontend

# 构建前端
pnpm build:frontend
```

## 当前状态（Backend）

- 已完成：基础服务与平台能力（CORS、Swagger、统一响应、全局异常）
- 已完成：认证授权主链路（登录/登出/getInfo、JWT、Refresh Token、图形验证码、bcrypt 密码加密）
- 已完成：系统与监控核心列表能力（用户/角色/菜单/部门/岗位/字典/参数/公告、在线用户、登录日志、操作日志）
- 已完成：分页、导出、批量删除/清空等通用能力
- 已完成：`secured` 统一鉴权包装（登录校验、权限校验、可配置操作日志）
- 已完成：操作日志结构升级（`businessType` 贯通查询/导出）与模块级 `oper-log.ts` 元数据治理
- 已完成：系统管理模块 CRUD 完整化（含用户/角色/菜单/部门/岗位/字典/参数/公告新增与编辑，用户重置密码，角色/菜单授权，CSV 导入导出）
- 已完成：P2 数据库持久化（MySQL + Drizzle ORM，13 张表，异步 Repository 模式）
- 已完成：API 限流（elysia-rate-limit + request-ip）
- 已完成：Redis 缓存（在线用户会话、登录日志、图形验证码、幂等性）
- 已完成：Docker 部署支持（Dockerfile, docker-compose.yml）
- 已完成：数据范围（部门数据权限）过滤
- 已完成：幂等性处理（X-Idempotency-Key）
- 已完成：Swagger API 文档完善

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
- 更新 auth service 使用数据库 repository
- 完成 bun test 测试体系（认证、用户、角色、菜单 API 测试，10 个测试用例全部通过）
- 完成 API 限流能力（elysia-rate-limit，默认 100 请求/分钟）

### 2026-03-21（P2.5 认证授权细节完善）

- 完成图形验证码功能（`GET /api/auth/captcha`，svg-captcha + Redis 存储，5分钟过期）
- 完成密码加密验证（bcryptjs，种子数据已更新为 bcrypt 哈希）
- 完成 JWT Refresh Token 机制（Access Token 1天 + Refresh Token 7天）
- 完成多角色支持修复（`buildAuthUser` 返回用户所有角色并合并权限）

## 下个里程碑目标

### P2（数据库与生产化）

- [x] Drizzle 配置与数据库 schema 设计（用户、角色、菜单、部门、岗位、字典类型、字典数据、参数配置、通知公告、操作日志、登录日志）
- [x] Repository 层基础架构（base repository 接口 + Drizzle 实现）
- [x] Drizzle 迁移脚本生成（12 张表）
- [x] 数据库种子数据脚本
- [x] 将 service 层改造为使用 repository，实现数据库持久化（用户、角色、菜单、部门、岗位、字典类型、字典数据、参数配置、通知公告）
- [x] 接入真实 MySQL 数据库，完成数据迁移
- [x] 建立测试体系（鉴权、权限、系统管理关键路径）
- [x] 引入限流能力（elysia-rate-limit）

### P3（部署与生产化）

- [x] Docker 部署与生产配置模板（Dockerfile, docker-compose.yml, .env.docker）
- [x] CI/CD 流水线（GitHub Actions: lint, typecheck, test, build, deploy）

## 功能清单

### 1. 基础能力

- [x] 配置管理（环境变量、配置校验）
- [x] 日志体系（pino + pino-pretty，请求日志、错误日志）
- [x] 统一响应结构（`code / msg / data`）
- [x] 全局异常处理与错误码规范
- [x] 参数校验与请求 DTO 规范
- [x] 中间件体系（限流、请求日志）- 鉴权、幂等、请求追踪待完善
- [x] OpenAPI/Swagger 接口文档

### 2. 认证与授权（若依 RBAC 核心）

- [x] 登录/登出（账号密码、图形验证码）
- [x] JWT/Session 机制与刷新策略（Access Token 1天 + Refresh Token 7天）
- [x] 用户信息获取（`getInfo`）
- [x] 菜单权限与按钮权限（`perms`）
- [x] 角色管理（角色分配、角色状态、数据范围）
- [x] 数据范围（部门数据权限，过滤用户/部门列表）
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
- [x] 限流与防刷（IP维度，elysia-rate-limit）
- [x] 幂等性处理（X-Idempotency-Key，Redis 存储 24h）
- [x] 任务调度（定时清理过期会话、清理旧日志）

### 5. 工程化与质量保障

- [x] 分层架构（router/service/repository/domain）- Repository 接口与 Drizzle ORM 实现已完成
- [x] 数据库迁移与种子数据能力 - Drizzle 迁移脚本已生成，种子数据脚本已完成
- [x] Service 层数据库持久化 - 全部 9 个系统管理模块已改造为 async repository 模式
- [x] MySQL 数据库连接 - 13 张表已创建，种子数据已初始化
- [x] 测试体系 - bun test 测试框架，10 个测试用例覆盖认证、用户、角色、菜单 API
- [ ] 单元测试与集成测试（待完善）
- [x] Lint、Type Check、格式化规范
- [x] CI/CD 流水线
- [x] Docker 部署与生产配置模板
- [x] Swagger API 文档完善

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
- [x] 接入数据库与 ORM，建立用户/角色/菜单/部门核心表

### P1（补齐若依系统管理能力）

- [x] 完成菜单、部门、岗位、字典、参数配置模块
- [x] 完成操作日志与登录日志
- [x] 完成在线用户管理与会话控制
- [x] 增加分页、导出、批量操作等通用能力

### P2（工程化与生产化）

- [x] 完成 Service 层数据库持久化改造（async repository 模式）
- [x] 接入真实 MySQL 数据库，完成数据迁移
- [x] 建立测试体系（核心鉴权、权限、系统管理模块）
- [x] 增加限流能力（elysia-rate-limit + request-ip）
- [x] 完成 Redis 缓存集成（在线用户会话、登录日志）
- [x] 完成容器化部署（Dockerfile, docker-compose.yml）
- [x] 完成接口文档与变更规范
- [x] CI/CD 流水线

### P3（认证授权细节与完善）

- [x] 图形验证码（svg-captcha + Redis 存储）
- [x] 密码加密（bcryptjs）
- [x] JWT Refresh Token 机制
- [x] 多角色权限合并
- [x] 数据范围（部门数据权限）
- [x] 幂等性处理

## 本地开发

```bash
bun install
bun run dev
```

默认启动地址：`http://localhost:4000`

## 环境变量配置

| 变量名                | 默认值        | 说明                   |
| --------------------- | ------------- | ---------------------- |
| `PORT`                | `4000`        | 服务端口               |
| `NODE_ENV`            | `development` | 运行环境               |
| `DB_HOST`             | `localhost`   | MySQL 主机             |
| `DB_PORT`             | `3306`        | MySQL 端口             |
| `DB_USER`             | `root`        | MySQL 用户名           |
| `DB_PASSWORD`         | `ruoyi123`    | MySQL 密码             |
| `DB_NAME`             | `ruoyi`       | MySQL 数据库名         |
| `REDIS_HOST`          | `localhost`   | Redis 主机             |
| `REDIS_PORT`          | `6379`        | Redis 端口             |
| `REDIS_PASSWORD`      | -             | Redis 密码             |
| `JWT_SECRET`          | -             | JWT 密钥（必填）       |
| `RATE_LIMIT_DURATION` | `60000`       | 限流时间窗口（毫秒）   |
| `RATE_LIMIT_MAX`      | `100`         | 通用限流最大请求数     |
| `RATE_LIMIT_AUTH_MAX` | `10`          | 认证接口限流最大请求数 |
| `SCHEDULER_ENABLED`   | `true`        | 是否启用定时任务调度   |
| `LOG_DIR`             | `./logs`      | 日志文件目录           |
| `LOG_LEVEL`           | `info`        | 日志级别               |

## Docker 部署

### 使用 docker-compose（推荐）

```bash
# 启动所有服务（应用 + MySQL + Redis）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看应用日志
docker-compose logs -f app

# 查看所有服务日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重新构建并启动
docker-compose up -d --build
```

### 单独使用 Docker

```bash
# 构建镜像
docker build -t ruoyi-elysia .

# 运行容器（需要先启动 MySQL 和 Redis）
docker run -d \
  --name ruoyi-elysia \
  -p 4000:4000 \
  -e NODE_ENV=production \
  -e DB_HOST=mysql-host \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASSWORD=ruoyi123 \
  -e DB_NAME=ruoyi \
  -e REDIS_HOST=redis-host \
  -e REDIS_PORT=6379 \
  -e JWT_SECRET=your-secret-key \
  ruoyi-elysia
```

### 环境变量文件

创建 `.env` 文件配置环境变量：

```env
NODE_ENV=production
PORT=4000
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ruoyi123
DB_NAME=ruoyi
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-production-secret-key-change-this
RATE_LIMIT_DURATION=60000
RATE_LIMIT_MAX=100
RATE_LIMIT_AUTH_MAX=10
```

### 生产环境建议

1. **使用 Docker Secrets** 管理敏感信息
2. **配置 MySQL 和 Redis 持久化存储**
3. **使用 Nginx 反向代理并配置 HTTPS**
4. **设置合理的限流参数**
5. **定期备份数据库**

## 监控指标

应用暴露 Prometheus 格式的监控指标：

### 端点

- `GET /metrics` - Prometheus 指标端点
- `GET /metrics/health` - 健康检查端点

### 指标列表

| 指标名称                        | 类型      | 说明                                  |
| ------------------------------- | --------- | ------------------------------------- |
| `http_requests_total`           | Counter   | HTTP 请求总数（method, path, status） |
| `http_request_duration_seconds` | Histogram | HTTP 请求延迟（method, path, status） |
| `http_active_connections`       | Gauge     | 活跃连接数                            |
| `redis_connected`               | Gauge     | Redis 连接状态（1=连接，0=断开）      |
| `db_pool_connections`           | Gauge     | 数据库连接池连接数                    |

### Grafana 配置

```yaml
# prometheus.yml
scrape_configs:
  - job_name: "ruoyi-elysia"
    static_configs:
      - targets: ["your-host:4000"]
```

## 日志持久化

生产环境日志自动输出到文件：

- `./logs/app.log` - 应用日志
- `./logs/access.log` - 访问日志

可通过 `LOG_DIR` 环境变量配置日志目录。

## API 文档

启动服务后访问 Swagger UI：`http://localhost:4000/swagger`

### 幂等性请求

对于 POST/PUT/DELETE/PATCH 请求，可以使用 `X-Idempotency-Key` 头防止重复提交：

```bash
curl -X POST http://localhost:4000/api/system/user/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -H "X-Idempotency-Key: <uuid>" \
  -d '{"username":"test","nickName":"Test","password":"123456","status":"0","roleIds":[1]}'
```

携带相同 `X-Idempotency-Key` 的重复请求将返回缓存结果，有效期 24 小时。

## 健康检查

```bash
curl http://localhost:4000/health
```

返回示例：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "status": "UP",
    "redis": "UP"
  }
}
```
