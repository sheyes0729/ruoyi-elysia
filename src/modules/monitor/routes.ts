import { Elysia } from "elysia";
import { LoginLogRoutes } from "./login-log/routes";
import { OnlineRoutes } from "./online/routes";

export const MonitorRoutes = new Elysia({ name: "monitor.routes" })
  .use(OnlineRoutes)
  .use(LoginLogRoutes);
