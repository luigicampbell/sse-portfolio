import { Application } from "@oak/oak/application";
import { Router } from "@oak/oak/router";

import { errorMiddleware } from "../src/middleware/error.middleware.ts";
import { securityMiddleware } from "../src/middleware/security.middleware.ts";
import { createStaticMiddleware } from "../src/middleware/static.middleware.ts";
import { timingMiddleware } from "../src/middleware/timing.middleware.ts";

Deno.test(
  "middleware adds timing and security headers",
  async () => {
    const app = createTestApplication();

    const response = await handleRequest(
      app,
      "/ok",
    );

    assertStatus(response, 200);

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

Deno.test(
  "error middleware converts uncaught errors to 500",
  async () => {
    const app = createTestApplication();

    const response = await handleRequest(
      app,
      "/error",
    );

    assertStatus(response, 500);

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

Deno.test(
  "static middleware serves Vite assets with immutable caching",
  async () => {
    await withStaticFixture(
      async (root) => {
        const app = createStaticTestApplication(
          root,
        );

        const response = await handleRequest(
          app,
          "/assets/app-a1b2c3.js",
        );

        assertStatus(response, 200);

        assertHeader(
          response,
          "cache-control",
          "max-age=31536000,immutable",
        );

        assertBody(
          await response.text(),
          'console.log("fixture");',
        );

        assertHeaderPresent(
          response,
          "etag",
        );
      },
    );
  },
);

Deno.test(
  "static middleware keeps index document revalidatable",
  async () => {
    await withStaticFixture(
      async (root) => {
        const app = createStaticTestApplication(
          root,
        );

        const response = await handleRequest(
          app,
          "/",
          {
            headers: {
              accept: "text/html",
            },
          },
        );

        assertStatus(response, 200);

        assertHeader(
          response,
          "cache-control",
          "max-age=0",
        );

        assertBody(
          await response.text(),
          STATIC_INDEX_HTML,
        );

        assertHeaderPresent(
          response,
          "etag",
        );
      },
    );
  },
);

Deno.test(
  "static middleware serves SPA navigation through index without immutable caching",
  async () => {
    await withStaticFixture(
      async (root) => {
        const app = createStaticTestApplication(
          root,
        );

        const response = await handleRequest(
          app,
          "/projects/example",
          {
            headers: {
              accept: "text/html,application/xhtml+xml",
            },
          },
        );

        assertStatus(response, 200);

        assertHeader(
          response,
          "cache-control",
          "max-age=0",
        );

        assertBody(
          await response.text(),
          STATIC_INDEX_HTML,
        );
      },
    );
  },
);

Deno.test(
  "static middleware does not convert missing files into SPA responses",
  async () => {
    await withStaticFixture(
      async (root) => {
        const app = createStaticTestApplication(
          root,
        );

        const response = await handleRequest(
          app,
          "/missing.js",
          {
            headers: {
              accept: "text/html",
            },
          },
        );

        assertStatus(response, 404);

        const body = await response.text();

        if (
          body.includes(
            "<title>Portfolio</title>",
          )
        ) {
          throw new Error(
            "Expected missing static file to fall through instead of serving index.html.",
          );
        }
      },
    );
  },
);

Deno.test(
  "static middleware does not convert API paths into SPA responses",
  async () => {
    await withStaticFixture(
      async (root) => {
        const app = createStaticTestApplication(
          root,
        );

        const response = await handleRequest(
          app,
          "/api/missing",
          {
            headers: {
              accept: "text/html",
            },
          },
        );

        assertStatus(response, 404);

        const body = await response.text();

        if (
          body.includes(
            "<title>Portfolio</title>",
          )
        ) {
          throw new Error(
            "Expected API path to fall through instead of serving index.html.",
          );
        }
      },
    );
  },
);

Deno.test(
  "static middleware does not convert internal paths into SPA responses",
  async () => {
    await withStaticFixture(
      async (root) => {
        const app = createStaticTestApplication(
          root,
        );

        const response = await handleRequest(
          app,
          "/internal/missing",
          {
            headers: {
              accept: "text/html",
            },
          },
        );

        assertStatus(response, 404);

        const body = await response.text();

        if (
          body.includes(
            "<title>Portfolio</title>",
          )
        ) {
          throw new Error(
            "Expected internal path to fall through instead of serving index.html.",
          );
        }
      },
    );
  },
);

Deno.test(
  "static middleware allows HEAD requests for immutable assets",
  async () => {
    await withStaticFixture(
      async (root) => {
        const app = createStaticTestApplication(
          root,
        );

        const response = await handleRequest(
          app,
          "/assets/app-a1b2c3.js",
          {
            method: "HEAD",
          },
        );

        assertStatus(response, 200);

        assertHeader(
          response,
          "cache-control",
          "max-age=31536000,immutable",
        );

        assertHeaderPresent(
          response,
          "etag",
        );
      },
    );
  },
);

Deno.test(
  "static middleware passes non-GET requests through",
  async () => {
    await withStaticFixture(
      async (root) => {
        const app = createStaticTestApplication(
          root,
        );

        const response = await handleRequest(
          app,
          "/projects",
          {
            method: "POST",
            headers: {
              accept: "text/html",
            },
          },
        );

        assertStatus(response, 404);
      },
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

function createStaticTestApplication(
  root: string,
): Application {
  const app = new Application();

  app.use(
    createStaticMiddleware(root),
  );

  return app;
}

async function handleRequest(
  app: Application,
  pathname: string,
  init?: RequestInit,
): Promise<Response> {
  const response = await app.handle(
    new Request(
      `http://localhost${pathname}`,
      init,
    ),
  );

  if (!response) {
    throw new Error(
      `Expected ${pathname} to return a response.`,
    );
  }

  return response;
}

async function withStaticFixture(
  run: (
    root: string,
  ) => Promise<void>,
): Promise<void> {
  const root = await Deno.makeTempDir({
    prefix: "portfolio-static-middleware-",
  });

  try {
    await Deno.mkdir(
      `${root}/assets`,
      {
        recursive: true,
      },
    );

    await Promise.all([
      Deno.writeTextFile(
        `${root}/index.html`,
        STATIC_INDEX_HTML,
      ),
      Deno.writeTextFile(
        `${root}/assets/app-a1b2c3.js`,
        'console.log("fixture");',
      ),
      Deno.writeTextFile(
        `${root}/favicon.ico`,
        "fixture",
      ),
    ]);

    await run(root);
  } finally {
    await Deno.remove(
      root,
      {
        recursive: true,
      },
    );
  }
}

function assertStatus(
  response: Response,
  expected: number,
): void {
  if (
    response.status !== expected
  ) {
    throw new Error(
      `Expected status ${expected}, received ${response.status}.`,
    );
  }
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

function assertHeaderPresent(
  response: Response,
  name: string,
): void {
  const actual = response.headers.get(name);

  if (!actual) {
    throw new Error(
      `Expected ${name} header to be present.`,
    );
  }
}

function assertBody(
  actual: string,
  expected: string,
): void {
  if (actual !== expected) {
    throw new Error(
      `Expected body ${JSON.stringify(expected)}, received ${
        JSON.stringify(actual)
      }.`,
    );
  }
}

const STATIC_INDEX_HTML = [
  "<!doctype html>",
  "<html>",
  "<head>",
  "<title>Portfolio</title>",
  "</head>",
  "<body>",
  '<div id="root"></div>',
  "</body>",
  "</html>",
].join("");
