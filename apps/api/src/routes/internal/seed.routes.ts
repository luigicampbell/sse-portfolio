import type { Router } from "@oak/oak/router";

import { hasSupportedSeedSchemaVersion } from "@domain/mod.ts";

import {
  isValidSeedPayload,
  type SeedServicePort,
} from "../../services/seed.service.ts";

export function registerSeedRoutes(
  router: Router,
  service: SeedServicePort,
): void {
  router.post(
    "/internal/seed",
    async (context) => {
      const expectedToken = Deno.env.get("SEED_TOKEN");

      if (!expectedToken) {
        context.response.status = 503;
        context.response.type = "application/json";

        context.response.body = {
          error: "Seed endpoint is not configured.",
        };

        return;
      }

      const authorization = context.request.headers.get(
        "authorization",
      );

      if (
        authorization !==
          `Bearer ${expectedToken}`
      ) {
        context.response.status = 401;
        context.response.type = "application/json";

        context.response.body = {
          error: "Unauthorized.",
        };

        return;
      }

      let payload: unknown;

      try {
        payload = await context.request.body
          .json();
      } catch {
        context.response.status = 400;
        context.response.type = "application/json";

        context.response.body = {
          error: "Invalid JSON payload.",
        };

        return;
      }

      if (
        !isValidSeedPayload(
          payload,
        )
      ) {
        context.response.status = 400;
        context.response.type = "application/json";

        context.response.body = {
          error: "Invalid seed payload.",
        };

        return;
      }

      if (
        !hasSupportedSeedSchemaVersion(
          payload.manifest,
        )
      ) {
        context.response.status = 409;
        context.response.type = "application/json";

        context.response.body = {
          error: "Incompatible seed schema version.",
        };

        return;
      }

      await service.seed(
        payload,
      );

      context.response.status = 204;
    },
  );
}
