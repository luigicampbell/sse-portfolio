import { Application } from "@oak/oak/application";
import { Router } from "@oak/oak/router";

import { errorMiddleware } from "../src/middleware/error.middleware.ts";
import { timingMiddleware } from "../src/middleware/timing.middleware.ts";
import { securityMiddleware } from "../src/middleware/security.middleware.ts";

Deno.test(
  "middleware adds timing and security headers",
  async () => {
    const app = createTestApplication();

    const response = await handleRequest(
      app,
      "/ok",
    );

    if (response.status !== 200) {
      throw new Error(
        `Expected status 200, received ${response.status}.`,
      );
    }

    const serverTiming = response.headers.get(
      "server-timing",
    );

    if (
      !serverTiming ||
      !/^app;dur=\d+(\.\d+)?$/.test(serverTiming)
    ) {
      throw new Error(
        `Expected Server-Timing header, received ${serverTiming}.`,
      );
    }

    assertHeader(
      response,
      "x-content-type-options",
      "nosniff",
    );

    assertHeader(
      response,
      "x-frame-options",
      "DENY",
    );

    assertHeader(
      response,
      "referrer-policy",
      "strict-origin-when-cross-origin",
    );

    assertHeader(
      response,
      "permissions-policy",
      "camera=(), microphone=(), geolocation=()",
    );
  },
);

Deno.test(
  "error middleware converts uncaught errors to 500",
  async () => {
    const app = createTestApplication();

    const response = await handleRequest(
      app,
      "/error",
    );

    if (response.status !== 500) {
      throw new Error(
        `Expected status 500, received ${response.status}.`,
      );
    }

    const body = await response.json() as {
      error: string;
    };

    if (
      body.error !==
        "Internal server error."
    ) {
      throw new Error(
        `Unexpected error response: ${body.error}.`,
      );
    }

    const serverTiming = response.headers.get(
      "server-timing",
    );

    if (
      !serverTiming ||
      !/^app;dur=\d+(\.\d+)?$/.test(
        serverTiming,
      )
    ) {
      throw new Error(
        `Expected Server-Timing header, received ${serverTiming}.`,
      );
    }

    assertHeader(
      response,
      "x-content-type-options",
      "nosniff",
    );

    assertHeader(
      response,
      "x-frame-options",
      "DENY",
    );

    assertHeader(
      response,
      "referrer-policy",
      "strict-origin-when-cross-origin",
    );

    assertHeader(
      response,
      "permissions-policy",
      "camera=(), microphone=(), geolocation=()",
    );
  },
);

function createTestApplication(): Application {
  const app = new Application();
  const router = new Router();

  router.get(
    "/ok",
    (context) => {
      context.response.status = 200;
      context.response.body = {
        ok: true,
      };
    },
  );

  router.get(
    "/error",
    () => {
      throw new Error(
        "Intentional middleware test error.",
      );
    },
  );

  app.use(errorMiddleware);
  app.use(timingMiddleware);
  app.use(securityMiddleware);

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}

async function handleRequest(
  app: Application,
  pathname: string,
): Promise<Response> {
  const response = await app.handle(
    new Request(
      `http://localhost${pathname}`,
    ),
  );

  if (!response) {
    throw new Error(
      `Expected ${pathname} to return a response.`,
    );
  }

  return response;
}

function assertHeader(
  response: Response,
  name: string,
  expected: string,
): void {
  const actual = response.headers.get(name);

  if (actual !== expected) {
    throw new Error(
      `Expected ${name}="${expected}", received "${actual}".`,
    );
  }
}
