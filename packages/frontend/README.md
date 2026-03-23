# RuoYi Elysia Frontend

基于 Vue3 + TypeScript + Vite 的若依后台管理系统前端，采用 naive-ui + unocss + sass-embedded 技术栈。

## 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 构建工具 | Vite 8 | 下一代前端构建工具 |
| 语言 | TypeScript 5.9 | 类型安全 |
| 框架 | Vue 3.5 | 组合式 API |
| UI 组件库 | naive-ui | 美观易用 |
| 原子化 CSS | unocss | 快速开发 |
| 图标 | iconify | 丰富图标 |
| 样式 | sass-embedded | 现代化 SCSS |
| 路由 | vue-router 5 + vite-plugin-vue-layouts | 文件路由 + 布局自动切换 |
| 状态管理 | pinia | 高性能状态管理 |
| 网络请求 | @elysiajs/eden | 端到端类型安全 API 客户端 |
| 工具库 | vueuse + es-toolkit | Vue 组合式函数 + 工具函数 |
| Excel | xlsx | Excel 导入导出 |
| 校验 | zod | 运行时类型校验 |
| 日期 | dayjs | 日期处理 |
| 图表 | ECharts | 数据可视化图表 |
| 代码规范 | eslint + prettier | 代码检查与格式化 |
| 自动导入 | unplugin-auto-import | 简化 API 调用 |
| 组件自动注册 | unplugin-vue-components | 自动化组件引入 |

## 项目规划

### 目录结构

```
ruoyi-elysia-web/
├── src/
│   ├── api/                    # API 接口层
│   │   └── client.ts           # Eden API 客户端
│   │
│   ├── assets/                 # 静态资源
│   │   └── icons/              # 本地图标
│   │
│   ├── components/             # 公共组件
│   │   ├── common/             # 通用组件
│   │   │   ├── TablePage.vue       # 表格分页组件
│   │   │   ├── FormModal.vue       # 表单弹窗组件
│   │   │   ├── ConfirmDialog.vue   # 确认对话框
│   │   │   └── FileUpload.vue      # 文件上传组件
│   │   └── icons/              # 图标组件封装
│   │
│   ├── composables/            # 组合式函数
│   │   ├── useAuth.ts          # 认证状态管理
│   │   ├── usePermission.ts    # 权限控制
│   │   ├── useTabbar.ts        # 标签页管理
│   │   └── useDict.ts          # 字典数据
│   │
│   ├── directives/             # 自定义指令
│   │   └── permission.ts       # 按钮级别权限指令
│   │
│   ├── layouts/                # 布局文件（vite-plugin-vue-layouts）
│   │   ├── default.vue        # 默认布局
│   │   ├── blank.vue          # 空白布局
│   │   └── fullscreen.vue     # 全屏布局
│   │
│   ├── router/                 # 路由配置
│   │   └── index.ts           # 路由入口、布局集成
│   │
│   ├── pages/                  # 页面文件（Vue Router 5 文件路由）
│   │   ├── login.vue           # /login
│   │   ├── dashboard.vue       # /dashboard
│   │   ├── system/             # 系统管理
│   │   │   ├── user/           # 用户管理
│   │   │   ├── role/           # 角色管理
│   │   │   ├── menu/           # 菜单管理
│   │   │   ├── dept/           # 部门管理
│   │   │   ├── post/           # 岗位管理
│   │   │   ├── dict/           # 字典管理
│   │   │   ├── config/         # 参数配置
│   │   │   └── notice/         # 通知公告
│   │   ├── monitor/            # 监控管理
│   │   │   ├── online/         # 在线用户
│   │   │   ├── login-log/       # 登录日志
│   │   │   └── oper-log/       # 操作日志
│   │   └── error/              # 错误页面
│   │       ├── 403.vue
│   │       ├── 404.vue
│   │       └── 500.vue
│   │
│   ├── App.vue                  # 根组件
│   └── main.ts                  # 入口文件
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── uno.config.ts                 # UnoCSS 配置
└── .env.example                 # 环境变量示例
```

