import { TEST_SEED_PAYLOAD } from "../tests/fixtures/seed.mock.ts";
import { pushSeed } from "../scripts/seed/seed.push.ts";

// const TEST_SEED_PAYLOAD: SeedPayload = {
//   manifest: {
//     seedVersion: 0,
//     schemaVersion: 0,
//     contentVersion: "0.0.0",
//   },
//   profile: {
//     id: "profile-main",
//     name: "Test Developer",
//     eyebrow: "Portfolio",
//     headline: "Software Developer",
//     summary: [
//       {
//         text: "Test portfolio profile.",
//       },
//     ],
//     actions: [],
//     metrics: [],
//     socials: [],
//     published: true,
//     featured: true,
//     tags: [],
//     createdAt: "2026-08-11T00:00:00.000Z",
//     updatedAt: "2026-08-11T00:00:00.000Z",
//   },
//   projects: [],
//   skills: [],
//   experience: [],
//   education: [],
//   credentials: [],
//   volunteer: [],
// };

Deno.test(
  "pushSeed posts the seed payload with bearer authentication",
  async () => {
    let receivedRequest: Request | undefined;

    const fetcher: typeof fetch = (
      request,
      init,
    ) => {
      receivedRequest = new Request(
        request,
        init,
      );

      return Promise.resolve(
        new Response(null, {
          status: 204,
        }),
      );
    };

    await pushSeed(
      {
        baseUrl: "https://portfolio.example.com",
        token: "test-seed-token",
        payload: TEST_SEED_PAYLOAD,
      },
      fetcher,
    );

    if (!receivedRequest) {
      throw new Error(
        "Expected pushSeed() to make a request.",
      );
    }

    if (
      receivedRequest.url !==
        "https://portfolio.example.com/internal/seed"
    ) {
      throw new Error(
        `Unexpected request URL: ${receivedRequest.url}`,
      );
    }

    if (
      receivedRequest.method !==
        "POST"
    ) {
      throw new Error(
        `Expected POST, received ${receivedRequest.method}.`,
      );
    }

    if (
      receivedRequest.headers.get(
        "authorization",
      ) !==
        "Bearer test-seed-token"
    ) {
      throw new Error(
        "Expected bearer authorization header.",
      );
    }

    if (
      receivedRequest.headers.get(
        "content-type",
      ) !==
        "application/json"
    ) {
      throw new Error(
        "Expected application/json content type.",
      );
    }

    const body = await receivedRequest.json();

    if (
      JSON.stringify(body) !==
        JSON.stringify(TEST_SEED_PAYLOAD)
    ) {
      throw new Error(
        "Expected request body to contain the seed payload.",
      );
    }
  },
);
