import { getDownloadBlob } from "../src/lib/download.ts";

Deno.test(
  "getDownloadBlob returns response blob",
  async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = () =>
      Promise.resolve(
        new Response(
          "resume",
          {
            status: 200,
            headers: {
              "content-type": "application/pdf",
            },
          },
        ),
      );

    try {
      const blob = await getDownloadBlob(
        "/api/v1/cv",
      );

      if (
        blob.type !==
          "application/pdf"
      ) {
        throw new Error(
          `Expected PDF blob, received ${blob.type}.`,
        );
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  },
);

Deno.test(
  "getDownloadBlob rejects failed responses",
  async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = () =>
      Promise.resolve(
        new Response(
          null,
          {
            status: 500,
          },
        ),
      );

    try {
      let failed = false;

      try {
        await getDownloadBlob(
          "/api/v1/cv",
        );
      } catch {
        failed = true;
      }

      if (!failed) {
        throw new Error(
          "Expected failed download request.",
        );
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  },
);
