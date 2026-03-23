# RuoYi Elysia Backend

基于 Elysia + Bun 的若依后端重构，目标是提供高性能、易扩展、模块化的后台服务框架。

## 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 运行时 | Bun | 高性能 JavaScript 运行时 |
| 框架 | Elysia | Ergonomic Framework for Humans |
| 数据库 | MySQL + Drizzle ORM | 异步 Repository 模式 |
| 缓存 | Redis + ioredis | 会话、验证码、限流缓存 |
| 认证 | JWT + Refresh Token | 双 Token 机制 |
| 文档 | Swagger | OpenAPI 文档 |
| 限流 | elysia-rate-limit | API 限流防护 |

## 快速开始

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev
```

默认启动地址：`http://localhost:4000`

## 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | `4000` | 服务端口 |
| `DB_HOST` | `localhost` | MySQL 主机 |
| `DB_PORT` | `3306` | MySQL 端口 |
| `DB_USER` | `root` | MySQL 用户名 |
| `DB_PASSWORD` | `ruoyi123` | MySQL 密码 |
| `DB_NAME` | `ruoyi` | MySQL 数据库名 |
| `REDIS_HOST` | `localhost` | Redis 主机 |
| `REDIS_PORT` | `6379` | Redis 端口 |
| `JWT_SECRET` | - | JWT 密钥（必填） |

## 目录结构

```
src/
├── plugins/              # 插件
│   ├── cache.ts          # Redis 缓存
│   ├── rate-limit.ts     # 限流
│   └── ...
├── modules/              # 功能模块
│   ├── auth/             # 认证授权
│   ├── system/           # 系统管理
│   │   ├── user/         # 用户管理
│   │   ├── role/         # 角色管理
│   │   ├── menu/         # 菜单管理
│   │   ├── dept/         # 部门管理
│   │   └── ...
│   └── monitor/          # 监控管理
├── repository/           # 数据访问层
├── common/               # 公共模块
│   ├── auth/             # 鉴权封装
│   └── http/             # 响应封装
└── app.ts               # 应用入口
```

## 核心功能

### 认证授权

- [x] 登录/登出（账号密码 + 图形验证码）
- [x] JWT Access Token（1天）+ Refresh Token（7天）
- [x] 菜单权限 + 按钮权限（perms）
- [x] 数据范围（部门数据权限）
- [x] 在线用户管理与强制下线

### 系统管理

- [x] 用户管理（CRUD + 导入/导出/重置密码）
- [x] 角色管理（CRUD + 菜单授权）
- [x] 菜单管理（目录/菜单/按钮）
- [x] 部门管理（树结构）
- [x] 岗位、字典、参数配置、通知公告

### 审计运维

- [x] 操作日志（businessType + 分页/导出）
- [x] 登录日志（成功/失败追踪）
- [x] API 限流（IP 维度）
- [x] 幂等性处理（X-Idempotency-Key）
- [x] Prometheus 监控指标

## API 文档

启动服务后访问：`http://localhost:4000/swagger`

## Docker 部署

```bash
# 使用 docker-compose（推荐）
docker-compose up -d

# 单独构建
docker build -t ruoyi-elysia .
docker run -d -p 4000:4000 ruoyi-elysia
```

## 待办事项

- [ ] 单元测试与集成测试完善
- [ ] 更多监控指标
- [ ] WebSocket 支持
