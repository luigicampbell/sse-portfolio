import {
  type PortfolioService,
  ProjectNotFoundError,
} from "../services/portfolio.service.ts";

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
    request.method === "GET" &&
    url.pathname === "/api/v1/portfolio"
  ) {
    return json(
      await service.getPortfolioPage(),
    );
  }

  if (
    request.method === "GET" &&
    url.pathname === "/api/v1/projects"
  ) {
    return json(
      await service.getProjects(),
    );
  }

  const projectMatch = url.pathname.match(
    /^\/api\/v1\/projects\/([^/]+)$/,
  );

  if (
    request.method === "GET" &&
    projectMatch
  ) {
    try {
      const slug = decodeURIComponent(
        projectMatch[1],
      );

      return json(
        await service.getProject(slug),
      );
    } catch (error) {
      if (
        error instanceof
          ProjectNotFoundError
      ) {
        return json(
          { error: "Project not found." },
          { status: 404 },
        );
      }

      throw error;
    }
  }

  return null;
}
