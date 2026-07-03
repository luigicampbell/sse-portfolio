import type { PortfolioService } from "../services/portfolio.service.ts";

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

export async function handlePortfolioRoute(
  request: Request,
  service: PortfolioService,
): Promise<Response | null> {
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.pathname !== "/api/portfolio"
  ) {
    return null;
  }

  return json(
    await service.getPortfolioPage(),
  );
}