### 页面与路由规划

采用 Vue Router 5 内置的文件路由功能，配合 `vite-plugin-vue-layouts` 实现布局自动切换。

#### vite.config.ts 集成

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueRouter from 'vue-router/vite'
import VueLayouts from 'vite-plugin-vue-layouts'

export default defineConfig({
  plugins: [
    Vue(),
    VueRouter(),              // Vue Router 5 文件路由插件
    VueLayouts(),             // 布局插件
  ],
})
```

#### 目录结构约定

```
src/
├── layouts/                  # 布局文件
│   ├── default.vue          # 默认布局
│   ├── blank.vue            # 空白布局（无侧边栏）
│   └── fullscreen.vue       # 全屏布局
│
└── pages/                   # 页面文件（Vue Router 5 文件路由）
    ├── login.vue            # /login
    ├── dashboard.vue         # /dashboard
    ├── system/
    │   ├── user/
    │   │   ├── index.vue   # /system/user
    │   │   ├── add.vue      # /system/user/add
    │   │   └── [id].vue     # /system/user/:id（动态路由）
    │   └── role/
    │       └── index.vue    # /system/role
    └── monitor/
        └── online/
            └── index.vue    # /monitor/online
```

#### Vue 文件路由配置

```vue
<!-- src/pages/system/user/index.vue -->
<script setup lang="ts">
// 使用 definePage() 配置路由 meta
definePage({
  meta: {
    title: '用户管理',
    icon: 'lucide:users',
    permission: 'system:user:list',
  },
})
</script>

<template>
  <div>用户管理页面</div>
</template>
```

**使用 `<route>` 自定义块配置**（推荐）：

```vue
<!-- src/pages/system/user/index.vue -->
<script setup lang="ts">
// ...
</script>

<route lang="json">
{
  "meta": {
    "title": "用户管理",
    "icon": "lucide:users",
    "permission": "system:user:list"
  }
}
</route>

<template>
  <div>用户管理页面</div>
</template>
```

#### 路由入口集成

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'
import { setupLayouts } from 'virtual:generated-layouts'

const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(routes),
})

// 热更新支持：修改页面文件时无需刷新页面即可更新路由
if (import.meta.hot) {
  handleHotUpdate(router)
}

export default router
```

**热更新说明**：

- 启用后修改 `src/pages/` 下的 Vue 文件，路由会自动更新，无需刷新页面
- 如果布局文件（`src/layouts/*.vue`）变更，需要手动刷新页面
- 生产环境自动禁用热更新逻辑

#### 路由自动生成规则

| 文件路径 | 自动生成路由 |
|----------|-------------|
| `src/pages/login.vue` | `/login` |
| `src/pages/dashboard.vue` | `/dashboard` |
| `src/pages/system/user/index.vue` | `/system/user` |
| `src/pages/system/user/add.vue` | `/system/user/add` |
| `src/pages/system/user/[id].vue` | `/system/user/:id`（动态路由） |
| `src/pages/system/user.[id].vue` | `/system/user/:id`（嵌套路由，无层级） |

#### 布局与路由配合

**方式一：通过布局文件名**

布局文件名自动对应路由：

```
src/layouts/default.vue     → layout: 'default'
src/layouts/blank.vue      → layout: 'blank'
src/layouts/fullscreen.vue → layout: 'fullscreen'
```

页面使用默认布局（`default.vue`），登录页使用空白布局（`blank.vue`）：

```vue
<!-- src/pages/login.vue - 自动使用 blank.vue 布局 -->
<script setup lang="ts">
definePage({
  meta: {
    title: '登录',
  },
})
</script>
```

**方式二：通过 `<route>` 块指定布局**

```vue
<!-- src/pages/dashboard.vue -->
<script setup lang="ts">
definePage({
  meta: {
    title: '工作台',
    icon: 'lucide:layout-dashboard',
  },
})
</script>

<!-- 该页面会自动使用 default.vue 布局 -->
```

