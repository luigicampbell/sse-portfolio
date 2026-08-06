import type { Router } from "@oak/oak/router";

import { env } from "../../config/env.ts";

export function registerHealthRoutes(
  router: Router,
): void {
  router.get(
    "/api/v1/health",
    (context) => {
      context.response.status = 200;
      context.response.type = "application/json";

      context.response.body = {
        ok: true,
        storageDriver: env.storageDriver,
      };
    },
  );
}
