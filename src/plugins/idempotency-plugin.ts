import { Elysia } from "elysia";
import { idempotencyService } from "./idempotency";

const IDEMPOTENCY_HEADER = "x-idempotency-key";

export const idempotencyPlugin = new Elysia({
  name: "idempotency",
}).onBeforeHandle({ as: "global" }, async ({ request, set }) => {
  if (["POST", "PUT", "DELETE", "PATCH"].indexOf(request.method) === -1) {
    return;
  }

  const idempotencyKey = request.headers.get(IDEMPOTENCY_HEADER);
  if (!idempotencyKey) {
    return;
  }

  const existingResult = await idempotencyService.get(idempotencyKey);
  if (existingResult) {
    set.status = 200;
    return existingResult;
  }

  (request as Request & { idempotencyKey?: string }).idempotencyKey =
    idempotencyKey;
});

declare module "elysia" {
  interface Request {
    idempotencyKey?: string;
  }
}