#### 动态路由

```vue
<!-- src/pages/system/user/[id].vue -->
<script setup lang="ts">
definePage({
  meta: {
    title: '用户详情',
    permission: 'system:user:list',
  },
})
// 通过 useRoute().params.id 获取参数
const route = useRoute()
console.log(route.params.id)
</script>
```

#### 嵌套路由

同名的 `.vue` 文件和文件夹会产生嵌套关系：

```
src/pages/users.vue          → 父路由组件
src/pages/users/index.vue    → 子路由组件（渲染在父组件的 <slot /> 中）
```

#### 路由分组（不影响 URL）

使用圆括号创建路由分组，URL 保持不变：

```
src/pages/
├── (admin)/
│   ├── dashboard.vue       → /dashboard
│   └── settings.vue       → /settings
└── (user)/
    └── profile.vue        → /profile
```

#### TypeScript 类型支持

启动开发服务器后，会自动生成 `typed-router.d.ts` 类型文件。

**tsconfig.json 配置**：

```json
{
  "include": ["./typed-router.d.ts"],
  "compilerOptions": {
    "moduleResolution": "Bundler"
  },
  "vueCompilerOptions": {
    "plugins": [
      "vue-router/volar/sfc-route-blocks",
      "vue-router/volar/sfc-typed-router"
    ]
  }
}
```

#### 1. 登录认证模块

| 页面 | 路由 | 说明 |
|------|------|------|
| 登录页 | `/login` | 图形验证码、登录表单 |

**登录页功能**：
- 图形验证码展示与刷新
- 用户名/密码登录
- 记住登录状态
- 登录成功跳转主页

#### 2. 首页

| 页面 | 路由 | 说明 |
|------|------|------|
| 工作台 | `/dashboard` | 欢迎页、快捷入口、统计卡片 |

#### 3. 系统管理模块

| 页面 | 路由 | 权限标识 | 说明 |
|------|------|----------|------|
| 用户管理 | `/system/user` | system:user:list | 用户列表、新增、编辑、删除、重置密码、导入导出 |
| 角色管理 | `/system/role` | system:role:list | 角色列表、新增、编辑、删除、菜单授权 |
| 菜单管理 | `/system/menu` | system:menu:list | 菜单列表、目录/菜单/按钮管理 |
| 部门管理 | `/system/dept` | system:dept:list | 部门树、新增、编辑、删除 |
| 岗位管理 | `/system/post` | system:post:list | 岗位列表、新增、编辑、删除 |
| 字典类型 | `/system/dict/type` | system:dict:type:list | 字典类型管理 |
| 字典数据 | `/system/dict/data` | system:dict:data:list | 字典数据管理 |
| 参数配置 | `/system/config` | system:config:list | 参数列表、新增、编辑、删除 |
| 通知公告 | `/system/notice` | system:notice:list | 公告列表、新增、编辑、删除 |

#### 4. 监控管理模块

| 页面 | 路由 | 权限标识 | 说明 |
|------|------|----------|------|
| 在线用户 | `/monitor/online` | monitor:online:list | 在线用户列表、强制下线 |
| 登录日志 | `/monitor/login-log` | monitor:logininfor:list | 登录日志、导出、清空 |
| 操作日志 | `/monitor/oper-log` | monitor:operlog:list | 操作日志、详情、导出 |

#### 5. 错误页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 403 无权限 | `/403` | 无权限访问 |
| 404 未找到 | `/404` | 页面不存在 |
| 500 服务器错误 | `/500` | 服务器异常 |

### 核心功能实现

#### 1. 认证与授权

**登录流程**：
```
用户输入账号密码 + 验证码
    ↓
GET /api/auth/captcha 获取验证码
    ↓
POST /api/auth/login 提交登录
    ↓
存储 token 和 refreshToken
    ↓
GET /api/auth/getInfo 获取用户信息和权限
    ↓
跳转主页并初始化菜单
```

