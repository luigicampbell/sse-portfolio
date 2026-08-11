import { Router } from "@oak/oak/router";

import { cvService, portfolioService, seedService } from "./dependencies.ts";

import { registerSeedRoutes } from "./routes/internal/seed.routes.ts";

import { registerSitemapRoutes } from "./routes/public/sitemap.routes.ts";

import { registerCvRoutes } from "./routes/v1/cv.routes.ts";

import { registerHealthRoutes } from "./routes/v1/health.routes.ts";

import { registerPortfolioRoutes } from "./routes/v1/portfolio.routes.ts";

export function createRouter(): Router {
  const router = new Router();

  registerSeedRoutes(
    router,
    seedService,
  );

  registerSitemapRoutes(
    router,
    portfolioService,
  );

  registerHealthRoutes(
    router,
  );

  registerPortfolioRoutes(
    router,
    portfolioService,
  );

  registerCvRoutes(
    router,
    cvService,
  );

  return router;
}
