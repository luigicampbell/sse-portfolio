import { Router } from "@oak/oak/router";

import { portfolioService } from "./dependencies.ts";
import { registerHealthRoutes } from "./routes/v1/health.routes.ts";
import { registerPortfolioRoutes } from "./routes/v1/portfolio.routes.ts";

export function createRouter(): Router {
  const router = new Router();

  registerHealthRoutes(router);

  registerPortfolioRoutes(
    router,
    portfolioService,
  );

  return router;
}