**Token 刷新机制**：
- Access Token 有效期 1 天
- Refresh Token 有效期 7 天
- Token 过期前自动刷新
- 刷新失败跳转登录页

**权限控制体系**：

若依采用三级别权限控制：页面级别、按钮级别、接口级别。

```
页面级别（路由守卫）
    ↓ 获取用户权限列表 user.permissions = ['system:user:list', 'system:user:add', ...]
    ↓ 路由 meta.permission 检查
按钮级别（v-permission 指令）
    ↓ 菜单按钮携带权限标识 perms = 'system:user:add'
    ↓ 渲染时判断是否显示
接口级别（请求拦截器）
    ↓ 请求自动附加 Authorization token
    ↓ 后端 secured 装饰器校验权限
```

**1. 权限标识规范**：

后端菜单的 `perms` 字段定义按钮级别权限，格式为 `模块:资源:操作`：

| 权限标识 | 模块 | 资源 | 操作 |
|----------|------|------|------|
| `system:user:list` | system | user | list |
| `system:user:add` | system | user | add |
| `system:user:edit` | system | user | edit |
| `system:user:remove` | system | user | remove |
| `system:user:export` | system | user | export |
| `system:user:import` | system | user | import |
| `system:user:resetPwd` | system | user | resetPwd |
| `system:role:auth` | system | role | auth |

**2. v-permission 指令**：

```typescript
// src/directives/permission.ts
import type { Directive } from 'vue'

export const vPermission: Directive = {
  mounted(el, binding) {
    const { value } = binding
    const permissions = usePermissionStore().permissions
    
    if (value && !permissions.includes(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}

// 使用方式
// <n-button v-permission="'system:user:add'">新增用户</n-button>
// <n-button v-permission="'system:user:edit'">编辑</n-button>
// <n-button v-permission="'system:user:remove'">删除</n-button>
```

**3. 权限判断组合函数**：

```typescript
// src/composables/usePermission.ts
import { defineStore } from 'pinia'

interface PermissionState {
  permissions: string[]      // 权限标识列表
  roles: string[]           // 角色列表
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    permissions: [],
    roles: []
  }),
  actions: {
    setPermissions(permissions: string[]) {
      this.permissions = permissions
    },
    hasPermission(permission: string): boolean {
      return this.permissions.includes(permission)
    },
    hasAnyPermission(permissions: string[]): boolean {
      return permissions.some(p => this.permissions.includes(p))
    },
    hasAllPermissions(permissions: string[]): boolean {
      return permissions.every(p => this.permissions.includes(p))
    }
  }
})

// 组合式函数封装
export function usePermission() {
  const permissionStore = usePermissionStore()
  
  return {
    permissions: computed(() => permissionStore.permissions),
    hasPermission: (perm: string) => permissionStore.hasPermission(perm),
    hasAnyPermission: (perms: string[]) => permissionStore.hasAnyPermission(perms),
    hasAllPermissions: (perms: string[]) => permissionStore.hasAllPermissions(perms),
  }
}

// 模板中使用
// <template v-if="hasPermission('system:user:add')">
//   <n-button type="primary">新增</n-button>
// </template>
```

**4. 路由守卫权限校验**：

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { setupLayouts } from 'virtual:generated-layouts'

const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(routes),
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 白名单路由直接放行
  if (whiteList.includes(to.path)) {
    return next()
  }
  
  // 检查登录状态
  if (!authStore.isLogin) {
    return next('/login')
  }
  
  // 首次加载时获取用户信息
  if (!authStore.hasUserInfo) {
    await authStore.fetchUserInfo()
  }
  
  // 检查页面级别权限
  const { meta } = to
  if (meta.permission && !authStore.hasPermission(meta.permission)) {
    return next('/403')
  }
  
  next()
})

export default router
```

**5. 接口级别权限校验**：

后端 `secured` 装饰器自动校验接口权限，前端无需额外处理：

```
前端请求                          后端处理
   |                                 |
   |-- POST /api/system/user/add --→ |
   |    Authorization: Bearer xxx    |
   |    { username, password, ... }  |-- secured({ permission: 'system:user:add' })
   |                                 |-- 校验 token 和 权限标识
   |←-- { code: 200, data: {...} } -|
