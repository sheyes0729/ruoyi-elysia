import { Elysia } from "elysia";
import { roleRoutes } from "./role/routes";
import { userRoutes } from "./user/routes";

export const systemRoutes = new Elysia({ name: "system.routes" })
  .use(userRoutes)
  .use(roleRoutes);
