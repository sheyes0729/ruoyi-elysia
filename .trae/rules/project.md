1. 代码拆分准则 (Code Splitting)
- **路由与逻辑分离**：controllers 只负责定义 path、method 和 t.Schema。具体的业务逻辑必须提取到 services 中的异步函数。

- **单一职责**：一个 Service 函数只做一件事（例如 userService.createUser），不要在控制器里写复杂的 SQL 或逻辑判断。

2. 命名规范 (Naming Convention)
- **文件名**：统一使用 kebab-case (例如 user-controller.ts)，保持与 Bun 生态一致。

- **导出对象**：使用 PascalCase 导出 Elysia 实例（例如 export const UserRoutes = ...）。

- **Schema 校验**：输入参数校验统一命名为 [Action][Entity]Schema (例如 CreateUserSchema)。

3. 易扩展性架构 (Extensibility)
- **插件化组装**：利用 Elysia 的 .use() 机制。每一个功能模块（如 System, Tool, Monitor）都应该是一个独立的 Elysia 插件。

- **类型安全**：强制使用 t.Object 进行输入输出校验，以便前端通过 Elysia.fn 或 Eden 自动获得类型推导。

- **依赖注入（简化版）**：利用 Elysia 的 derive 或 state 来注入全局状态（如当前用户、数据库实例），避免在每个函数里重复初始化。