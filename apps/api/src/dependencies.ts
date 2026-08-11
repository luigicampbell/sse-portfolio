import { env } from "./config/env.ts";
import { PdfCvRenderer } from "./cv/pdf-cv.renderer.ts";
import { DenoKvPortfolioRepository } from "./repositories/deno-kv-portfolio.repository.ts";
import type { PortfolioRepository } from "./repositories/portfolio.repository.ts";
import { PostgresPortfolioRepository } from "./repositories/postgres-portfolio.repository.ts";
import { CvService } from "./services/cv.service.ts";
import { PortfolioService } from "./services/portfolio.service.ts";
import { SeedService } from "./services/seed.service.ts";

function createRepository(): PortfolioRepository {
  switch (env.storageDriver) {
    case "kv":
      return new DenoKvPortfolioRepository(env.kvPath);

    case "postgres": {
      const databaseUrl = Deno.env.get("DATABASE_URL");

      if (!databaseUrl) {
        throw new Error(
          "DATABASE_URL is required when STORAGE_DRIVER=postgres.",
        );
      }

      return new PostgresPortfolioRepository(databaseUrl);
    }

    default: {
      const exhaustiveCheck: never = env.storageDriver;

      throw new Error(
        `Unsupported storage driver: ${exhaustiveCheck}`,
      );
    }
  }
}

export const portfolioRepository = createRepository();

export const seedService = new SeedService(
  portfolioRepository,
);

export const portfolioService = new PortfolioService(
  portfolioRepository,
);

const cvRenderer = new PdfCvRenderer();

export const cvService = new CvService(
  portfolioService,
  cvRenderer,
);
