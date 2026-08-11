import { Application } from "@oak/oak/application";
import { Router } from "@oak/oak/router";
import { errorMiddleware } from "../src/middleware/error.middleware.ts";

import type { SeedServicePort } from "../src/services/seed.service.ts";

import { registerSeedRoutes } from "../src/routes/internal/seed.routes.ts";
import { SeedPayload } from "@domain/mod.ts";
import { TEST_SEED_PAYLOAD } from "./fixtures/seed.mock.ts";

const TEST_TOKEN = "test-seed-token";

Deno.test(
  "POST /internal/seed returns 401 without authorization",
  async () => {
    const originalToken = Deno.env.get("SEED_TOKEN");

    Deno.env.set(
      "SEED_TOKEN",
      TEST_TOKEN,
    );

    try {
      const service = createSeedServiceStub();

      const app = createTestApplication(
        service,
      );

      const response = await handleRequest(
        app,
        "/internal/seed",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(
            TEST_SEED_PAYLOAD,
          ),
        },
      );

      if (
        response.status !== 401
      ) {
        throw new Error(
          `Expected status 401, received ${response.status}.`,
        );
      }

      const body = await response.json() as {
        error: string;
      };

      if (
        body.error !==
          "Unauthorized."
      ) {
        throw new Error(
          `Unexpected error response: ${body.error}.`,
        );
      }
    } finally {
      restoreEnv(
        "SEED_TOKEN",
        originalToken,
      );
    }
  },
);

Deno.test(
  "POST /internal/seed returns 503 when seed token is not configured",
  async () => {
    const originalToken = Deno.env.get("SEED_TOKEN");

    Deno.env.delete(
      "SEED_TOKEN",
    );

    try {
      const service = createSeedServiceStub();

      const app = createTestApplication(
        service,
      );

      const response = await handleRequest(
        app,
        "/internal/seed",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(
            TEST_SEED_PAYLOAD,
          ),
        },
      );

      if (
        response.status !== 503
      ) {
        throw new Error(
          `Expected status 503, received ${response.status}.`,
        );
      }

      const body = await response.json() as {
        error: string;
      };

      if (
        body.error !==
          "Seed endpoint is not configured."
      ) {
        throw new Error(
          `Unexpected error response: ${body.error}.`,
        );
      }
    } finally {
      restoreEnv(
        "SEED_TOKEN",
        originalToken,
      );
    }
  },
);

Deno.test(
  "POST /internal/seed returns 400 for an invalid seed payload",
  async () => {
    const originalToken = Deno.env.get("SEED_TOKEN");

    Deno.env.set(
      "SEED_TOKEN",
      TEST_TOKEN,
    );

    let seedCalled = false;

    try {
      const service: SeedServicePort = {
        seed(): Promise<void> {
          seedCalled = true;

          return Promise.resolve();
        },
      };

      const app = createTestApplication(
        service,
      );

      const invalidPayload = {
        ...TEST_SEED_PAYLOAD,

        /*
         * Valid JSON, but not a valid Profile.
         */
        profile: {
          id: "profile-main",
        },
      };

      const response = await handleRequest(
        app,
        "/internal/seed",
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${TEST_TOKEN}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(
            invalidPayload,
          ),
        },
      );

      if (
        response.status !== 400
      ) {
        throw new Error(
          `Expected status 400, received ${response.status}.`,
        );
      }

      const body = await response.json() as {
        error: string;
      };

      if (
        body.error !==
          "Invalid seed payload."
      ) {
        throw new Error(
          `Expected invalid seed payload response, received "${body.error}".`,
        );
      }

      if (seedCalled) {
        throw new Error(
          "SeedService.seed() must not be called for an invalid payload.",
        );
      }
    } finally {
      restoreEnv(
        "SEED_TOKEN",
        originalToken,
      );
    }
  },
);