```

#### 2. 菜单与标签页

**侧边栏菜单**：
- 基于用户权限动态生成
- 支持展开/折叠
- 高亮当前激活菜单
- 菜单搜索功能

**标签页**：
- 多标签页展示
- 标签栏右键操作（刷新、关闭、关闭其他）
- 标签页拖拽排序
- 记忆已打开标签

#### 3. 通用表格分页组件

```typescript
// API 调用
interface PageQuery {
  pageNum: number;
  pageSize: number;
  [key: string]: any;
}

interface PageResponse<T> {
  rows: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}
```

**组件功能**：
- 自动分页
- 列选择
- 批量操作
- 导出功能
- 刷新数据

#### 4. 表单弹窗组件

**组件功能**：
- 新增/编辑复用
- 表单校验
- 提交 loading 状态
- 成功后自动关闭

#### 5. 字典数据

**使用方式**：
```typescript
// 组合式函数调用
const { data: statusOptions } = useDict('sys_user_status');

// 模板中使用
<n-select v-model:value="form.status" :options="statusOptions" />
```

### API 接口对接

采用 **@elysiajs/eden** 实现端到端类型安全的 API 调用。

#### 前端直接引用后端类型

由于前后端为独立仓库，前端通过相对路径引用后端类型：

```typescript
// src/api/client.ts
import { edenTreaty } from '@elysiajs/eden'
import type { App } from '@ruoyi/backend'

export const api = edenTreaty<App>('/api')
```

#### 使用示例

```typescript
// 获取用户列表
const { data, error } = await api.api.system.user.list.get({
  params: { pageNum: 1, pageSize: 10 }
})

// 新增用户
await api.api.system.user.add.post({
  body: {
    username: 'admin',
    password: '123456',
  }
})

// 编辑用户
await api.api.system.user.edit.patch({
  body: { userId: 1, username: 'updated' }
})

// 删除用户
await api.api.system.user.remove.delete({
  params: { userId: 1 }
})
```

**注意**：`/api` 前缀需要通过 Vite 代理转发到后端服务。

#### Eden 请求配置

```typescript
// src/api/client.ts
import { edenTreaty } from '@elysiajs/eden'
import type { App } from '@ruoyi/backend'

export const api = edenTreaty<App>('/api', {
  headers: {
    // 可以在这里添加默认 headers
  },
})
```

#### 统一响应结构

```typescript
interface ApiResponse<T = any> {
  code: number;      // 状态码
  msg: string;      // 消息
  data: T;          // 数据
}
```

#### Token 认证处理

Eden 支持通过 headers 配置 Token：

```typescript
// src/api/client.ts
import { edenTreaty } from '@elysiajs/eden'
import type { App } from '@ruoyi/backend'
import { useAuthStore } from '@/stores/auth'

export const api = edenTreaty<App>('/api', {
  headers: {
    get Authorization() {
      const token = useAuthStore().token
      return token ? `Bearer ${token}` : undefined
    }
  },
})
```

#### 错误处理

Eden 的响应是 discriminated union，可通过 `error` 属性处理错误：

```typescript
const { data, error } = await api.api.system.user.list.get()

