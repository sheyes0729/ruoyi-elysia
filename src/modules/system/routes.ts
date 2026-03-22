import { Elysia } from "elysia";
import { ConfigRoutes } from "./config/routes";
import { DictDataRoutes } from "./dict-data/routes";
import { DictTypeRoutes } from "./dict-type/routes";
import { DeptRoutes } from "./dept/routes";
import { MenuRoutes } from "./menu/routes";
import { NoticeRoutes } from "./notice/routes";
import { PostRoutes } from "./post/routes";
import { roleRoutes } from "./role/routes";
import { userRoutes } from "./user/routes";
import { jobRoutes } from "./job/routes";

export const systemRoutes = new Elysia({ name: "system.routes" })
  .use(userRoutes)
  .use(roleRoutes)
  .use(ConfigRoutes)
  .use(NoticeRoutes)
  .use(DictTypeRoutes)
  .use(DictDataRoutes)
  .use(MenuRoutes)
  .use(DeptRoutes)
  .use(PostRoutes)
  .use(jobRoutes);