Deno.test(
  "POST /internal/seed returns 400 for invalid JSON",
  async () => {
    const originalToken = Deno.env.get("SEED_TOKEN");

    Deno.env.set(
      "SEED_TOKEN",
      TEST_TOKEN,
    );

    try {
      const service = createSeedServiceStub();

      const app = createTestApplication(
        service,
      );

      const response = await handleRequest(
        app,
        "/internal/seed",
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${TEST_TOKEN}`,
            "content-type": "application/json",
          },
          body: "{invalid-json",
        },
      );

      if (
        response.status !== 400
      ) {
        throw new Error(
          `Expected status 400, received ${response.status}.`,
        );
      }

      const body = await response.json() as {
        error: string;
      };

      if (
        body.error !==
          "Invalid JSON payload."
      ) {
        throw new Error(
          `Unexpected error response: ${body.error}.`,
        );
      }
    } finally {
      restoreEnv(
        "SEED_TOKEN",
        originalToken,
      );
    }
  },
);

Deno.test(
  "POST /internal/seed returns 409 for an incompatible schema version",
  async () => {
    const originalToken = Deno.env.get("SEED_TOKEN");

    Deno.env.set(
      "SEED_TOKEN",
      TEST_TOKEN,
    );

    let seedCalled = false;

    try {
      const service: SeedServicePort = {
        seed(): Promise<void> {
          seedCalled = true;

          return Promise.resolve();
        },
      };

      const app = createTestApplication(
        service,
      );

      const incompatiblePayload: SeedPayload = {
        ...TEST_SEED_PAYLOAD,

        manifest: {
          ...TEST_SEED_PAYLOAD.manifest,

          /*
           * Structurally valid, but intentionally newer
           * than the API understands.
           */
          schemaVersion: 999,
        },
      };

      const response = await handleRequest(
        app,
        "/internal/seed",
        {
          method: "POST",

          headers: {
            authorization: `Bearer ${TEST_TOKEN}`,

            "content-type": "application/json",
          },

          body: JSON.stringify(
            incompatiblePayload,
          ),
        },
      );

      if (
        response.status !== 409
      ) {
        throw new Error(
          `Expected status 409, received ${response.status}.`,
        );
      }

      const body = await response.json() as {
        error: string;
      };

      if (
        body.error !==
          "Incompatible seed schema version."
      ) {
        throw new Error(
          `Unexpected error response: ${body.error}.`,
        );
      }

      if (seedCalled) {
        throw new Error(
          "SeedServicePort.seed() must not be called for an incompatible schema.",
        );
      }
    } finally {
      restoreEnv(
        "SEED_TOKEN",
        originalToken,
      );
    }
  },
);

Deno.test(
  "POST /internal/seed returns 500 when seeding fails",
  async () => {
    const originalToken = Deno.env.get("SEED_TOKEN");

    Deno.env.set(
      "SEED_TOKEN",
      TEST_TOKEN,
    );

    try {
      const service: SeedServicePort = {
        seed(): Promise<void> {
          return Promise.reject(
            new Error(
              "Intentional seed failure.",
            ),
          );
        },
      };

      const app = createTestApplication(
        service,
      );

      const response = await handleRequest(
        app,
        "/internal/seed",
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${TEST_TOKEN}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(
            TEST_SEED_PAYLOAD,
          ),
        },
      );

      if (
        response.status !== 500
      ) {
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
          `Expected "Internal server error.", received "${body.error}".`,
        );
      }
    } finally {
      restoreEnv(
        "SEED_TOKEN",
        originalToken,
      );
    }
  },
);

Deno.test(
  "POST /internal/seed seeds content with valid authorization",
  async () => {
    const originalToken = Deno.env.get("SEED_TOKEN");

    Deno.env.set(
      "SEED_TOKEN",
      TEST_TOKEN,
    );

    let receivedPayload: SeedPayload | undefined;

    try {
      const service: SeedServicePort = {
        seed(
          payload: SeedPayload,
        ): Promise<void> {
          receivedPayload = payload;

          return Promise.resolve();
        },
      };

      const app = createTestApplication(
        service,
      );

      const response = await handleRequest(
        app,
        "/internal/seed",
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${TEST_TOKEN}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(
            TEST_SEED_PAYLOAD,
          ),
        },
      );

      if (
        response.status !== 204
      ) {
        throw new Error(
          `Expected status 204, received ${response.status}.`,
        );
      }

      if (!receivedPayload) {
        throw new Error(
          "Expected SeedService.seed() to be called.",
        );
      }

      if (
        receivedPayload
          .profile.id !==
          TEST_SEED_PAYLOAD.profile.id
      ) {
        throw new Error(
          "Expected seed payload to be passed to SeedService.",
        );
      }
    } finally {
      restoreEnv(
        "SEED_TOKEN",
        originalToken,
      );
    }
  },
);

function createTestApplication(
  service: SeedServicePort,
): Application {
  const app = new Application();

  const router = new Router();

  registerSeedRoutes(
    router,
    service,
  );

  app.use(
    errorMiddleware,
  );

  app.use(
    router.routes(),
  );

  app.use(
    router.allowedMethods(),
  );

  return app;
}

function createSeedServiceStub(): SeedServicePort {
  return {
    seed(): Promise<void> {
      return Promise.resolve();
    },
  };
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

function restoreEnv(
  name: string,
  value: string | undefined,
): void {
  if (value === undefined) {
    Deno.env.delete(name);
    return;
  }

  Deno.env.set(
    name,
    value,
  );
}
