import { Application } from "@oak/oak/application";
import { Router } from "@oak/oak/router";

import { env } from "../src/config/env.ts";
import { registerHealthRoutes } from "../src/routes/v1/health.routes.ts";

Deno.test(
  "GET /api/v1/health returns service health",
  async () => {
    const app = new Application();
    const router = new Router();

    registerHealthRoutes(router);

    app.use(router.routes());
    app.use(router.allowedMethods());

    const response = await app.handle(
      new Request(
        "http://localhost/api/v1/health",
      ),
    );

    if (!response) {
      throw new Error(
        "Expected /api/v1/health to return a response.",
      );
    }

    if (response.status !== 200) {
      throw new Error(
        `Expected status 200, received ${response.status}.`,
      );
    }

    const body = await response.json() as {
      ok: boolean;
      storageDriver: string;
    };

    if (body.ok !== true) {
      throw new Error(
        "Expected health response to report ok=true.",
      );
    }

    if (
      body.storageDriver !== env.storageDriver
    ) {
      throw new Error(
        `Expected storage driver ${env.storageDriver}, received ${body.storageDriver}.`,
      );
    }
  },
);