if (error.value) {
  switch (error.value.status) {
    case 401:
      // Token 过期，跳转登录
      router.push('/login')
      break
    case 403:
      // 无权限
      message.warning('无权限访问')
      break
    default:
      // 其他错误
      message.error(error.value.value?.message || '请求失败')
  }
}
```

### 环境变量配置

```env
VITE_API_BASE_URL=/api
VITE_APP_TITLE=RuoYi管理系统
VITE_APP_PORT=3000
```

## 后端接口对照

后端项目 `ruoyi-elysia` 提供以下 API：

| 模块 | 接口前缀 | 说明 |
|------|----------|------|
| 认证 | `/api/auth` | 登录/登出/刷新/用户信息 |
| 用户 | `/api/system/user` | CRUD/导入/导出/重置密码 |
| 角色 | `/api/system/role` | CRUD/菜单授权 |
| 菜单 | `/api/system/menu` | CRUD/导出 |
| 部门 | `/api/system/dept` | 部门树/CRUD/导出 |
| 岗位 | `/api/system/post` | CRUD |
| 字典类型 | `/api/system/dict/type` | CRUD/导出 |
| 字典数据 | `/api/system/dict/data` | CRUD |
| 参数配置 | `/api/system/config` | CRUD/导出 |
| 通知公告 | `/api/system/notice` | CRUD |
| 定时任务 | `/api/system/job` | CRUD |
| 在线用户 | `/api/monitor/online` | 列表/强制下线 |
| 登录日志 | `/api/monitor/logininfor` | 列表/导出/清空 |
| 操作日志 | `/api/monitor/operlog` | 列表/详情/导出 |

详细 API 文档请参考后端 Swagger UI：`http://localhost:4000/swagger`

## 工具库用法

### Excel 导入导出（xlsx）

```typescript
import * as XLSX from 'xlsx'

// 导出 Excel
const exportExcel = <T>(data: T[], filename: string, sheetName = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

// 使用
const users = [
  { username: 'admin', email: 'admin@test.com' },
  { username: 'user', email: 'user@test.com' },
]
exportExcel(users, '用户列表')

// 导入 Excel
const importExcel = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet)
      resolve(jsonData)
    }
    reader.onerror = reject
    reader.readAsBinaryString(file)
  })
}
```

### 运行时校验（zod）

```typescript
import { z } from 'zod'

// 定义表单 Schema
const userFormSchema = z.object({
  username: z.string().min(2, '用户名至少2个字符'),
  password: z.string().min(6, '密码至少6个字符'),
  email: z.string().email('邮箱格式不正确'),
  phone: z.string().optional(),
  status: z.enum(['0', '1']),
})

type UserForm = z.infer<typeof userFormSchema>

// 表单校验
const validateForm = (data: unknown) => {
  const result = userFormSchema.safeParse(data)
  if (!result.success) {
    // 获取校验错误信息
    const errors = result.error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    return { valid: false, errors }
  }
  return { valid: true, data: result.data }
}

// 使用
const { valid, errors } = validateForm({ username: 'a', password: '123' })
// valid: false
// errors: [{ field: 'username', message: '用户名至少2个字符' }, ...]
```

### 日期处理（dayjs）

```typescript
import dayjs from 'dayjs'

// 格式化日期
dayjs().format('YYYY-MM-DD HH:mm:ss')
dayjs().format('YYYY/MM/DD')

// 日期计算
dayjs().add(1, 'day')
dayjs().subtract(7, 'day')
dayjs().startOf('month')
dayjs().endOf('month')

// 日期比较
dayjs().isBefore('2024-01-01')
dayjs().isAfter('2024-01-01')
dayjs().isSame(dayjs(), 'day')

// 时间戳
dayjs().unix()
dayjs(1234567890 * 1000).format()

// 相对时间
dayjs().fromNow()
dayjs().to(dayjs('2024-01-01'))

// 国际化（中文）
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')
```

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 类型检查

```bash
pnpm typecheck
```

## 待完成功能

- [ ] 项目基础架构搭建（目录结构、配置）
- [ ] 登录页开发
- [ ] 首页工作台
- [ ] 用户管理页面
- [ ] 角色管理页面
- [ ] 菜单管理页面
- [ ] 部门管理页面
- [ ] 岗位管理页面
- [ ] 字典管理页面
- [ ] 参数配置页面
- [ ] 通知公告页面
- [ ] 在线用户页面
- [ ] 登录日志页面
- [ ] 操作日志页面
- [ ] 标签页功能
- [ ] 权限指令
- [ ] 字典数据缓存
- [ ] 导入导出功能
- [ ] 响应式布局
