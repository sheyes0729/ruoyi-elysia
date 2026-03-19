import { app } from "./app";
import { env } from "./config/env";

const server = app.listen(env.port);

console.log(
  `🦊 RuoYi Elysia is running at http://${server.server?.hostname}:${server.server?.port}`
);
