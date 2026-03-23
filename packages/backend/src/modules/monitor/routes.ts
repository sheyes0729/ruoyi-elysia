import { Elysia } from "elysia";
import { LoginLogRoutes } from "./login-log/routes";
import { OnlineRoutes } from "./online/routes";
import { OperLogRoutes } from "./oper-log/routes";

export const MonitorRoutes = new Elysia({ name: "monitor.routes" })
  .use(OnlineRoutes)
  .use(LoginLogRoutes)
  .use(OperLogRoutes);
