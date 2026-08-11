import type { Router } from "@oak/oak/router";

import {
  type PortfolioService,
  ProjectNotFoundError,
} from "../../services/portfolio.service.ts";

export function registerPortfolioRoutes(
  router: Router,
  service: PortfolioService,
): void {
  router.get(
    "/api/v1/portfolio",
    async (context) => {
      context.response.status = 200;
      context.response.type = "application/json";
      context.response.body = await service.getPortfolioPage();
    },
  );

  router.get(
    "/api/v1/projects",
    async (context) => {
      context.response.status = 200;
      context.response.type = "application/json";
      context.response.body = await service.getProjects();
    },
  );

  router.get(
    "/api/v1/projects/:slug",
    async (context) => {
      try {
        const slug = decodeURIComponent(
          context.params.slug,
        );

        context.response.status = 200;
        context.response.type = "application/json";
        context.response.body = await service.getProject(slug);
      } catch (error) {
        if (
          error instanceof
            ProjectNotFoundError
        ) {
          context.response.status = 404;
          context.response.type = "application/json";
          context.response.body = {
            error: "Project not found.",
          };

          return;
        }

        throw error;
      }
    },
  );
}
