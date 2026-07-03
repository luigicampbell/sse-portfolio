import { env } from "./config/env.ts";
import { portfolioService } from "./dependencies.ts";
import { handlePortfolioRoute } from "./routes/portfolio.routes.ts";

function json(
  data: unknown,
  init: ResponseInit = {},
): Response {
  const headers = new Headers(init.headers);

  headers.set(
    "content-type",
    "application/json; charset=utf-8",
  );

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

Deno.serve(
  {
    hostname: "0.0.0.0",
    port: env.apiPort,
  },
  async (request) => {
    try {
      const response = await handlePortfolioRoute(
        request,
        portfolioService,
      );

      if (response) {
        return response;
      }

      return json(
        { error: "Not found." },
        { status: 404 },
      );
    } catch (error) {
      console.error(error);

      return json(
        { error: "Internal server error." },
        { status: 500 },
      );
    }
  },
);
