import { Application } from "@oak/oak/application";
import { Router } from "@oak/oak/router";

import { registerCvRoutes } from "../src/routes/v1/cv.routes.ts";
import type { CvService } from "../src/services/cv.service.ts";

const PDF_BYTES = new Uint8Array([
  0x25,
  0x50,
  0x44,
  0x46,
  0x2d,
  0x31,
  0x2e,
  0x37,
]);

const TEST_FILE_NAME = "test-developer-cv.pdf";

Deno.test(
  "GET /api/v1/cv returns a downloadable PDF",
  async () => {
    const service = createCvServiceStub();

    const app = createTestApplication(service);

    const response = await handleRequest(
      app,
      "/api/v1/cv",
    );

    if (response.status !== 200) {
      throw new Error(
        `Expected status 200, received ${response.status}.`,
      );
    }

    const contentType = response.headers.get(
      "content-type",
    );

    if (
      !contentType?.includes(
        "application/pdf",
      )
    ) {
      throw new Error(
        `Expected application/pdf, received ${contentType}.`,
      );
    }

    const contentDisposition = response.headers.get(
      "content-disposition",
    );

    const expectedContentDisposition =
      `attachment; filename="${TEST_FILE_NAME}"`;

    if (
      contentDisposition !==
        expectedContentDisposition
    ) {
      throw new Error(
        `Expected content-disposition ${expectedContentDisposition}, received ${contentDisposition}.`,
      );
    }

    const cacheControl = response.headers.get(
      "cache-control",
    );

    if (
      cacheControl !==
        "private, no-cache"
    ) {
      throw new Error(
        `Expected cache-control private, no-cache, received ${cacheControl}.`,
      );
    }

    const contentLength = response.headers.get(
      "content-length",
    );

    const expectedContentLength = String(PDF_BYTES.byteLength);

    if (
      contentLength !==
        expectedContentLength
    ) {
      throw new Error(
        `Expected content-length ${expectedContentLength}, received ${contentLength}.`,
      );
    }

    const body = new Uint8Array(
      await response.arrayBuffer(),
    );

    assertBytesEqual(
      body,
      PDF_BYTES,
    );
  },
);

Deno.test(
  "POST /api/v1/cv is rejected by allowedMethods",
  async () => {
    const service = createCvServiceStub();

    const app = createTestApplication(service);

    const response = await handleRequest(
      app,
      "/api/v1/cv",
      {
        method: "POST",
      },
    );

    if (response.status !== 405) {
      throw new Error(
        `Expected status 405, received ${response.status}.`,
      );
    }

    const allow = response.headers.get("allow");

    if (!allow?.includes("GET")) {
      throw new Error(
        `Expected Allow header to include GET, received ${allow}.`,
      );
    }
  },
);

function createTestApplication(
  service: CvService,
): Application {
  const app = new Application();

  const router = new Router();

  registerCvRoutes(
    router,
    service,
  );

  app.use(
    router.routes(),
  );

  app.use(
    router.allowedMethods(),
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

function createCvServiceStub(): CvService {
  const service = {
    generate() {
      return Promise.resolve({
        bytes: PDF_BYTES,
        contentType: "application/pdf",
        fileName: TEST_FILE_NAME,
      });
    },
  };

  return service as CvService;
}

function assertBytesEqual(
  actual: Uint8Array,
  expected: Uint8Array,
): void {
  if (
    actual.byteLength !==
      expected.byteLength
  ) {
    throw new Error(
      `Expected ${expected.byteLength} response bytes, received ${actual.byteLength}.`,
    );
  }

  for (
    let index = 0;
    index < expected.length;
    index++
  ) {
    if (
      actual[index] !==
        expected[index]
    ) {
      throw new Error(
        `PDF response differs at byte ${index}.`,
      );
    }
  }
}
