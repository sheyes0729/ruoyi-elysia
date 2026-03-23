# RuoYi Elysia

若依前后端分离管理系统 Monorepo，基于 Vue3 + Elysia/Bun 技术栈。

## 子项目

| 项目 | 路径 | 技术栈 |
|------|------|--------|
| [Backend](./packages/backend/) | 后端服务 | Elysia + Bun + Drizzle ORM |
| [Frontend](./packages/frontend/) | 前端页面 | Vue 3 + Vite + naive-ui |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动后端
pnpm dev:backend

# 启动前端
pnpm dev:frontend
```

## 技术栈

### 后端

- **框架**: Elysia + Bun
- **数据库**: MySQL + Drizzle ORM
- **缓存**: Redis + ioredis
- **认证**: JWT + Refresh Token
- **文档**: Swagger

### 前端

- **框架**: Vue 3 + TypeScript
- **构建**: Vite 8
- **UI**: naive-ui + unocss
- **路由**: vue-router 5 + 文件路由
- **状态**: Pinia
- **请求**: @elysiajs/eden（E2E 类型安全）

## 主要功能

- 用户/角色/菜单/部门管理
- RBAC 权限控制
- 操作日志与审计
- 在线用户监控
- API 限流与缓存
- Docker 部署支持

## 部署

```bash
# Docker Compose 部署
docker-compose up -d
```

详细文档请查看各子项目 README。
