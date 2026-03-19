import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

export const platformPlugin = new Elysia({ name: "platform.plugin" })
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "RuoYi Elysia API",
          version: "1.0.0",
        },
      },
    })
  );
